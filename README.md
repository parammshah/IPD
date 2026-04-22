# AI Supply Chain Optimization Web App

Production-friendly full-stack app for optimizing bakery and ready-to-eat supply routes.

## Stack
- Frontend: React + Vite + Tailwind CSS + vis-network
- Backend: FastAPI + NetworkX

## Project Structure
- `frontend/` client app
- `backend/` API and graph optimization service
- `backend/data/` CSV graph data source

## Local Development

### 1) Backend
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies API requests to backend.

## Deployment Notes
- Set frontend env `VITE_API_BASE_URL` to deployed backend URL when not using proxy.
- Set backend env `ALLOWED_ORIGINS` with comma-separated frontend origins.
- Ensure `backend/data/Nodes.csv` and `backend/data/Edges (Plant).csv` are present in runtime image.
