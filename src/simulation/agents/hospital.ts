import { 
  SimulationState, 
  ResourceRequest, 
  AgentDecision 
} from '../../types/simulation';

export class HospitalAgent {
  public static analyzeNeedsAndGenerateRequests(state: SimulationState): {
    newRequests: ResourceRequest[];
    decisions: AgentDecision[];
  } {
    const newRequests: ResourceRequest[] = [];
    const decisions: AgentDecision[] = [];

    const hospitals = state.facilities.filter(f => f.type === 'hospital' && f.operationalStatus !== 'offline');

    for (const hospital of hospitals) {
      for (const [resId, rate] of Object.entries(hospital.consumptionRates)) {
        if (rate <= 0) continue;

        const currentStock = hospital.inventory[resId] || 0;
        const timeToDepletionTicks = Math.floor(currentStock / rate);

        // Find existing open requests for this facility and resource
        const existingOpenReq = state.requests.find(
          r => r.facilityId === hospital.id && 
               r.resourceId === resId && 
               (r.status === 'pending' || r.status === 'partially_allocated' || r.status === 'allocated' || r.status === 'in_transit')
        );

        // Trigger request if supply horizon drops below threshold (e.g. 15 ticks) and no active full request
        if (timeToDepletionTicks <= 18 && !existingOpenReq) {
          const neededQuantity = Math.max(20, Math.ceil(rate * 25 - currentStock));
          let urgency: ResourceRequest['urgency'] = 'medium';
          if (timeToDepletionTicks <= 5) urgency = 'critical';
          else if (timeToDepletionTicks <= 10) urgency = 'high';

          const req: ResourceRequest = {
            id: `req-${state.currentTick}-${hospital.id}-${resId}`,
            facilityId: hospital.id,
            resourceId: resId,
            requestedQuantity: neededQuantity,
            allocatedQuantity: 0,
            fulfilledQuantity: 0,
            urgency,
            createdTick: state.currentTick,
            deadlineTick: state.currentTick + Math.max(3, timeToDepletionTicks),
            status: 'pending',
            reason: `Projected burn rate of ${rate}/tick will exhaust stock in ~${timeToDepletionTicks} ticks`,
          };

          newRequests.push(req);

          decisions.push({
            id: `dec-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`,
            simulationId: state.id,
            tick: state.currentTick,
            agentRole: 'hospital_agent',
            agentName: `Hospital Agent (${hospital.name})`,
            actionType: 'request_created',
            summary: `Raised ${urgency.toUpperCase()} request for ${neededQuantity} units of ${resId}`,
            rationale: `Stock level is ${currentStock} units with ${rate}/tick burn. Projected depletion in ${timeToDepletionTicks} ticks.`,
            facts: {
              hospital: hospital.name,
              resourceId: resId,
              currentStock,
              consumptionRate: rate,
              timeToDepletionTicks,
              urgency,
            },
            proposal: { requestId: req.id, quantity: neededQuantity },
            validationStatus: 'valid',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return { newRequests, decisions };
  }
}
