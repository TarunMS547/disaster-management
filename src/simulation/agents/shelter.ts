import { 
  SimulationState, 
  ResourceRequest, 
  AgentDecision 
} from '../../types/simulation';

export class ShelterAgent {
  public static assessNeedsAndSurplus(state: SimulationState): {
    newRequests: ResourceRequest[];
    decisions: AgentDecision[];
  } {
    const newRequests: ResourceRequest[] = [];
    const decisions: AgentDecision[] = [];

    const shelters = state.facilities.filter(f => f.type === 'shelter' && f.operationalStatus !== 'offline');

    for (const shelter of shelters) {
      for (const [resId, rate] of Object.entries(shelter.consumptionRates)) {
        if (rate <= 0) continue;

        const currentStock = shelter.inventory[resId] || 0;
        const timeToDepletionTicks = Math.floor(currentStock / rate);

        const existingOpenReq = state.requests.find(
          r => r.facilityId === shelter.id && 
               r.resourceId === resId && 
               (r.status === 'pending' || r.status === 'partially_allocated' || r.status === 'allocated' || r.status === 'in_transit')
        );

        if (timeToDepletionTicks <= 15 && !existingOpenReq) {
          const neededQuantity = Math.max(30, Math.ceil(rate * 20 - currentStock));
          let urgency: ResourceRequest['urgency'] = 'medium';
          if (timeToDepletionTicks <= 4) urgency = 'critical';
          else if (timeToDepletionTicks <= 8) urgency = 'high';

          const req: ResourceRequest = {
            id: `req-${state.currentTick}-${shelter.id}-${resId}`,
            facilityId: shelter.id,
            resourceId: resId,
            requestedQuantity: neededQuantity,
            allocatedQuantity: 0,
            fulfilledQuantity: 0,
            urgency,
            createdTick: state.currentTick,
            deadlineTick: state.currentTick + Math.max(4, timeToDepletionTicks),
            status: 'pending',
            reason: `Shelter population (${shelter.population} evacuees) consumes ${rate}/tick; ${timeToDepletionTicks} ticks reserve remaining.`,
          };

          newRequests.push(req);

          decisions.push({
            id: `dec-${state.currentTick}-${Math.random().toString(36).substring(2, 7)}`,
            simulationId: state.id,
            tick: state.currentTick,
            agentRole: 'shelter_agent',
            agentName: `Shelter Agent (${shelter.name})`,
            actionType: 'request_created',
            summary: `Requested ${neededQuantity} units of ${resId} for ${shelter.population} evacuees`,
            rationale: `Stock is ${currentStock} units. Burn rate is ${rate}/tick. Reserve depletion expected in ~${timeToDepletionTicks} ticks.`,
            facts: {
              shelter: shelter.name,
              population: shelter.population,
              resourceId: resId,
              currentStock,
              consumptionRate: rate,
              timeToDepletionTicks,
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
