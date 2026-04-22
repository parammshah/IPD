import { fashionEdges } from '../data/supplyChainGraph'
import type { FashionEdge, OptimizationInput, OptimizationResult } from '../types/supplyChain'

type Adjacent = {
  to: string
  cost: number
}

const createAdjacency = (edges: FashionEdge[], disrupted?: string): Map<string, Adjacent[]> => {
  const adjacency = new Map<string, Adjacent[]>()

  for (const edge of edges) {
    if (disrupted && (edge.from === disrupted || edge.to === disrupted)) {
      continue
    }

    if (!adjacency.has(edge.from)) {
      adjacency.set(edge.from, [])
    }

    adjacency.get(edge.from)?.push({ to: edge.to, cost: edge.cost })
  }

  return adjacency
}

const shortestPath = (
  source: string,
  destination: string,
  edges: FashionEdge[],
  disrupted?: string,
): string[] | null => {
  if (disrupted && (source === disrupted || destination === disrupted)) {
    return null
  }

  const adjacency = createAdjacency(edges, disrupted)
  const distances = new Map<string, number>([[source, 0]])
  const previous = new Map<string, string | null>([[source, null]])
  const queue = new Set<string>([source])

  while (queue.size > 0) {
    let current: string | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const node of queue) {
      const distance = distances.get(node) ?? Number.POSITIVE_INFINITY
      if (distance < minDistance) {
        minDistance = distance
        current = node
      }
    }

    if (!current) {
      break
    }

    queue.delete(current)

    if (current === destination) {
      break
    }

    const neighbors = adjacency.get(current) ?? []
    for (const neighbor of neighbors) {
      const candidate = (distances.get(current) ?? Number.POSITIVE_INFINITY) + neighbor.cost
      if (candidate < (distances.get(neighbor.to) ?? Number.POSITIVE_INFINITY)) {
        distances.set(neighbor.to, candidate)
        previous.set(neighbor.to, current)
        queue.add(neighbor.to)
      }
    }
  }

  if (!previous.has(destination)) {
    return null
  }

  const path: string[] = []
  let cursor: string | null = destination
  while (cursor) {
    path.unshift(cursor)
    cursor = previous.get(cursor) ?? null
  }

  return path
}

export const optimizeRoute = async ({
  source,
  destination,
  disrupted,
}: OptimizationInput): Promise<OptimizationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const originalPath = shortestPath(source, destination, fashionEdges)
      const optimizedPath = shortestPath(source, destination, fashionEdges, disrupted)

      if (!optimizedPath) {
        resolve({
          original_path: originalPath,
          optimized_path: null,
          status: 'failed',
          message: 'No Route Available',
        })
        return
      }

      resolve({
        original_path: originalPath,
        optimized_path: optimizedPath,
        status: 'success',
        message: 'Rerouting Successful',
      })
    }, 1050)
  })
}
