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

## Copy-ready v0 prompt: Refined Frontend

Paste the prompt below into v0 to generate a redesigned frontend for this project. It explicitly keeps the work frontend-only and treats analysis as a clearly labeled demo until the existing API is connected.

```text
Redesign the existing BoneGuard AI project as a complete, polished, responsive frontend for an AI-assisted bone X-ray screening prototype. This is a frontend-only task. Build the actual working web interface, not a concept image or marketing-only landing page.

PROJECT CONTEXT
- The product is an academic/research prototype for binary bone X-ray screening. It is not a certified medical device and must never be presented as a diagnosis or a replacement for a clinician.
- The current app has these routes: / (Home), /analyze (upload), /results (analysis result), /about (project/model information), and /premium (concept pricing).
- The existing app is React + TypeScript + Vite, uses React Router and Tailwind CSS, and has public/logo.png and public/img.jpg. Preserve this stack and integrate with the existing project structure. Do not convert the project to Next.js or introduce a separate app.
- Implement frontend behavior with local React state and local demo data only. There is no backend for this task.

STRICT SCOPE
- Do not create, change, or require a backend, API route, database, authentication, payment provider, external AI service, or model inference.
- Do not make network requests. Do not point to localhost or invent an API URL.
- Make the analysis journey usable in demo mode: selecting a PNG/JPG shows a local preview; clicking Analyze shows a short loading state and then a clearly identified simulated example result. Put a persistent, unambiguous label near the result such as "Demo result — simulated, not generated by an AI model." Never imply that the uploaded image was medically assessed.
- Keep upload, validation, loading, error, empty, reset, and result states functional. Support click-to-select and drag-and-drop. Validate PNG/JPG in the browser, provide accessible error messages, and let the user remove or replace the selected image. Use a managed object URL or another approach that cleans up preview resources.
- The About page must not present fabricated accuracy, precision, recall, confusion-matrix counts, or training charts as verified facts. Omit those claims or clearly identify any illustrative values as placeholders. Explain the prototype and its limitations honestly.
- Premium is only a visual concept page. Do not implement checkout, subscriptions, or active purchase actions; label plans as concepts or use disabled/non-committal actions.
- Do not claim uploaded images are securely processed by a server or stored nowhere unless the UI accurately describes local-only demo behavior.

PRODUCT EXPERIENCE
- Build a cohesive clinical decision-support workspace for radiology and orthopedic professionals: calm, precise, trustworthy, and designed for repeated use. Favor a compact application shell, clear navigation, readable scan controls, and useful content density over oversized marketing sections or decorative nested cards.
- Include a responsive top navigation with BoneGuard identity, links to Home, Analyze, About, and Premium, a clear primary action to start an analysis, and a usable mobile navigation.
- Home: make the product identity and X-ray screening workflow immediately clear. Include a primary Start Analysis action, a concise research-prototype disclaimer, and a compact explanation of the three steps (select image, review simulated demo, consult a qualified professional). Do not invent performance claims or patient statistics.
- Analyze: provide a strong upload dropzone with browse button, supported file types, validation, selected filename, a usable image preview, remove/replace control, and a prominent Analyze button. Provide a small privacy/demo notice that explains no backend inference occurs in this version.
- Results: show the original image and a well-organized result summary, but label all output as simulated demo data. Distinguish the example cancer score from class confidence; do not call it a verified probability or certainty. Include a next-step action to analyze another image and a visible medical disclaimer. Make direct navigation or missing demo state fail gracefully with a return-to-upload action.
- About: explain the prototype, the high-level intended workflow, and the known limitations. Do not display unverifiable training metrics or random charts.
- Premium: present the existing concept tiers only if useful, clearly marked as non-functional concept pricing. No checkout or account claims.
- Add polished loading, empty, invalid-file, failed-demo, and success/demo states. Ensure keyboard operation, visible focus, semantic labels, sufficient contrast, and sensible screen-reader announcements.

VISUAL DIRECTION
- Create a refined, editorial medical-workspace aesthetic: warm white or very pale neutral canvas, dark ink typography, restrained teal/green for clinical navigation, and a limited coral/orange accent reserved for warnings. Avoid default purple gradients, generic blue SaaS styling, and a wall of rounded cards.
- Use typography with a clear hierarchy and a purposeful display face paired with a highly readable interface face. Keep text comfortable at mobile sizes and avoid viewport-scaled font sizes.
- Use fine borders, strong alignment, whitespace, subtle texture or a restrained grid, and small purposeful transitions. Avoid decorative gradient blobs, stock-photo hero layouts, excessive glass effects, and unnecessary animation.
- Use the existing logo asset if suitable. Use X-ray imagery only where it helps the user understand or inspect the workflow; never imply a sample image or simulated result is real patient data. Do not invent patient identities or clinical annotations.
- Make desktop layouts efficient and mobile layouts fully usable without horizontal overflow. Keep image previews at stable aspect ratios and ensure controls do not shift when stIMPLEMENTATION EXPECTATIONS
- Use reusable React components and TypeScript types for shared UI and analysis state. Keep routing compatible with the current React Router app and adapt the existing page/component structure where practical.
- Use the dependencies already present in the project when possible. Do not add backend packages or unnecessary dependencies.
- Keep the demo result generator isolated in a small frontend-only function so a real API can be connected later, but do not implement that API connection now.
- Ensure every visible button/link has a meaningful action or is clearly disabled. Do not leave placeholder links, dead CTAs, or browser alerts as the primary feedback mechanism.
ate changes.

- Deliver all code needed for the frontend screens and interactions, and ensure the project builds with its existing Vite scripts.
```
