import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from cryptography.fernet import Fernet
import io
import os
import uuid
import time
import hashlib
import json
import tempfile
from pathlib import Path
try:
    from .explain_image import explain_xray
except ImportError:
    from explain_image import explain_xray


# ---------------------------------------------------
# App Setup
# ---------------------------------------------------

app = FastAPI(title="BoneGuard AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------
# Paths & Device
# ---------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "bone_cancer_best_model.pth")
ENCRYPTED_UPLOAD_DIR = os.path.join(BASE_DIR, "encrypted_uploads")

os.makedirs(ENCRYPTED_UPLOAD_DIR, exist_ok=True)

print("Loading model from:", MODEL_PATH)
print("File exists:", os.path.exists(MODEL_PATH))

DEVICE = torch.device("cpu")


# ---------------------------------------------------
# Encryption Setup
# ---------------------------------------------------

# For development only.
# In production, set this in a .env file or secret manager:
# FILE_ENCRYPTION_KEY=<your-generated-key>
FILE_ENCRYPTION_KEY = os.getenv("FILE_ENCRYPTION_KEY")

if not FILE_ENCRYPTION_KEY:
    FILE_ENCRYPTION_KEY = Fernet.generate_key().decode()
    print("WARNING: Generated temporary encryption key.")
    print("Set FILE_ENCRYPTION_KEY in your environment for persistent encryption.")

fernet = Fernet(FILE_ENCRYPTION_KEY.encode())


def encrypt_file(file_bytes: bytes) -> bytes:
    return fernet.encrypt(file_bytes)


def decrypt_file(encrypted_bytes: bytes) -> bytes:
    return fernet.decrypt(encrypted_bytes)


def sha256_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def hash_json(payload: dict) -> str:
    serialized = json.dumps(payload, sort_keys=True).encode()
    return hashlib.sha256(serialized).hexdigest()


# ---------------------------------------------------
# Simple Blockchain Audit Layer
# ---------------------------------------------------

class SimpleBlockchain:
    def __init__(self):
        self.chain = []
        self.create_genesis_block()

    def create_genesis_block(self):
        timestamp = int(time.time())
        genesis_data = {"message": "BoneGuard Genesis Block"}
        previous_hash = "0"

        block = {
            "index": 0,
            "timestamp": timestamp,
            "data": genesis_data,
            "previous_hash": previous_hash,
        }
        block["hash"] = self.calculate_hash(block)

        self.chain.append(block)

    def calculate_hash(self, block: dict) -> str:
        block_string = json.dumps(
            {
                "index": block["index"],
                "timestamp": block["timestamp"],
                "data": block["data"],
                "previous_hash": block["previous_hash"],
            },
            sort_keys=True,
        ).encode()

        return hashlib.sha256(block_string).hexdigest()

    def add_block(self, data: dict) -> dict:
        previous_block = self.chain[-1]

        block = {
            "index": len(self.chain),
            "timestamp": int(time.time()),
            "data": data,
            "previous_hash": previous_block["hash"],
        }

        block["hash"] = self.calculate_hash(block)
        self.chain.append(block)

        return block

    def find_by_image_hash(self, image_hash: str):
        for block in self.chain:
            if block["data"].get("image_hash") == image_hash:
                return block
        return None


blockchain = SimpleBlockchain()


# ---------------------------------------------------
# Load Model
# ---------------------------------------------------

model = models.resnet18(weights=None)

model.conv1 = nn.Conv2d(
    in_channels=1,
    out_channels=64,
    kernel_size=7,
    stride=2,
    padding=3,
    bias=False
)

model.fc = nn.Linear(model.fc.in_features, 1)

try:
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
except Exception as e:
    raise RuntimeError(f"Error loading model: {e}")

model.to(DEVICE)
model.eval()


# ---------------------------------------------------
# Image Transform
# ---------------------------------------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=1),
    transforms.ToTensor()
])


# ---------------------------------------------------
# Routes
# ---------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "Backend running 🚀",
        "blockchain_blocks": len(blockchain.chain),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        if file.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(
                status_code=400,
                detail="Only PNG or JPEG images are supported."
            )

        # Read original uploaded X-ray
        image_bytes = await file.read()

        # Hash the original image before encryption
        image_hash = sha256_hash(image_bytes)

        # Run AI inference
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = transform(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            output = model(image)
            probability = torch.sigmoid(output).item()

        prediction = "CANCER" if probability >= 0.5 else "NORMAL"
        model_version = "ResNet18-BoneGuard-v1"

        # Create tamper-evident result hash
        result_payload = {
            "image_hash": image_hash,
            "prediction": prediction,
            "probability": round(probability, 4),
            "model_version": model_version,
        }

        result_hash = hash_json(result_payload)

        # Encrypt the actual X-ray before storing it
        encrypted_image = encrypt_file(image_bytes)

        file_id = str(uuid.uuid4())
        encrypted_file_path = os.path.join(
            ENCRYPTED_UPLOAD_DIR,
            f"{file_id}.enc"
        )

        with open(encrypted_file_path, "wb") as encrypted_file:
            encrypted_file.write(encrypted_image)

        # Store only hashes and metadata on blockchain
        blockchain_record = blockchain.add_block(
            {
                "event": "XRAY_ANALYSIS_COMPLETED",
                "image_hash": image_hash,
                "result_hash": result_hash,
                "prediction": prediction,
                "probability": round(probability, 4),
                "model_version": model_version,
                "encrypted_file_id": file_id,
            }
        )

        return {
            "probability": round(probability, 4),
            "prediction": prediction,
            "image_hash": image_hash,
            "result_hash": result_hash,
            "file_id": file_id,
            "block_number": blockchain_record["index"],
            "block_hash": blockchain_record["hash"],
            "previous_hash": blockchain_record["previous_hash"],
            "timestamp": blockchain_record["timestamp"],
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """Classify an X-ray, then ask MedGemma to explain that result and score."""
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only PNG or JPEG images are supported.")

    image_bytes = await file.read()
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = transform(image).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            cancer_score = float(torch.sigmoid(model(tensor)).item())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}") from exc

    prediction = "CANCER" if cancer_score >= 0.5 else "NORMAL"
    result = {
        "prediction": prediction,
        "cancer_score": round(cancer_score, 4),
        "explanation": "",
        "explanation_status": "unavailable",
        "explanation_error": "",
    }
    temp_path = None
    try:
        suffix = ".png" if file.content_type == "image/png" else ".jpg"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name
        result["explanation"] = explain_xray(Path(temp_path), prediction, cancer_score)
        result["explanation_status"] = "available"
    except Exception as exc:
        result["explanation_error"] = (
            f"MedGemma is unavailable: {exc}. Ensure Ollama is running and the model is pulled."
        )
    finally:
        if temp_path:
            try:
                os.remove(temp_path)
            except OSError:
                pass
    return result


@app.get("/verify/{image_hash}")
async def verify_analysis(image_hash: str):
    block = blockchain.find_by_image_hash(image_hash)

    if not block:
        raise HTTPException(
            status_code=404,
            detail="No blockchain record found for this image hash."
        )

    return {
        "verified": True,
        "block_number": block["index"],
        "block_hash": block["hash"],
        "previous_hash": block["previous_hash"],
        "timestamp": block["timestamp"],
        "prediction": block["data"]["prediction"],
        "probability": block["data"]["probability"],
        "model_version": block["data"]["model_version"],
    }


@app.get("/blockchain/stats")
async def blockchain_stats():
    return {
        "total_blocks": len(blockchain.chain),
        "latest_block_hash": blockchain.chain[-1]["hash"],
        "latest_block_index": blockchain.chain[-1]["index"],
    }
