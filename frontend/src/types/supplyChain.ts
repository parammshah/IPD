export type NodeKind = 'warehouse' | 'hub' | 'store'

export type FashionNode = {
  id: string
  label: string
  kind: NodeKind
  city: string
  capacity: number
}

export type FashionEdge = {
  from: string
  to: string
  cost: number
  leadHours: number
}

export type OptimizationResult = {
  original_path: string[] | null
  optimized_path: string[] | null
  status: 'success' | 'failed'
  message: string
}

export type OptimizationInput = {
  source: string
  destination: string
  disrupted?: string
}

export type RoutePhase = 'idle' | 'loading' | 'show-original' | 'show-optimized'
