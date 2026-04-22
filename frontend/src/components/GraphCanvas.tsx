import { useEffect, useMemo, useRef } from 'react'
import { DataSet } from 'vis-data'
import { Network } from 'vis-network'
import type { Edge, Node, Options } from 'vis-network'
import { fashionEdges, fashionNodes } from '../data/supplyChainGraph'
import type { RoutePhase } from '../types/supplyChain'

type GraphCanvasProps = {
  disrupted: string
  visiblePath: string[] | null
  phase: RoutePhase
}

const edgeKey = (from: string, to: string): string => `${from}->${to}`

const networkOptions: Options = {
  autoResize: true,
  physics: {
    stabilization: true,
    barnesHut: {
      springLength: 130,
      damping: 0.42,
    },
  },
  interaction: {
    hover: true,
    dragNodes: true,
    dragView: true,
    zoomView: true,
    tooltipDelay: 140,
  },
  edges: {
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 0.6,
      },
    },
    smooth: {
      enabled: true,
      type: 'dynamic',
      roundness: 0.4,
    },
    font: {
      color: '#cbd5e1',
      strokeWidth: 0,
      size: 10,
      face: 'Space Grotesk',
    },
  },
}

export function GraphCanvas({ disrupted, visiblePath, phase }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const networkRef = useRef<Network | null>(null)

  const activeEdgeSet = useMemo(() => {
    const set = new Set<string>()
    if (!visiblePath) {
      return set
    }

    for (let index = 0; index < visiblePath.length - 1; index += 1) {
      set.add(edgeKey(visiblePath[index], visiblePath[index + 1]))
    }

    return set
  }, [visiblePath])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const visNodes = new DataSet<Node>(
      fashionNodes.map((node) => {
        const isDisrupted = disrupted !== '' && disrupted === node.id
        const isActive = Boolean(visiblePath?.includes(node.id))

        let color = '#3b82f6'
        if (node.kind === 'store') {
          color = '#06b6d4'
        }
        if (isActive) {
          color = '#22c55e'
        }
        if (isDisrupted) {
          color = '#ef4444'
        }

        return {
          id: node.id,
          label: node.label,
          title: `${node.label}\n${node.city} | Cap ${node.capacity}`,
          shape: 'dot',
          size: isDisrupted ? 24 : isActive ? 22 : 18,
          color: {
            background: color,
            border: isDisrupted ? '#fecaca' : '#dbeafe',
            highlight: {
              background: color,
              border: '#ffffff',
            },
            hover: {
              background: color,
              border: '#ffffff',
            },
          },
          font: {
            face: 'Space Grotesk',
            color: '#f8fafc',
            size: 13,
          },
          borderWidth: isDisrupted ? 3 : isActive ? 2 : 1,
          shadow: isActive,
        }
      }),
    )

    const visEdges = new DataSet<Edge>(
      fashionEdges.map((edge) => {
        const isActive = activeEdgeSet.has(edgeKey(edge.from, edge.to))
        const isFadingOriginal = phase === 'show-original' && !isActive

        return {
          id: edgeKey(edge.from, edge.to),
          from: edge.from,
          to: edge.to,
          label: `${edge.cost}c`,
          title: `Cost: ${edge.cost} | Lead: ${edge.leadHours}h`,
          width: isActive ? 3.4 : 1.3,
          dashes: isFadingOriginal,
          color: isActive
            ? {
                color: '#22c55e',
                highlight: '#4ade80',
                hover: '#4ade80',
                opacity: 1,
              }
            : {
                color: '#64748b',
                highlight: '#94a3b8',
                hover: '#94a3b8',
                opacity: phase === 'show-original' ? 0.35 : 0.65,
              },
          shadow: isActive,
        }
      }),
    )

    networkRef.current?.destroy()
    networkRef.current = new Network(containerRef.current, { nodes: visNodes, edges: visEdges }, networkOptions)

    return () => {
      networkRef.current?.destroy()
      networkRef.current = null
    }
  }, [activeEdgeSet, disrupted, phase, visiblePath])

  return <div ref={containerRef} className="h-[470px] w-full rounded-2xl border border-white/10 bg-black/30" />
}
