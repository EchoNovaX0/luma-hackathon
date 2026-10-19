# BoneGuard

## Run locally

You will need Node.js and Python installed. Start the backend and frontend in
separate terminals from the project root.

### Backend

Create and activate a virtual environment, install the Python dependencies, and
start the FastAPI server:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

On Windows, activate the virtual environment with:

```powershell
.venv\Scripts\Activate.ps1
```

The backend runs at <http://localhost:8000>; its interactive API docs are at
<http://localhost:8000/docs>.

### Frontend

In a separate terminal from the project root, install the npm dependencies and
start the Vite development server:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser. The frontend sends
predictions to the backend at `http://localhost:8000`.
