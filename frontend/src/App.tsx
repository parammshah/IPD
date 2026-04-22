import { useEffect, useMemo, useRef, useState } from 'react'
import { Network } from 'vis-network'
import type { Data, Node, Edge, Options } from 'vis-network'

type GraphEdge = {
  from: string
  to: string
  weight: number
}

type GraphPayload = {
  nodes: string[]
  edges: GraphEdge[]
}

type OptimizeResponse = {
  original_path: string[] | null
  optimized_path: string[] | null
  cost: number | null
  message?: string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

const graphOptions: Options = {
  physics: {
    stabilization: true,
    barnesHut: {
      springLength: 120,
    },
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    zoomView: true,
  },
  edges: {
    smooth: {
      enabled: true,
      type: 'dynamic',
      roundness: 0.45,
    },
    font: {
      color: '#c4d2ee',
      strokeWidth: 0,
      size: 12,
    },
  },
}

const edgeKey = (from: string, to: string): string => `${from}->${to}`

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const networkRef = useRef<Network | null>(null)

  const [nodes, setNodes] = useState<string[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])

  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [disrupted, setDisrupted] = useState('')

  const [loading, setLoading] = useState(false)
  const [bootLoading, setBootLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OptimizeResponse | null>(null)

  useEffect(() => {
    const fetchGraph = async () => {
      setBootLoading(true)
      setError('')
      try {
        const response = await fetch(`${API_BASE}/graph`)
        if (!response.ok) {
          throw new Error('Unable to load graph data from backend.')
        }
        const payload: GraphPayload = await response.json()
        setNodes(payload.nodes)
        setEdges(payload.edges)
        if (payload.nodes.length > 1) {
          setSource(payload.nodes[0])
          setDestination(payload.nodes[1])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error loading graph data.')
      } finally {
        setBootLoading(false)
      }
    }

    void fetchGraph()
  }, [])

  const routeNodeSet = useMemo(() => {
    const path = result?.optimized_path ?? []
    return new Set(path)
  }, [result])

  const routeEdgeSet = useMemo(() => {
    const path = result?.optimized_path ?? []
    const set = new Set<string>()
    for (let i = 0; i < path.length - 1; i += 1) {
      set.add(edgeKey(path[i], path[i + 1]))
    }
    return set
  }, [result])

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) {
      return
    }

    const visNodes: Node[] = nodes.map((node) => {
      const isDisrupted = disrupted !== '' && disrupted === node
      const isRoute = routeNodeSet.has(node)

      let color = '#4f8dfd'
      if (isDisrupted) {
        color = '#ef4444'
      } else if (isRoute) {
        color = '#22c55e'
      }

      return {
        id: node,
        label: node,
        color,
        font: {
          color: '#eaf2ff',
          face: 'Space Grotesk',
        },
        shape: 'dot',
        size: 18,
      }
    })

    const visEdges: Edge[] = edges.map((edge) => {
      const highlighted = routeEdgeSet.has(edgeKey(edge.from, edge.to))

      return {
        id: edgeKey(edge.from, edge.to),
        from: edge.from,
        to: edge.to,
        label: String(edge.weight),
        arrows: 'to',
        width: highlighted ? 3 : 1.2,
        color: highlighted ? '#22c55e' : '#5774ad',
      }
    })

    const data: Data = {
      nodes: visNodes,
      edges: visEdges,
    }

    networkRef.current?.destroy()
    networkRef.current = new Network(containerRef.current, data, graphOptions)

    return () => {
      networkRef.current?.destroy()
      networkRef.current = null
    }
  }, [disrupted, edges, nodes, routeEdgeSet, routeNodeSet])

  const optimizeRoute = async () => {
    if (!source || !destination) {
      setError('Please choose both source and destination.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          destination,
          disrupted: disrupted || null,
        }),
      })

      const payload: OptimizeResponse = await response.json()
      if (!response.ok) {
        throw new Error(payload.message ?? 'Optimization request failed.')
      }

      setResult(payload)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Unexpected optimization error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_75%_85%,rgba(251,146,60,0.14),transparent_38%)]" />

      <main className="relative mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8">
        <header className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur transition-all duration-300 hover:border-cyan-500/50">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">AI logistics intelligence</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-50 md:text-5xl">AI Supply Chain Optimization System</h1>
          <p className="mt-3 text-base text-slate-300">Minimizing perishable waste</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 shadow-2xl shadow-cyan-950/30">
              <h2 className="text-lg font-medium text-slate-50">Controls</h2>
              <p className="mt-1 text-sm text-slate-400">Pick route endpoints and an optional disrupted facility.</p>

              <div className="mt-5 space-y-4">
                <label className="block text-sm text-slate-300">
                  Source Node
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                  >
                    <option value="">Select source</option>
                    {nodes.map((node) => (
                      <option key={`source-${node}`} value={node}>
                        {node}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-slate-300">
                  Destination Node
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                  >
                    <option value="">Select destination</option>
                    {nodes.map((node) => (
                      <option key={`destination-${node}`} value={node}>
                        {node}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-slate-300">
                  Disrupted Node (Optional)
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                    value={disrupted}
                    onChange={(event) => setDisrupted(event.target.value)}
                  >
                    <option value="">No disruption</option>
                    {nodes.map((node) => (
                      <option key={`disrupted-${node}`} value={node}>
                        {node}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={optimizeRoute}
                  disabled={loading || bootLoading}
                  className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                >
                  {loading ? 'Optimizing...' : 'Optimize Route'}
                </button>
              </div>

              {error ? <p className="mt-4 rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
              <h2 className="text-lg font-medium text-slate-50">Results</h2>

              {!result ? (
                <p className="mt-2 text-sm text-slate-400">Run optimization to view route and cost results.</p>
              ) : (
                <div className="mt-3 space-y-3 text-sm text-slate-200">
                  <div>
                    <p className="text-slate-400">Original Route</p>
                    <p>{result.original_path?.join(' -> ') ?? 'No route found'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Optimized Route</p>
                    <p>{result.optimized_path?.join(' -> ') ?? 'No route found'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Cost</p>
                    <p>{result.cost ?? 'No route found'}</p>
                  </div>
                  {result.message ? <p className="text-amber-300">{result.message}</p> : null}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 shadow-2xl shadow-cyan-950/20">
            <h2 className="mb-3 text-lg font-medium text-slate-50">Interactive Network</h2>
            <div
              ref={containerRef}
              className="h-[580px] w-full rounded-xl border border-slate-800 bg-slate-950/80"
            />
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
