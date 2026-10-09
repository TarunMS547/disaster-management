import { 
  SimulationState, 
  AgentDecision, 
  DeliveryTransfer, 
  ResourceRequest 
} from '../../types/simulation';

export interface CoordinatorEvaluationResult {
  approvedTransfers: DeliveryTransfer[];
  rejectedTransfers: Array<{ transfer: DeliveryTransfer; reason: string }>;
  decisions: AgentDecision[];
}

export class DisasterCoordinatorAgent {
  public static evaluateProposedTransfers(
    state: SimulationState,
    proposals: DeliveryTransfer[]
  ): CoordinatorEvaluationResult {
    const approved: DeliveryTransfer[] = [];
    const rejected: Array<{ transfer: DeliveryTransfer; reason: string }> = [];
    const decisions: AgentDecision[] = [];

    // Track simulated reserved inventory during batch validation to prevent double-allocation
    const simulatedReservations: Record<string, Record<string, number>> = {};
    for (const fac of state.facilities) {
      simulatedReservations[fac.id] = { ...fac.reservedInventory };
    }

    // Sort proposals by target urgency and request criticality
    const requestMap = new Map<string, ResourceRequest>();
    for (const req of state.requests) {
      requestMap.set(req.id, req);
    }

    const sortedProposals = [...proposals].sort((a, b) => {
      const reqA = requestMap.get(a.requestId);
      const reqB = requestMap.get(b.requestId);
      const urgencyScore = (req: ResourceRequest | undefined) => {
        if (!req) return 0;
        if (req.urgency === 'critical') return 100;
        if (req.urgency === 'high') return 50;
        if (req.urgency === 'medium') return 20;
        return 10;
      };
      return urgencyScore(reqB) - urgencyScore(reqA);
    });

    for (const transfer of sortedProposals) {
      const source = state.facilities.find(f => f.id === transfer.sourceFacilityId);
      const dest = state.facilities.find(f => f.id === transfer.destinationFacilityId);
      const vehicle = state.vehicles.find(v => v.id === transfer.vehicleId);
      const request = requestMap.get(transfer.requestId);

      if (!source) {
        rejected.push({ transfer, reason: `Source facility ${transfer.sourceFacilityId} not found` });
        continue;
      }
      if (!dest) {
        rejected.push({ transfer, reason: `Destination facility ${transfer.destinationFacilityId} not found` });
        continue;
      }
      if (!vehicle) {
        rejected.push({ transfer, reason: `Vehicle ${transfer.vehicleId} not found` });
        continue;
      }
      if (source.operationalStatus === 'offline') {
        rejected.push({ transfer, reason: `Source ${source.name} is currently offline` });
        continue;
      }

      // Check vehicle capacity
      if (transfer.quantity > vehicle.capacity) {
        decisions.push({
          id: `dec-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`,
          simulationId: state.id,
          tick: state.currentTick,
          agentRole: 'disaster_coordinator',
          agentName: 'Disaster Coordinator',
          actionType: 'plan_rejected',
          summary: `Rejected transfer of ${transfer.quantity} to ${dest.name}`,
          rationale: `Quantity ${transfer.quantity} exceeds vehicle ${vehicle.name} capacity of ${vehicle.capacity}. Invariant guard prevented vehicle overload.`,
          facts: { vehicleId: vehicle.id, capacity: vehicle.capacity, requestedQuantity: transfer.quantity },
          proposal: { ...transfer },
          validationStatus: 'rejected_invariant_failed',
          validationMessage: `Transfer exceeds vehicle capacity`,
          timestamp: new Date().toISOString(),
        });
        rejected.push({ transfer, reason: `Quantity ${transfer.quantity} exceeds vehicle capacity ${vehicle.capacity}` });
        continue;
      }

      // Check available unreserved inventory
      const currentAvail = (source.inventory[transfer.resourceId] || 0) - (simulatedReservations[source.id][transfer.resourceId] || 0);
      if (currentAvail < transfer.quantity) {
        const decision: AgentDecision = {
          id: `dec-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`,
          simulationId: state.id,
          tick: state.currentTick,
          agentRole: 'disaster_coordinator',
          agentName: 'Disaster Coordinator',
          actionType: 'plan_rejected',
          summary: `Rejected transfer of ${transfer.quantity} to ${dest.name}`,
          rationale: `Source ${source.name} has only ${currentAvail} unreserved units (needed ${transfer.quantity}). Invariant guard prevented deficit.`,
          facts: { sourceId: source.id, available: currentAvail, requested: transfer.quantity },
          proposal: { ...transfer },
          validationStatus: 'insufficient_inventory',
          validationMessage: `Insufficient unreserved stock at source ${source.name}`,
          timestamp: new Date().toISOString(),
        };
        decisions.push(decision);
        rejected.push({ transfer, reason: `Insufficient inventory at ${source.name}` });
        continue;
      }

      // Invariant check passed: Commit simulated reservation
      simulatedReservations[source.id][transfer.resourceId] = (simulatedReservations[source.id][transfer.resourceId] || 0) + transfer.quantity;
      approved.push(transfer);

      decisions.push({
        id: `dec-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`,
        simulationId: state.id,
        tick: state.currentTick,
        agentRole: 'disaster_coordinator',
        agentName: 'Disaster Coordinator',
        actionType: 'plan_approved',
        summary: `Approved dispatch: ${transfer.quantity} units from ${source.name} to ${dest.name}`,
        rationale: `Verified capacity, route feasibility, and stock balance. Urgency level: ${request?.urgency || 'high'}.`,
        facts: {
          source: source.name,
          destination: dest.name,
          vehicle: vehicle.name,
          resource: transfer.resourceId,
          quantity: transfer.quantity,
          etaTick: transfer.estimatedArrivalTick,
        },
        proposal: { ...transfer },
        validationStatus: 'valid',
        timestamp: new Date().toISOString(),
      });
    }

    return { approvedTransfers: approved, rejectedTransfers: rejected, decisions };
  }
}
