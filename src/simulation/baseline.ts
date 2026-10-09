import { 
  SimulationState, 
  DeliveryTransfer, 
  Vehicle 
} from '../types/simulation';
import { RoadGraph } from './graph';
import { LogisticsAgent } from './agents/logistics';

export class BaselineAllocationPolicy {
  /**
   * Baseline First-Come-First-Served (FCFS) & Nearest-Source policy without priority weighting
   * and without dynamic proactive rerouting on road closures.
   */
  public static generateBaselineProposals(
    state: SimulationState,
    graph: RoadGraph
  ): DeliveryTransfer[] {
    const proposed: DeliveryTransfer[] = [];

    // FCFS: Sort strictly by createdTick (oldest first, irrespective of urgency)
    const openRequests = state.requests
      .filter(r => r.status === 'pending' || r.status === 'partially_allocated')
      .sort((a, b) => a.createdTick - b.createdTick);

    if (openRequests.length === 0) return proposed;

    const availableVehicles = state.vehicles.filter(
      v => v.status === 'idle' && v.currentLoad === 0
    );

    if (availableVehicles.length === 0) return proposed;

    const assignedVehicles = new Set<string>();
    const reservedStock: Record<string, Record<string, number>> = {};
    for (const f of state.facilities) {
      reservedStock[f.id] = { ...f.reservedInventory };
    }

    for (const req of openRequests) {
      const dest = state.facilities.find(f => f.id === req.facilityId);
      if (!dest || dest.operationalStatus === 'offline') continue;

      const needed = req.requestedQuantity - req.allocatedQuantity;
      if (needed <= 0) continue;

      // Find nearest source solely by Euclidean distance (ignoring priority and safety reserve)
      const candidateSources = state.facilities
        .filter(f => f.id !== dest.id && f.operationalStatus !== 'offline')
        .sort((a, b) => {
          const distA = Math.hypot(a.position[0] - dest.position[0], a.position[2] - dest.position[2]);
          const distB = Math.hypot(b.position[0] - dest.position[0], b.position[2] - dest.position[2]);
          return distA - distB;
        });

      for (const source of candidateSources) {
        const stock = source.inventory[req.resourceId] || 0;
        const res = reservedStock[source.id][req.resourceId] || 0;
        const avail = stock - res;

        if (avail <= 0) continue;

        const vehicle = availableVehicles.find(v => !assignedVehicles.has(v.id));
        if (!vehicle) break;

        const sourceNode = LogisticsAgent.findNearestNodeToFacility(source.position, graph);
        const destNode = LogisticsAgent.findNearestNodeToFacility(dest.position, graph);

        const route = graph.findShortestPath(sourceNode, destNode);
        if (!route.feasible) continue;

        const qty = Math.min(needed, avail, vehicle.capacity);
        if (qty <= 0) continue;

        reservedStock[source.id][req.resourceId] = res + qty;
        assignedVehicles.add(vehicle.id);

        proposed.push({
          id: `base-del-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`,
          requestId: req.id,
          sourceFacilityId: source.id,
          destinationFacilityId: dest.id,
          resourceId: req.resourceId,
          quantity: qty,
          vehicleId: vehicle.id,
          routeNodeIds: route.pathNodeIds,
          departureTick: state.currentTick,
          estimatedArrivalTick: state.currentTick + route.estimatedTravelTicks,
          actualArrivalTick: null,
          status: 'scheduled',
        });

        break;
      }
    }

    return proposed;
  }
}
