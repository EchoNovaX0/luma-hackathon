# BoneGuard AI

**A research and hackathon prototype for bone X-ray screening.** BoneGuard combines a React upload and results interface, a FastAPI service, a PyTorch ResNet-18 binary image classifier, and a local Ollama vision-language model (MedGemma) for an experimental, independent image description.

> **Research use only.** BoneGuard is not a medical device and must not be used to diagnose, rule out, triage, or treat cancer. Model outputs may be wrong, incomplete, or poorly calibrated. A qualified clinician must interpret imaging and make all care decisions.

## Contents

- [What the app does today](#what-the-app-does-today)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Setup on Windows](#setup-on-windows)
- [Run BoneGuard](#run-boneguard)
- [Run the MedGemma image explainer (standalone)](#run-the-medgemma-image-explainer-standalone)
- [API reference](#api-reference)
- [Environment configuration](#environment-configuration)
- [Project layout](#project-layout)
- [Limitations and responsible use](#limitations-and-responsible-use)
- [Troubleshooting](#troubleshooting)

## What the app does today

1. The React app accepts a PNG or JPEG X-ray and previews it.
2. The frontend uploads the image to the FastAPI `/analyze` endpoint.
3. The backend converts the image to grayscale, resizes it to 224 × 224, and runs a locally stored ResNet-18 checkpoint. It returns a sigmoid cancer score and a `CANCER` or `NORMAL` label using a 0.5 threshold.
4. In parallel, the backend sends the same uploaded image to the locally running MedGemma vision-language model via Ollama for an independent, AI-generated description of visible image features.
5. The frontend displays the classifier result and the MedGemma description side by side. If MedGemma is unavailable, the classifier result is still shown with a clear message.

**The MedGemma description is independent and experimental.** It does not see the classifier's score or label, and it is not asked to confirm or justify the classification. It may hallucinate findings.

## Architecture

```text
React + Vite frontend
        │  POST /analyze (multipart image)
        ▼
FastAPI backend
   ├── PyTorch ResNet-18 ─── .pth checkpoint ─── classifier result
   └── Ollama Python client ─── MedGemma 4B (local) ─── image description
```

The classifier and VLM are separate, independent components. **The ResNet classifier returns a cancer score only. It does not return a bounding box, segmentation mask, or tumor crop.** No localization or detection is implemented.

## Requirements

- Windows 10 or 11
- Python 3.10 or later (a project `.venv` may already exist)
- Node.js and npm
- [Ollama](https://ollama.com/download) installed and running for MedGemma descriptions
- Enough disk space for Python packages, model checkpoints, and the local Ollama model

The code selects CPU for the ResNet backend today. Ollama selects available inference hardware based on its installation and configuration. An RTX 4060 Laptop can run the 4B quantized Ollama model in many setups, but actual available VRAM and speed depend on the laptop and other processes.

## Setup on Windows

Open PowerShell in the repository root.

### 1. Install Python dependencies

If `.venv` already exists:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

If you need to create it:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

PyTorch installation can depend on the Python version and whether you want CUDA support for the backend. The current backend explicitly uses CPU (`DEVICE = torch.device("cpu")`). If you later switch the detector to CUDA, install the PyTorch build that matches your installed NVIDIA driver and CUDA support using the [official PyTorch selector](https://pytorch.org/get-started/locally/).

### 2. Install frontend dependencies

```powershell
npm install
```

### 3. Check the model checkpoint

The backend loads:

```text
model/bone_cancer_best_model.pth
```

That file is included in this project. Do not rename or move it unless you also update `MODEL_PATH` in `backend/main.py`.

### 4. Install and set up Ollama

1. Download and install [Ollama](https://ollama.com/download).
2. Pull the MedGemma model (one-time download, ~3 GB):

   ```powershell
   ollama pull medgemma:4b
   ```

3. Verify it's available:

   ```powershell
   ollama list
   ```

   You should see `medgemma:4b` in the output.

Ollama must be running before starting the backend if you want MedGemma descriptions. If Ollama is not running, the classifier still works — the MedGemma description will show as "unavailable" in the UI.

## Run BoneGuard

Start Ollama (if not already running as a service):

```powershell
ollama serve
```

Start the backend in one PowerShell window from the repository root:

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Check that the backend responds at [http://127.0.0.1:8000/](http://127.0.0.1:8000/). Interactive API documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Start the frontend in a second PowerShell window:

```powershell
npm run dev
```

Open the local URL Vite prints (usually [http://localhost:5173](http://localhost:5173)), choose **Analyze**, upload a PNG/JPG, and submit it. The frontend calls `http://localhost:8000/analyze` and displays the classifier result plus the MedGemma description.

## Run the MedGemma image explainer (standalone)

The standalone script can still be used for quick testing outside the web app:

```powershell
.\.venv\Scripts\Activate.ps1
python backend\explain_image.py path\to\xray.jpg
```

If no path argument is given, the script will prompt for one. It reads `OLLAMA_MODEL` and `OLLAMA_HOST` from environment variables (defaults: `medgemma:4b` and `http://localhost:11434`).

## API reference

### `GET /`

Health check.

Example response:

```json
{"status":"Backend running 🚀"}
```

### `POST /analyze`

**Primary endpoint.** Upload one image as multipart form data using the field name `file`. Accepted formats are PNG and JPEG.

The backend runs the classifier and MedGemma in parallel. If the classifier succeeds but MedGemma fails, the response still includes the classifier result with `explanation_status` indicating the issue.

Example response (both models succeed):

```json
{
  "prediction": "CANCER",
  "cancer_score": 0.8123,
  "explanation": "The image shows an AP radiograph of the distal femur...",
  "explanation_status": "available"
}
```

Example response (MedGemma unavailable):

```json
{
  "prediction": "NORMAL",
  "cancer_score": 0.1234,
  "explanation": "",
  "explanation_status": "unavailable",
  "explanation_error": "MedGemma is unavailable: ... Ensure Ollama is running and the model is pulled."
}
```

Fields:

| Field | Type | Description |
|-------|------|-------------|
| `prediction` | string | `"CANCER"` or `"NORMAL"` based on a 0.5 threshold |
| `cancer_score` | number | The classifier's raw sigmoid output (0–1). Not a calibrated probability. |
| `explanation` | string | MedGemma's AI-generated description, or empty if unavailable |
| `explanation_status` | string | `"available"`, `"unavailable"`, or `"empty"` |
| `explanation_error` | string | (Optional) Human-readable error message when explanation is not available |

The `explanation` is produced independently: MedGemma does not see the classifier's score or label. It is AI-generated and experimental — not a diagnosis.

### `POST /predict`

**Legacy endpoint** kept for backward compatibility. Returns classifier results only (no MedGemma). Same `file` field.

Example response:

```json
{
  "probability": 0.8123,
  "prediction": "CANCER"
}
```

## Environment configuration

The backend reads these environment variables (all optional, with sensible defaults):

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_MODEL` | `medgemma:4b` | Ollama model tag for image descriptions |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama API host URL |

See `backend/.env.example` for a template. Do not put secrets in this file.

## Project layout

```text
backend/
  main.py             FastAPI app: /predict (legacy), /analyze (classifier + MedGemma)
  explain_image.py    Standalone Ollama/MedGemma image description CLI tool
  requirements.txt    Python dependencies
  .env.example        Environment variable template
model/
  bone_cancer_best_model.pth  Checkpoint loaded by the API
  bone_cancer_model.pth       Additional checkpoint file
src/
  App.tsx             React route setup
  pages/              Landing, upload, results, and information pages
  components/         Shared UI, navigation, and footer components
public/               Static assets
package.json          Frontend scripts and dependencies
```

## Limitations and responsible use

- This is a prototype, not a validated medical product. It is not suitable for patient care.
- The binary classifier's output depends on its training data, preprocessing, checkpoint, and threshold. A high score does not establish a diagnosis; a low score does not rule one out.
- **No localization is implemented:** there is no bounding box, segmentation mask, or model-generated crop in the current backend or frontend.
- MedGemma's prose is a separate, independently generated description and may hallucinate imaging findings. It does not verify or justify the classifier's result.
- The cancer score displayed in the UI is the classifier's raw sigmoid output. It is not a clinically calibrated probability.
- Only use images you are authorized to process. De-identify images and remove patient metadata before using them in a demo. Although Ollama runs locally, protect local files and logs as sensitive data.
- Review the [MedGemma model card and terms](https://huggingface.co/google/medgemma-4b-it) before use or redistribution. Google describes MedGemma as a starting point for developer adaptation and says its output should not directly drive clinical decisions.

## Troubleshooting

### Backend reports that the checkpoint is missing

Run the backend from the repository root and confirm that `model/bone_cancer_best_model.pth` exists. The backend prints the resolved checkpoint path at startup.

### Frontend says it cannot connect to the backend

Confirm Uvicorn is still running on port 8000. Visit `/` or `/docs` in a browser to check it. If you change the backend port, update the URL in `src/pages/AnalyzePage.tsx`.

### MedGemma description shows as "unavailable"

1. Confirm Ollama is installed and running:
   ```powershell
   ollama list
   ```
2. Pull the model if not listed:
   ```powershell
   ollama pull medgemma:4b
   ```
3. Check that the Ollama host matches your configuration (default `http://localhost:11434`).

The classifier result will still be returned even if MedGemma is unavailable.

### `ollama` command or Python connection fails

Confirm Ollama is installed and running, then run:

```powershell
ollama list
ollama pull medgemma:4b
```

If Python reports `No module named 'ollama'`, activate `.venv` and reinstall `backend/requirements.txt`.

### Ollama runs out of memory or is slow

Close other GPU-heavy applications, use the 4B model rather than the 27B model, and reduce the input image dimensions if necessary. The ResNet API currently runs on CPU, but other running GPU tasks can still reduce available VRAM.
