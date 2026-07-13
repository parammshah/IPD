import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ControlPanel } from './components/ControlPanel'
import { GraphCanvas } from './components/GraphCanvas'
import { ResultsPanel } from './components/ResultsPanel'
import { fashionNodes } from './data/supplyChainGraph'
import { optimizeRoute } from './services/optimizeRoute'
import type { OptimizationResult, RoutePhase } from './types/supplyChain'

function App() {
  const warehouses = useMemo(() => fashionNodes.filter((node) => node.kind === 'warehouse'), [])
  const stores = useMemo(() => fashionNodes.filter((node) => node.kind === 'store'), [])

  const [source, setSource] = useState(warehouses[0]?.id ?? '')
  const [destination, setDestination] = useState(stores[0]?.id ?? '')
  const [disrupted, setDisrupted] = useState('')

  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<RoutePhase>('idle')
  const [visiblePath, setVisiblePath] = useState<string[] | null>(null)

  useEffect(() => {
    if (!result) {
      return
    }

    setPhase('show-original')
    setVisiblePath(result.original_path)

    const animationTimer = setTimeout(() => {
      setPhase('show-optimized')
      setVisiblePath(result.optimized_path)
    }, 720)

    return () => clearTimeout(animationTimer)
  }, [result])

  const onSimulate = async () => {
    setLoading(true)
    setPhase('loading')
    setVisiblePath(null)

    const response = await optimizeRoute({ source, destination, disrupted: disrupted || undefined })
    setResult(response)
    setLoading(false)
  }

  const disruptionOptions = fashionNodes.filter((node) => node.id !== source && node.id !== destination)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070710] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_84%_26%,rgba(59,130,246,0.18),transparent_38%),radial-gradient(circle_at_45%_80%,rgba(45,212,191,0.12),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:54px_54px] opacity-20" />

      <main className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/90">Predictive Supply Intelligence</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-5xl">AI Blood Bank Supply Chain</h1>
          <p className="mt-3 text-sm text-slate-300 md:text-base">Real-time Inventory Optimization & Rerouting</p>
        </motion.header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <ControlPanel
            sources={warehouses}
            destinations={stores}
            disruptions={disruptionOptions}
            source={source}
            destination={destination}
            disrupted={disrupted}
            loading={loading}
            onSourceChange={setSource}
            onDestinationChange={setDestination}
            onDisruptedChange={setDisrupted}
            onSimulate={onSimulate}
          />

          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-100">Live Network Flow</h2>
                {phase === 'loading' ? <span className="text-xs uppercase tracking-[0.2em] text-blue-200/80">Analyzing...</span> : null}
              </div>

              <GraphCanvas disrupted={disrupted} visiblePath={visiblePath} phase={phase} />
            </motion.section>

            <ResultsPanel result={result} phase={phase} />
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
