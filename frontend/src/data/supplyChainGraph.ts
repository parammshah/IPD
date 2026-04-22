import type { FashionEdge, FashionNode } from '../types/supplyChain'

export const fashionNodes: FashionNode[] = [
  { id: 'wh-ny', label: 'Warehouse NYC', kind: 'warehouse', city: 'New York', capacity: 1800 },
  { id: 'wh-la', label: 'Warehouse LA', kind: 'warehouse', city: 'Los Angeles', capacity: 1600 },
  { id: 'hub-atl', label: 'Hub Atlanta', kind: 'hub', city: 'Atlanta', capacity: 1400 },
  { id: 'hub-dal', label: 'Hub Dallas', kind: 'hub', city: 'Dallas', capacity: 1300 },
  { id: 'hub-chi', label: 'Hub Chicago', kind: 'hub', city: 'Chicago', capacity: 1200 },
  { id: 'st-mia', label: 'Store Miami', kind: 'store', city: 'Miami', capacity: 500 },
  { id: 'st-sea', label: 'Store Seattle', kind: 'store', city: 'Seattle', capacity: 450 },
  { id: 'st-bos', label: 'Store Boston', kind: 'store', city: 'Boston', capacity: 480 },
]

export const fashionEdges: FashionEdge[] = [
  { from: 'wh-ny', to: 'hub-atl', cost: 4, leadHours: 10 },
  { from: 'wh-ny', to: 'hub-chi', cost: 3, leadHours: 8 },
  { from: 'wh-la', to: 'hub-dal', cost: 4, leadHours: 9 },
  { from: 'wh-la', to: 'hub-chi', cost: 5, leadHours: 11 },
  { from: 'hub-atl', to: 'st-mia', cost: 3, leadHours: 7 },
  { from: 'hub-atl', to: 'st-bos', cost: 4, leadHours: 9 },
  { from: 'hub-dal', to: 'st-mia', cost: 4, leadHours: 8 },
  { from: 'hub-dal', to: 'st-sea', cost: 3, leadHours: 7 },
  { from: 'hub-chi', to: 'st-sea', cost: 4, leadHours: 8 },
  { from: 'hub-chi', to: 'st-bos', cost: 3, leadHours: 7 },
  { from: 'hub-chi', to: 'hub-atl', cost: 2, leadHours: 5 },
  { from: 'hub-dal', to: 'hub-atl', cost: 2, leadHours: 5 },
]
