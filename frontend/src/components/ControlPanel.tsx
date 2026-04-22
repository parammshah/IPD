import { motion } from 'framer-motion'

type Option = {
  id: string
  label: string
}

type ControlPanelProps = {
  sources: Option[]
  destinations: Option[]
  disruptions: Option[]
  source: string
  destination: string
  disrupted: string
  loading: boolean
  onSourceChange: (value: string) => void
  onDestinationChange: (value: string) => void
  onDisruptedChange: (value: string) => void
  onSimulate: () => void
}

const fieldClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400/80 focus:shadow-[0_0_0_3px_rgba(192,132,252,0.2)]'

export function ControlPanel({
  sources,
  destinations,
  disruptions,
  source,
  destination,
  disrupted,
  loading,
  onSourceChange,
  onDestinationChange,
  onDisruptedChange,
  onSimulate,
}: ControlPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_22px_80px_rgba(10,10,30,0.6)]"
    >
      <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-300/90">Control Tower</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-100">Disruption Simulator</h2>
      <p className="mt-2 text-sm text-slate-400">Select origin, destination, and optional disrupted node to trigger smart rerouting.</p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm text-slate-300">
          Source Warehouse
          <select className={fieldClassName} value={source} onChange={(event) => onSourceChange(event.target.value)}>
            {sources.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-300">
          Destination Store
          <select className={fieldClassName} value={destination} onChange={(event) => onDestinationChange(event.target.value)}>
            {destinations.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-300">
          Disrupted Node (optional)
          <select className={fieldClassName} value={disrupted} onChange={(event) => onDisruptedChange(event.target.value)}>
            <option value="">No disruption</option>
            {disruptions.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        onClick={onSimulate}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(99,102,241,0.45)] transition disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-600"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Simulating...
          </>
        ) : (
          'Simulate Disruption'
        )}
      </motion.button>
    </motion.section>
  )
}
