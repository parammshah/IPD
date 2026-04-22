import { AnimatePresence, motion } from 'framer-motion'
import type { OptimizationResult, RoutePhase } from '../types/supplyChain'

type ResultsPanelProps = {
  result: OptimizationResult | null
  phase: RoutePhase
}

const toRouteText = (path: string[] | null): string => {
  if (!path || path.length === 0) {
    return 'No route found'
  }
  return path.join(' -> ')
}

export function ResultsPanel({ result, phase }: ResultsPanelProps) {
  const hasResult = Boolean(result)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Optimization Results</h3>
        {hasResult ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              result?.status === 'success'
                ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/35'
                : 'bg-red-400/15 text-red-300 ring-1 ring-red-400/35'
            }`}
          >
            {result?.status === 'success' ? 'Rerouting Successful' : 'No Route Available'}
          </span>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {!hasResult ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-sm text-slate-400"
          >
            Run the simulator to view route changes and disruption impact.
          </motion.p>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 space-y-4 text-sm"
          >
            <div>
              <p className="text-slate-400">Original Route</p>
              <p className="mt-1 text-slate-100">{toRouteText(result?.original_path ?? null)}</p>
            </div>
            <div>
              <p className="text-slate-400">Optimized Route</p>
              <p className="mt-1 text-slate-100">{toRouteText(result?.optimized_path ?? null)}</p>
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-blue-200/85">Current Visual Phase: {phase}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
