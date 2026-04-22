from pydantic import BaseModel, Field


class OptimizeRequest(BaseModel):
    source: str = Field(..., description="Route source node")
    destination: str = Field(..., description="Route destination node")
    disrupted: str | None = Field(default=None, description="Optional disrupted node")


class OptimizeResponse(BaseModel):
    original_path: list[str] | None
    optimized_path: list[str] | None
    cost: float | None
    message: str | None = None


class GraphResponse(BaseModel):
    nodes: list[str]
    edges: list[dict[str, str | float]]
