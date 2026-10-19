import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io
import os

# ---------------------------------------------------
# App Setup
# ---------------------------------------------------

app = FastAPI(title="BoneGuard AI Backend")

# CORS (IMPORTANT for frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# Paths & Device
# ---------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "bone_cancer_best_model.pth")
print("Loading model from:", MODEL_PATH)
print("File exists:", os.path.exists(MODEL_PATH))


DEVICE = torch.device("cpu")

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
    return {"status": "Backend running 🚀"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        image = transform(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            output = model(image)
            prob = torch.sigmoid(output).item()

        return {
            "probability": round(prob, 4),
            "prediction": "CANCER" if prob >= 0.5 else "NORMAL"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
