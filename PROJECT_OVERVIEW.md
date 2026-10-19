# BoneGuard AI: Project Overview

## What the project does

BoneGuard AI is a web application prototype for binary bone X-ray screening. A user can select a PNG or JPEG image in the browser, submit it to a FastAPI service, and view the service's model output as either **Cancer Detected** or **No Cancer Detected**, alongside the returned score and an image preview.

The repository contains a React/Vite user interface, a Python/FastAPI inference API, and serialized PyTorch model checkpoints. It does not contain model-training code or a dataset, so the training process and the clinical validity of the checkpoints cannot be verified from this repository alone. The application describes itself as research/decision support, not as a replacement for clinical diagnosis.

## User-facing application

The single-page React application uses React Router. Its routes are:

| Route | Purpose | Actual behavior |
|---|---|---|
| `/` | Landing page | Introduces the screening concept and links to the analysis page. The "Learn More" button currently has no action. |
| `/analyze` | Image submission | Lets the user select one PNG or JPEG, previews it, and posts it to the backend. Despite the drag-and-drop wording, there are no drag-and-drop event handlers; selection is through the file picker. |
| `/results` | Results display | Shows the submitted image and prediction received from the API. Results are passed through in-memory router state; refreshing or directly opening this route loses the result and shows an upload prompt. |
| `/about` | Model dashboard | Shows model-related copy, metric labels, and charts. The chart series are generated randomly in the browser, and the summary values are hard-coded; they are not loaded from a training run or evaluation service. |
| `/premium` | Pricing presentation | Displays three pricing tiers and feature lists. There is no payment, account, subscription, or premium feature implementation in this repository. |

The navigation bar links to Home, Analyze, and About; its Premium button opens `/premium`. The shared page shell includes a footer. The frontend is styled with Tailwind CSS and uses Lucide icons, Recharts, and Framer Motion.

## Image-analysis flow

1. The browser accepts a `.png` or `.jpg`/`.jpeg` selection through a file input and displays a local preview using `FileReader`.
2. Selecting **Analyze Image** sends a `multipart/form-data` POST request with a field named `file` to `http://localhost:8000/predict`.
3. The backend reads the uploaded bytes, opens the image with Pillow, converts it to RGB, then transforms it to grayscale, resizes it to 224 × 224 pixels, and converts it to a tensor.
4. A ResNet-18 model modified for one input channel and one output is run on CPU. The backend applies sigmoid to the output and treats values at or above `0.5` as `CANCER`; lower values are `NORMAL`.
5. The backend returns JSON with `probability` (rounded to four decimal places) and `prediction`. The browser maps those labels to user-facing text and navigates to `/results` with the prediction and image preview in router state.

The frontend currently hard-codes the backend URL to `localhost:8000`. This works when the browser can reach that host and port, but typically needs configuration or a proxy when the UI and API are deployed separately or accessed through a remote Codespace URL.

## Backend API

The FastAPI application is in `backend/main.py` and loads its model when the Python module starts. The active checkpoint path resolves to `model/bone_cancer_best_model.pth` at the repository root.

| Method and path | Behavior |
|---|---|
| `GET /` | Returns a small JSON status response when the app has started successfully. |
| `POST /predict` | Expects a multipart upload field named `file`; returns `{"probability": number, "prediction": "CANCER" | "NORMAL"}`. |
| `GET /docs` | FastAPI's interactive API documentation, available when the development server is running. |

The service enables CORS for all origins, uses CPU inference, has no authentication, and does not intentionally persist uploaded images. The prediction handler converts processing exceptions to HTTP 500 responses. There is no explicit upload-size limit or detailed input validation in the API code.

## Model files and project layout

- `src/App.tsx`: route table and shared page shell.
- `src/pages/`: landing, upload, results, about, and premium screens.
- `src/components/`: navigation, footer, and reusable button/card components.
- `src/index.css`: Tailwind directives and shared base/component styles.
- `backend/main.py`: FastAPI setup, checkpoint loading, preprocessing, and prediction endpoint.
- `backend/requirements.txt`: Python dependencies (`fastapi`, `uvicorn`, `torch`, `torchvision`, `pillow`, `python-multipart`).
- `model/`: root-level checkpoints used by `backend/main.py`.
- `backend/model/`: another copy of both checkpoint filenames; the current backend path does not use this copy.
- `public/`: logo and landing-page image assets.
- `package.json`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, and `postcss.config.js`: frontend tooling and configuration.

Both checkpoint names (`bone_cancer_best_model.pth` and `bone_cancer_model.pth`) appear in both model directories. The code selects the root-level `bone_cancer_best_model.pth`; the repository does not explain the distinction between the two checkpoints.

## Running locally

### Frontend

From the repository root:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Vite prints the frontend URL, usually `http://localhost:5173/`.

### Backend

In a separate terminal, from the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend expects the root-level checkpoint at `../model/bone_cancer_best_model.pth` relative to `backend/`. Once started, check `http://localhost:8000/` for the status response and `http://localhost:8000/docs` for API docs. In Codespaces, forward port 8000 and ensure the frontend's hard-coded `localhost` API URL is reachable from the browser.

The dependency installation may take time because PyTorch and torchvision are large packages.

## Important implementation caveats

- **Results score semantics:** the backend returns the sigmoid output as `probability`. The results page displays that same value as "certainty" for both classes. For a `NORMAL` prediction, this is still the cancer score, not the confidence of the normal class (which would ordinarily be `1 - probability`). The UI also caps the displayed percentage at 98.76, so it does not show the raw score exactly.
- **About-page metrics:** displayed accuracy/precision/recall/F1 and false-positive/false-negative counts are hard-coded. Both sets of training curves are synthesized with random values on page load. Treat them as presentation data, not verified model evaluation.
- **Premium is informational only:** prices and feature lists do not correspond to implemented payment or account functionality.
- **Report action:** "Generate Patient Report PDF" calls the browser's `window.print()`; it does not generate a structured PDF report.
- **Upload messaging:** the UI says "Drag & drop", but only file-picker selection is implemented. The client checks image MIME type, but the server does not enforce a strict image type or maximum upload size.
- **Development-oriented security:** wildcard CORS, no authentication, and no server-side patient/session management are unsuitable defaults for a production medical service.
- **Clinical use:** the repository provides no dataset, training/evaluation pipeline, external validation, or regulatory evidence. The displayed screening result must not be treated as a diagnosis.

## Project verification status

The repository includes a frontend build script (`npm run build`) but no test files or backend test suite were found during review. This document describes behavior visible in the checked-in source; the model's learned behavior and the dashboard's claimed metrics have not been independently validated.


