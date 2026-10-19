import os
import base64
import hashlib
from cryptography.fernet import Fernet

# In production, load from environment variable / secret manager
SECRET_KEY = os.getenv("FILE_ENCRYPTION_KEY")

if not SECRET_KEY:
    SECRET_KEY = Fernet.generate_key().decode()
    print("WARNING: Generated temporary encryption key. Set FILE_ENCRYPTION_KEY in .env")


def get_fernet() -> Fernet:
    return Fernet(SECRET_KEY.encode())


def encrypt_file(file_bytes: bytes) -> bytes:
    """Encrypt X-ray before saving to disk/database."""
    return get_fernet().encrypt(file_bytes)


def decrypt_file(encrypted_bytes: bytes) -> bytes:
    """Decrypt X-ray only when an authorized user requests it."""
    return get_fernet().decrypt(encrypted_bytes)


def sha256_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def hash_json(payload: dict) -> str:
    import json
    serialized = json.dumps(payload, sort_keys=True).encode()
    return hashlib.sha256(serialized).hexdigest()