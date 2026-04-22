from pathlib import Path
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import GraphResponse, OptimizeRequest, OptimizeResponse
from app.services.graph_service import GraphService


BASE_DIR = Path(__file__).resolve().parents[1]
service = GraphService(BASE_DIR)

app = FastAPI(
    title="AI Supply Chain Optimization API",
    version="1.0.0",
    description="Optimize bakery and ready-to-eat supply chain routes using graph algorithms.",
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/nodes", response_model=list[str])
def get_nodes() -> list[str]:
    return service.list_nodes()


@app.get("/graph", response_model=GraphResponse)
def get_graph() -> GraphResponse:
    return GraphResponse(nodes=service.list_nodes(), edges=service.list_edges())


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(payload: OptimizeRequest) -> OptimizeResponse:
    if payload.source not in service.graph.nodes:
        raise HTTPException(status_code=400, detail=f"Source node '{payload.source}' does not exist.")
    if payload.destination not in service.graph.nodes:
        raise HTTPException(status_code=400, detail=f"Destination node '{payload.destination}' does not exist.")

    result = service.optimize(payload.source, payload.destination, payload.disrupted)
    return OptimizeResponse(**result)
