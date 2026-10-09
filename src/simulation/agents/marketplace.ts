import { 
  SimulationState, 
  DeliveryTransfer, 
  AgentDecision, 
  Vehicle, 
  ResourceRequest 
} from '../../types/simulation';
import { RoadGraph } from '../graph';
import { LogisticsAgent } from './logistics';

export interface ScoredAllocationCandidate {
  request: ResourceRequest;
  sourceFacilityId: string;
  quantity: number;
  vehicle: Vehicle;
  pathNodeIds: string[];
  travelTicks: number;
  score: number;
  scoreBreakdown: {
    urgencyWeight: number;
    shortageRiskWeight: number;
    populationImpactWeight: number;
    travelPenalty: number;
    criticalityWeight: number;
  };
}

export class ResourceMarketplaceAgent {
  /**
   * Generates candidate transfers by pairing pending requests with available unreserved surplus,
   * checking route feasibility and computing multi-factor prioritization scores.
   */
  public static matchSurplusAndGenerateProposals(
    state: SimulationState,
    graph: RoadGraph
  ): {
    proposedTransfers: DeliveryTransfer[];
    decisions: AgentDecision[];
  } {
    const proposedTransfers: DeliveryTransfer[] = [];
    const decisions: AgentDecision[] = [];

    // Filter pending/partially-allocated requests
    const openRequests = state.requests.filter(
      r => r.status === 'pending' || r.status === 'partially_allocated'
    );

    if (openRequests.length === 0) {
      return { proposedTransfers, decisions };
    }

    // Available vehicles: idle and operational
    const availableVehicles = state.vehicles.filter(
      v => v.status === 'idle' && v.currentLoad === 0
    );

    if (availableVehicles.length === 0) {
      return { proposedTransfers, decisions };
    }

    const assignedVehicleIds = new Set<string>();
    const tempReserved: Record<string, Record<string, number>> = {};
    for (const f of state.facilities) {
      tempReserved[f.id] = { ...f.reservedInventory };
    }

    const candidates: ScoredAllocationCandidate[] = [];

    for (const request of openRequests) {
      const destinationFacility = state.facilities.find(f => f.id === request.facilityId);
      if (!destinationFacility || destinationFacility.operationalStatus === 'offline') continue;

      const remainingNeeded = request.requestedQuantity - request.allocatedQuantity;
      if (remainingNeeded <= 0) continue;

      // Find sources with available unreserved inventory
      for (const source of state.facilities) {
        if (source.id === destinationFacility.id) continue;
        if (source.operationalStatus === 'offline') continue;

        // Warehouses and Response Centers share freely; Hospitals/Shelters maintain high safety reserve
        const currentStock = source.inventory[request.resourceId] || 0;
        const currentReserved = tempReserved[source.id][request.resourceId] || 0;
        const effectiveStock = currentStock - currentReserved;

        // Safe reserve threshold
        const isDepot = source.type === 'warehouse' || source.type === 'response_center';
        const safetyMargin = isDepot ? 10 : 40;
        const availableToShare = Math.max(0, effectiveStock - safetyMargin);

        if (availableToShare <= 0) continue;

        const transferQty = Math.min(remainingNeeded, availableToShare);

        // Check vehicle suitability
        for (const vehicle of availableVehicles) {
          if (assignedVehicleIds.has(vehicle.id)) continue;

          // Find shortest feasible path
          const sourceNode = LogisticsAgent.findNearestNodeToFacility(source.position, graph);
          const destNode = LogisticsAgent.findNearestNodeToFacility(destinationFacility.position, graph);

          const route = graph.findShortestPath(sourceNode, destNode);
          if (!route.feasible) continue;

          const allocableQty = Math.min(transferQty, vehicle.capacity);
          if (allocableQty <= 0) continue;

          // Calculate multi-factor prioritization score (Section 9 of plan)
          // Score components:
          // 1. Urgency: critical = 500, high = 300, medium = 150, low = 50
          let urgencyWeight = 50;
          if (request.urgency === 'critical') urgencyWeight = 500;
          else if (request.urgency === 'high') urgencyWeight = 300;
          else if (request.urgency === 'medium') urgencyWeight = 150;

          // 2. Shortage risk & facility criticality:
          const criticalityWeight = destinationFacility.priority * 20; // up to 200

          // 3. Population impact:
          const populationImpactWeight = Math.min(200, destinationFacility.population / 10);

          // 4. Distance / travel penalty (balanced so distance alone never overrides critical shortage):
          const travelPenalty = route.estimatedTravelTicks * 8;

          // Total score
          const totalScore = urgencyWeight + criticalityWeight + populationImpactWeight - travelPenalty;

          candidates.push({
            request,
            sourceFacilityId: source.id,
            quantity: allocableQty,
            vehicle,
            pathNodeIds: route.pathNodeIds,
            travelTicks: route.estimatedTravelTicks,
            score: totalScore,
            scoreBreakdown: {
              urgencyWeight,
              shortageRiskWeight: criticalityWeight,
              populationImpactWeight,
              travelPenalty,
              criticalityWeight,
            },
          });
        }
      }
    }

    // Sort candidate proposals by highest composite score
    candidates.sort((a, b) => b.score - a.score);

    // Greedily select non-conflicting proposals
    for (const candidate of candidates) {
      if (assignedVehicleIds.has(candidate.vehicle.id)) continue;

      const sourceStock = state.facilities.find(f => f.id === candidate.sourceFacilityId)?.inventory[candidate.request.resourceId] || 0;
      const currentReserved = tempReserved[candidate.sourceFacilityId][candidate.request.resourceId] || 0;
      if (sourceStock - currentReserved < candidate.quantity) continue;

      // Lock temporary reservation
      tempReserved[candidate.sourceFacilityId][candidate.request.resourceId] = currentReserved + candidate.quantity;
      assignedVehicleIds.add(candidate.vehicle.id);

      const deliveryId = `del-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`;
      const transfer: DeliveryTransfer = {
        id: deliveryId,
        requestId: candidate.request.id,
        sourceFacilityId: candidate.sourceFacilityId,
        destinationFacilityId: candidate.request.facilityId,
        resourceId: candidate.request.resourceId,
        quantity: candidate.quantity,
        vehicleId: candidate.vehicle.id,
        routeNodeIds: candidate.pathNodeIds,
        departureTick: state.currentTick,
        estimatedArrivalTick: state.currentTick + candidate.travelTicks,
        actualArrivalTick: null,
        status: 'scheduled',
      };

      proposedTransfers.push(transfer);

      decisions.push({
        id: `dec-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`,
        simulationId: state.id,
        tick: state.currentTick,
        agentRole: 'marketplace_agent',
        agentName: 'Resource Marketplace Agent',
        actionType: 'transfer_proposed',
        summary: `Matched: ${candidate.quantity} units of ${candidate.request.resourceId} to ${candidate.request.facilityId}`,
        rationale: `Composite priority score: ${candidate.score.toFixed(1)} (Urgency: +${candidate.scoreBreakdown.urgencyWeight}, Criticality: +${candidate.scoreBreakdown.criticalityWeight}, Population: +${candidate.scoreBreakdown.populationImpactWeight.toFixed(0)}, Travel Penalty: -${candidate.scoreBreakdown.travelPenalty}). Assigned vehicle ${candidate.vehicle.name}.`,
        facts: {
          score: candidate.score,
          urgency: candidate.request.urgency,
          estimatedTicks: candidate.travelTicks,
          quantity: candidate.quantity,
        },
        proposal: { ...transfer },
        validationStatus: 'valid',
        timestamp: new Date().toISOString(),
      });
    }

    return { proposedTransfers, decisions };
  }
}
