from __future__ import annotations

import csv
from pathlib import Path

import networkx as nx


class GraphService:
    def __init__(self, base_dir: Path) -> None:
        self.base_dir = base_dir
        # Prefer repository-level data path, fallback to backend-local data path.
        primary_data_dir = self.base_dir.parent / "data"
        fallback_data_dir = self.base_dir / "data"
        data_dir = primary_data_dir if primary_data_dir.exists() else fallback_data_dir

        self.nodes_file = data_dir / "Nodes.csv"
        self.edges_file = data_dir / "Edges (Plant).csv"
        self.graph = self._load_graph()

    def _load_graph(self) -> nx.DiGraph:
        graph = nx.DiGraph()

        with self.nodes_file.open("r", encoding="utf-8", newline="") as nodes_csv:
            reader = csv.DictReader(nodes_csv)
            for row in reader:
                node_id = row.get("id")
                if node_id:
                    graph.add_node(node_id)

        with self.edges_file.open("r", encoding="utf-8", newline="") as edges_csv:
            reader = csv.DictReader(edges_csv)
            for row in reader:
                source = row.get("source")
                target = row.get("target")
                cost_raw = row.get("cost")
                if not source or not target or cost_raw is None:
                    continue
                graph.add_edge(source, target, weight=float(cost_raw))

        return graph

    def list_nodes(self) -> list[str]:
        return sorted(str(node) for node in self.graph.nodes())

    def list_edges(self) -> list[dict[str, str | float]]:
        edges: list[dict[str, str | float]] = []
        for source, target, data in self.graph.edges(data=True):
            edges.append(
                {
                    "from": str(source),
                    "to": str(target),
                    "weight": float(data.get("weight", 1.0)),
                }
            )
        return edges

    def _shortest_path(self, graph: nx.DiGraph, source: str, destination: str) -> list[str] | None:
        try:
            return nx.shortest_path(graph, source=source, target=destination, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    def _path_cost(self, graph: nx.DiGraph, path: list[str] | None) -> float | None:
        if not path or len(path) < 2:
            return None

        total = 0.0
        for i in range(len(path) - 1):
            edge_data = graph.get_edge_data(path[i], path[i + 1], default={})
            total += float(edge_data.get("weight", 0.0))
        return round(total, 2)

    def optimize(self, source: str, destination: str, disrupted: str | None) -> dict[str, object]:
        original_path = self._shortest_path(self.graph, source, destination)

        working_graph = self.graph.copy()
        message = None
        if disrupted:
            if disrupted in working_graph:
                working_graph.remove_node(disrupted)
            else:
                message = f"Disrupted node '{disrupted}' not found in graph."

        optimized_path = self._shortest_path(working_graph, source, destination)
        cost = self._path_cost(working_graph, optimized_path)

        return {
            "original_path": original_path,
            "optimized_path": optimized_path,
            "cost": cost,
            "message": message,
        }
