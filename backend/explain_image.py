"""Ask a local Ollama vision model for a cautious description of an X-ray.

This module is used by the FastAPI backend (/analyze endpoint) at runtime.
It can also be run standalone for quick testing:

    .venv\\Scripts\\python.exe backend\\explain_image.py path\\to\\xray.jpg

If no path is given, it will prompt for one.
"""

import os
import sys
from pathlib import Path

import ollama as ollama_lib


MODEL_NAME = os.environ.get("OLLAMA_MODEL", "medgemma:4b")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")

def _prompt(prediction: str, cancer_score: float) -> str:
    score_percent = cancer_score * 100
    return f"""You are providing a concise explanation for an experimental bone X-ray screening demo.
The separate image classifier returned: {prediction}.
Its raw sigmoid cancer score is {cancer_score:.4f} ({score_percent:.2f}%). This score is not a calibrated probability.
Explain this classifier result in plain language and mention the score. If the prediction is CANCER, say the model flagged the image for review; if NORMAL, say the model did not flag it. Do not present either result as a diagnosis or use the score to claim visible cancer.
You may briefly describe only image features that are visibly supported. Do not invent findings or recommend treatment. State uncertainty clearly and advise that a qualified medical professional interpret the X-ray. Keep the answer concise."""


def explain_xray(image_path: Path, prediction: str = "UNKNOWN", cancer_score: float = 0.0) -> str:
    """Send a local image and classifier result to Ollama/MedGemma."""
    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")

    client = ollama_lib.Client(host=OLLAMA_HOST)
    response = client.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": _prompt(prediction, cancer_score),
                "images": [str(image_path)],
            }
        ],
        stream=False,
        options={"temperature": 0.1},
    )
    return response.message.content or "The model returned no text."


if __name__ == "__main__":
    if len(sys.argv) > 1:
        img = Path(sys.argv[1])
    else:
        raw = input("Enter path to X-ray image: ").strip().strip('"')
        img = Path(raw)

    print(f"Image: {img}")
    print(f"Model: {MODEL_NAME}\n")
    try:
        print(explain_xray(img))
    except Exception as exc:
        raise SystemExit(
            f"Could not get an explanation: {exc}\n"
            "Check that Ollama is running and that you ran: "
            f"ollama pull {MODEL_NAME}"
        ) from exc
