import { 
  SimulationState, 
  DeliveryTransfer, 
  AgentDecision, 
  Vehicle 
} from '../../types/simulation';
import { RoadGraph } from '../graph';

export interface RoutePlanningCandidate {
  sourceFacilityId: string;
  destFacilityId: string;
  quantity: number;
}

export class LogisticsAgent {
  /**
   * Evaluates active deliveries to verify if any are traversing roads that just became blocked,
   * and dynamically replans their path.
   */
  public static monitorAndRerouteActiveDeliveries(
    state: SimulationState,
    graph: RoadGraph
  ): {
    updatedDeliveries: DeliveryTransfer[];
    updatedVehicles: Vehicle[];
    decisions: AgentDecision[];
  } {
    const updatedDeliveries = [...state.deliveries];
    const updatedVehicles = [...state.vehicles];
    const decisions: AgentDecision[] = [];

    const activeDeliveries = updatedDeliveries.filter(d => d.status === 'in_transit' || d.status === 'dispatched');

    for (const delivery of activeDeliveries) {
      if (graph.isRouteBlocked(delivery.routeNodeIds)) {
        // Find nearest facility or start point from current vehicle position
        const vehicle = updatedVehicles.find(v => v.id === delivery.vehicleId);
        const destFacility = state.facilities.find(f => f.id === delivery.destinationFacilityId);

        if (vehicle && destFacility) {
          // Identify nearest valid node to vehicle's current location or previous route node
          const currentNodeId = vehicle.currentRouteNodeIds[vehicle.currentEdgeIndex] || delivery.routeNodeIds[0];
          // Find destination node nearest to facility
          const destNodeId = this.findNearestNodeToFacility(destFacility.position, graph);

          const replanResult = graph.findShortestPath(currentNodeId, destNodeId);

          if (replanResult.feasible) {
            delivery.routeNodeIds = replanResult.pathNodeIds;
            delivery.estimatedArrivalTick = state.currentTick + replanResult.estimatedTravelTicks;
            delivery.status = 'rerouted';

            vehicle.currentRouteNodeIds = replanResult.pathNodeIds;
            vehicle.currentEdgeIndex = 0;
            vehicle.routeProgress = 0;

            decisions.push({
              id: `dec-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`,
              simulationId: state.id,
              tick: state.currentTick,
              agentRole: 'logistics_agent',
              agentName: 'Logistics Agent',
              actionType: 'route_replanned',
              summary: `Dynamic Detour: Rerouted delivery ${delivery.id} to avoid blocked road`,
              rationale: `Detected newly flooded/blocked edge on original path. Computed alternate viable corridor (${replanResult.pathNodeIds.join(' -> ')}). ETA adjusted to Tick ${delivery.estimatedArrivalTick}.`,
              facts: {
                deliveryId: delivery.id,
                vehicleId: vehicle.id,
                newEstimatedTicks: replanResult.estimatedTravelTicks,
                distance: replanResult.totalDistance,
              },
              proposal: { newRoute: replanResult.pathNodeIds },
              validationStatus: 'valid',
              timestamp: new Date().toISOString(),
            });
          } else {
            // Infeasible: all routes blocked
            decisions.push({
              id: `dec-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`,
              simulationId: state.id,
              tick: state.currentTick,
              agentRole: 'logistics_agent',
              agentName: 'Logistics Agent',
              actionType: 'route_replanned',
              summary: `NO FEASIBLE DETOUR for delivery ${delivery.id}`,
              rationale: `All connecting road segments to destination ${destFacility.name} are blocked by disaster hazards. Vehicle holding position.`,
              facts: { deliveryId: delivery.id },
              proposal: {},
              validationStatus: 'infeasible_route',
              validationMessage: 'Destination network partitioned by hazard zone',
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    return { updatedDeliveries, updatedVehicles, decisions };
  }

  public static findNearestNodeToFacility(
    position: [number, number, number],
    graph: RoadGraph
  ): string {
    const nodes = graph.getAllNodes();
    let closestNodeId = nodes[0]?.id || 'node-cc';
    let minDistance = Infinity;

    for (const node of nodes) {
      const dx = node.position[0] - position[0];
      const dz = node.position[2] - position[2];
      const dist = Math.hypot(dx, dz);
      if (dist < minDistance) {
        minDistance = dist;
        closestNodeId = node.id;
      }
    }

    return closestNodeId;
  }
}
