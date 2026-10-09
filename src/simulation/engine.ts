import { 
  SimulationState, 
  SimulationEvent, 
  SimulationMetrics, 
  ScenarioDefinition, 
  Incident, 
  RoadEdge,
  Facility,
  Vehicle,
  DeliveryTransfer
} from '../types/simulation';
import { RoadGraph } from './graph';
import { DisasterCoordinatorAgent } from './agents/coordinator';
import { HospitalAgent } from './agents/hospital';
import { ShelterAgent } from './agents/shelter';
import { LogisticsAgent } from './agents/logistics';
import { ResourceMarketplaceAgent } from './agents/marketplace';
import { SEEDED_SCENARIOS } from './scenarios';

// Fast deterministic seedable PRNG (Mulberry32)
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SimulationEngine {
  private state: SimulationState;
  private graph: RoadGraph;
  private initialScenario: ScenarioDefinition;
  private prng: () => number;
  private onStateChangeCallbacks: Array<(state: SimulationState) => void> = [];
  private timerId: number | null = null;

  constructor(scenarioKey: ScenarioDefinition['key'] = 'urban_flood', customSeed?: number) {
    const baseScenario = SEEDED_SCENARIOS[scenarioKey] || SEEDED_SCENARIOS.urban_flood;
    this.initialScenario = JSON.parse(JSON.stringify(baseScenario));
    const seed = customSeed ?? baseScenario.initialSeed;
    this.prng = createPRNG(seed);
    this.graph = new RoadGraph(this.initialScenario.roadNodes, this.initialScenario.roadEdges);
    this.state = this.buildInitialState(this.initialScenario, seed);
  }

  private buildInitialState(scenario: ScenarioDefinition, seed: number): SimulationState {
    const initialMetrics: SimulationMetrics = {
      tick: 0,
      criticalDemandFulfilledPercent: 100,
      totalRequested: 0,
      totalFulfilled: 0,
      totalUnmetDemand: 0,
      unmetDemandByResource: {},
      unmetDemandByFacility: {},
      averageFulfillmentTimeTicks: 0,
      criticalFulfillmentTimeTicks: 0,
      requestsTotal: 0,
      requestsFulfilled: 0,
      requestsPartial: 0,
      requestsUnfulfilled: 0,
      deliveriesSuccessful: 0,
      deliveriesActive: 0,
      deliveriesRerouted: 0,
      deliveriesFailed: 0,
      vehiclesUtilizedCount: 0,
      vehicleUtilizationRate: 0,
      predictedShortagesAvoided: 0,
      fairnessIndex: 1.0,
    };

    return {
      id: `sim-${Date.now()}-${Math.floor(this.prng() * 10000)}`,
      name: scenario.name,
      scenarioKey: scenario.key,
      seed,
      status: 'idle',
      currentTick: 0,
      tickSpeedMultiplier: 1,
      facilities: JSON.parse(JSON.stringify(scenario.facilities)),
      roadNodes: JSON.parse(JSON.stringify(scenario.roadNodes)),
      roadEdges: JSON.parse(JSON.stringify(scenario.roadEdges)),
      vehicles: JSON.parse(JSON.stringify(scenario.vehicles)),
      requests: [],
      deliveries: [],
      incidents: [],
      resources: JSON.parse(JSON.stringify(scenario.resources)),
      events: [
        {
          id: `evt-init-0`,
          simulationId: `sim-init`,
          tick: 0,
          eventType: 'tick_advanced',
          severity: 'info',
          title: 'ARES System Initialized',
          message: `Ready in synthetic digital twin. Scenario: ${scenario.name} (Seed: ${seed})`,
          timestamp: new Date().toISOString(),
        },
      ],
      decisions: [],
      metrics: initialMetrics,
      metricsHistory: [initialMetrics],
      scheduledEvents: JSON.parse(JSON.stringify(scenario.eventSchedule)),
    };
  }

  public getState(): SimulationState {
    return this.state;
  }

  public getGraph(): RoadGraph {
    return this.graph;
  }

  public subscribe(cb: (state: SimulationState) => void): () => void {
    this.onStateChangeCallbacks.push(cb);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(c => c !== cb);
    };
  }

  private notify(): void {
    const clone = JSON.parse(JSON.stringify(this.state));
    for (const cb of this.onStateChangeCallbacks) {
      cb(clone);
    }
  }

  public start(): void {
    if (this.state.status === 'running') return;
    this.state.status = 'running';
    this.notify();
    this.scheduleNextTick();
  }

  public pause(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.state.status = 'paused';
    this.notify();
  }

  public setSpeed(multiplier: number): void {
    this.state.tickSpeedMultiplier = multiplier;
    this.notify();
  }

  public reset(): void {
    this.pause();
    this.prng = createPRNG(this.state.seed);
    this.graph = new RoadGraph(this.initialScenario.roadNodes, this.initialScenario.roadEdges);
    this.state = this.buildInitialState(this.initialScenario, this.state.seed);
    this.notify();
  }

  private scheduleNextTick(): void {
    if (this.state.status !== 'running') return;
    const baseInterval = this.initialScenario.tickIntervalMs;
    const interval = Math.max(150, baseInterval / this.state.tickSpeedMultiplier);

    this.timerId = window.setTimeout(() => {
      this.step();
      if (this.state.status === 'running' && this.state.currentTick < this.initialScenario.maxTicks) {
        this.scheduleNextTick();
      } else if (this.state.currentTick >= this.initialScenario.maxTicks) {
        this.state.status = 'completed';
        this.notify();
      }
    }, interval);
  }

  /**
   * Authoritative Tick Advance: Runs deterministic agent cycle, invariant validation,
   * vehicle progression, inventory consumption, and delivery arrivals.
   */
  public step(): void {
    const nextTick = this.state.currentTick + 1;
    this.state.currentTick = nextTick;

    // 1. Process Scheduled Scenario Incidents
    this.processScheduledIncidents(nextTick);

    // 2. Consume Resources at Facilities (burn rates)
    this.processConsumption(nextTick);

    // 3. Agent Phase 1: Hospital and Shelter Agents detect shortages and raise requests
    const hospitalNeeds = HospitalAgent.analyzeNeedsAndGenerateRequests(this.state);
    const shelterNeeds = ShelterAgent.assessNeedsAndSurplus(this.state);

    if (hospitalNeeds.newRequests.length > 0) {
      this.state.requests.push(...hospitalNeeds.newRequests);
      this.state.decisions.push(...hospitalNeeds.decisions);
      for (const req of hospitalNeeds.newRequests) {
        this.emitEvent({
          id: `evt-req-${nextTick}-${req.id}`,
          simulationId: this.state.id,
          tick: nextTick,
          eventType: 'request_created',
          severity: req.urgency === 'critical' ? 'critical' : 'warning',
          title: `Medical Supply Request [${req.urgency.toUpperCase()}]`,
          message: `${req.requestedQuantity} units of ${req.resourceId} requested by ${req.facilityId}.`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (shelterNeeds.newRequests.length > 0) {
      this.state.requests.push(...shelterNeeds.newRequests);
      this.state.decisions.push(...shelterNeeds.decisions);
      for (const req of shelterNeeds.newRequests) {
        this.emitEvent({
          id: `evt-req-${nextTick}-${req.id}`,
          simulationId: this.state.id,
          tick: nextTick,
          eventType: 'request_created',
          severity: req.urgency === 'critical' ? 'critical' : 'warning',
          title: `Shelter Ration Request [${req.urgency.toUpperCase()}]`,
          message: `${req.requestedQuantity} units of ${req.resourceId} requested by ${req.facilityId}.`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 4. Agent Phase 2: Logistics Agent checks active deliveries for newly blocked roads and replans
    const logisticsReroutes = LogisticsAgent.monitorAndRerouteActiveDeliveries(this.state, this.graph);
    this.state.deliveries = logisticsReroutes.updatedDeliveries;
    this.state.vehicles = logisticsReroutes.updatedVehicles;
    this.state.decisions.push(...logisticsReroutes.decisions);

    // 5. Agent Phase 3: Marketplace Agent matches surplus with unmet requests
    const marketplace = ResourceMarketplaceAgent.matchSurplusAndGenerateProposals(this.state, this.graph);
    this.state.decisions.push(...marketplace.decisions);

    // 6. Agent Phase 4: Disaster Coordinator validates invariants & approves dispatch
    if (marketplace.proposedTransfers.length > 0) {
      const coordinatorEval = DisasterCoordinatorAgent.evaluateProposedTransfers(this.state, marketplace.proposedTransfers);
      this.state.decisions.push(...coordinatorEval.decisions);

      // Commit approved transfers atomically (reserve inventory and assign vehicles)
      for (const approvedTransfer of coordinatorEval.approvedTransfers) {
        this.dispatchTransfer(approvedTransfer, nextTick);
      }
    }

    // 7. Advance vehicles & resolve deliveries
    this.advanceVehiclesAndDeliveries(nextTick);

    // 8. Recompute authoritative metrics
    this.updateMetrics(nextTick);

    // Emit heartbeat tick event every 5 ticks or on significant action
    if (nextTick % 5 === 0) {
      this.emitEvent({
        id: `evt-tick-${nextTick}`,
        simulationId: this.state.id,
        tick: nextTick,
        eventType: 'tick_advanced',
        severity: 'info',
        title: `Tick ${nextTick} Completed`,
        message: `Active deliveries: ${this.state.deliveries.filter(d => d.status === 'in_transit').length}. Unmet demand: ${this.state.metrics.totalUnmetDemand} units.`,
        timestamp: new Date().toISOString(),
      });
    }

    this.notify();
  }

  private dispatchTransfer(transfer: DeliveryTransfer, tick: number): void {
    const source = this.state.facilities.find(f => f.id === transfer.sourceFacilityId);
    const vehicle = this.state.vehicles.find(v => v.id === transfer.vehicleId);
    const request = this.state.requests.find(r => r.id === transfer.requestId);

    if (!source || !vehicle || !request) return;

    // INVARIANT CHECK 1: Ensure inventory is non-negative and available
    const available = (source.inventory[transfer.resourceId] || 0) - (source.reservedInventory[transfer.resourceId] || 0);
    if (available < transfer.quantity) {
      console.warn(`Invariant violation prevented: attempted to reserve ${transfer.quantity} but only ${available} available.`);
      return;
    }

    // INVARIANT CHECK 2: Ensure transfer <= vehicle capacity
    if (transfer.quantity > vehicle.capacity) {
      console.warn(`Invariant violation prevented: transfer ${transfer.quantity} exceeds vehicle capacity ${vehicle.capacity}`);
      return;
    }

    // Reserve inventory at source
    source.reservedInventory[transfer.resourceId] = (source.reservedInventory[transfer.resourceId] || 0) + transfer.quantity;

    // Deduct actual unreserved inventory
    source.inventory[transfer.resourceId] -= transfer.quantity;

    // Update vehicle
    vehicle.status = 'in_transit';
    vehicle.currentLoad = transfer.quantity;
    vehicle.assignedDeliveryId = transfer.id;
    vehicle.currentRouteNodeIds = transfer.routeNodeIds;
    vehicle.currentEdgeIndex = 0;
    vehicle.routeProgress = 0;

    // Update request allocation
    request.allocatedQuantity += transfer.quantity;
    if (request.allocatedQuantity >= request.requestedQuantity) {
      request.status = 'allocated';
    } else {
      request.status = 'partially_allocated';
    }

    transfer.status = 'in_transit';
    this.state.deliveries.push(transfer);

    this.emitEvent({
      id: `evt-disp-${tick}-${transfer.id}`,
      simulationId: this.state.id,
      tick,
      eventType: 'delivery_dispatched',
      severity: 'info',
      title: `Delivery Dispatched: ${vehicle.name}`,
      message: `En route from ${source.name} with ${transfer.quantity} units of ${transfer.resourceId}. ETA: Tick ${transfer.estimatedArrivalTick}.`,
      timestamp: new Date().toISOString(),
    });
  }

  private advanceVehiclesAndDeliveries(tick: number): void {
    for (const delivery of this.state.deliveries) {
      if (delivery.status !== 'in_transit' && delivery.status !== 'rerouted') continue;

      const vehicle = this.state.vehicles.find(v => v.id === delivery.vehicleId);
      if (!vehicle) continue;

      // Progress along route
      if (tick >= delivery.estimatedArrivalTick) {
        // IDEMPOTENT ARRIVAL LOGIC
        this.completeDeliveryArrival(delivery, vehicle, tick);
      } else {
        // Interpolate progress along route
        const totalDuration = Math.max(1, delivery.estimatedArrivalTick - delivery.departureTick);
        const elapsed = tick - delivery.departureTick;
        const ratio = Math.min(0.95, elapsed / totalDuration);
        vehicle.routeProgress = ratio;
        vehicle.position = this.graph.interpolatePosition(delivery.routeNodeIds, ratio);
      }
    }
  }

  private completeDeliveryArrival(delivery: DeliveryTransfer, vehicle: Vehicle, tick: number): void {
    const destination = this.state.facilities.find(f => f.id === delivery.destinationFacilityId);
    const source = this.state.facilities.find(f => f.id === delivery.sourceFacilityId);
    const request = this.state.requests.find(r => r.id === delivery.requestId);

    if (!destination) return;

    // Release reserved inventory at source
    if (source) {
      source.reservedInventory[delivery.resourceId] = Math.max(
        0,
        (source.reservedInventory[delivery.resourceId] || 0) - delivery.quantity
      );
    }

    // Add inventory to destination
    destination.inventory[delivery.resourceId] = (destination.inventory[delivery.resourceId] || 0) + delivery.quantity;

    // Update vehicle
    vehicle.status = 'idle';
    vehicle.currentLoad = 0;
    vehicle.assignedDeliveryId = null;
    vehicle.position = [...destination.position];
    vehicle.currentFacilityId = destination.id;
    vehicle.routeProgress = 1;

    // Update request
    if (request) {
      request.fulfilledQuantity += delivery.quantity;
      if (request.fulfilledQuantity >= request.requestedQuantity) {
        request.status = 'fulfilled';
      }
    }

    // Mark delivery as completed
    delivery.status = 'delivered';
    delivery.actualArrivalTick = tick;

    this.emitEvent({
      id: `evt-arr-${tick}-${delivery.id}`,
      simulationId: this.state.id,
      tick,
      eventType: 'delivery_arrived',
      severity: 'success',
      title: `Delivery Delivered at ${destination.name}`,
      message: `Received ${delivery.quantity} units of ${delivery.resourceId}. Request satisfied.`,
      timestamp: new Date().toISOString(),
    });
  }

  private processConsumption(tick: number): void {
    for (const facility of this.state.facilities) {
      if (facility.operationalStatus === 'offline') continue;

      for (const [resId, rate] of Object.entries(facility.consumptionRates)) {
        if (rate <= 0) continue;

        const currentStock = facility.inventory[resId] || 0;
        const actualDeduction = Math.min(currentStock, rate);

        facility.inventory[resId] = Math.max(0, currentStock - actualDeduction);

        if (facility.inventory[resId] === 0 && currentStock > 0) {
          this.emitEvent({
            id: `evt-stockout-${tick}-${facility.id}-${resId}`,
            simulationId: this.state.id,
            tick,
            eventType: 'stockout_warning',
            severity: 'critical',
            title: `STOCKOUT ALERT: ${facility.name}`,
            message: `Inventory of ${resId} has dropped to ZERO! Immediate resupply required.`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  }

  private processScheduledIncidents(tick: number): void {
    const matching = this.state.scheduledEvents.filter(e => e.tick === tick);
    for (const item of matching) {
      const incident: Incident = {
        ...item.incident,
        id: `inc-${tick}-${Math.random().toString(36).substring(2, 7)}`,
        resolved: false,
      };

      this.state.incidents.push(incident);

      // Apply incident effect
      if (incident.type === 'road_closure' || incident.type === 'flood_expansion') {
        const edge = this.state.roadEdges.find(e => e.id === incident.targetId);
        if (edge) {
          edge.status = 'blocked';
          edge.hazardExposureCost = 100;
          this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
        }
      } else if (incident.type === 'earthquake') {
        const fac = this.state.facilities.find(f => f.id === incident.targetId) || this.state.facilities[0];
        if (fac) {
          fac.operationalStatus = 'degraded';
          fac.capacity = Math.max(100, Math.floor(fac.capacity * 0.6));
          for (const k of Object.keys(fac.inventory)) {
            fac.inventory[k] = Math.floor(fac.inventory[k] * 0.75);
          }
        }
        for (const edge of this.state.roadEdges) {
          edge.status = 'slow';
          edge.hazardExposureCost = 50;
        }
        this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
      } else if (incident.type === 'landslide') {
        const edge = this.state.roadEdges.find(e => e.id === incident.targetId);
        if (edge) {
          edge.status = 'blocked';
          edge.hazardExposureCost = 150;
          this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
        }
      } else if (incident.type === 'weather_change') {
        for (const edge of this.state.roadEdges) {
          if (edge.status === 'open') {
            edge.status = 'slow';
            edge.hazardExposureCost = 30;
          }
        }
        for (const f of this.state.facilities) {
          if (f.type === 'shelter') {
            if (f.consumptionRates['blankets']) f.consumptionRates['blankets'] = Math.ceil(f.consumptionRates['blankets'] * 2.5);
            if (f.consumptionRates['fuel']) f.consumptionRates['fuel'] = Math.ceil(f.consumptionRates['fuel'] * 2);
          }
        }
        this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
      } else if (incident.type === 'acid_rain') {
        for (const f of this.state.facilities) {
          f.operationalStatus = 'degraded';
          if (f.inventory['water']) f.inventory['water'] = Math.floor(f.inventory['water'] * 0.7);
          if (f.inventory['food']) f.inventory['food'] = Math.floor(f.inventory['food'] * 0.7);
        }
      } else if (incident.type === 'satellite_fall') {
        const fac = this.state.facilities.find(f => f.id === incident.targetId);
        if (fac) {
          fac.operationalStatus = 'offline';
          fac.capacity = Math.floor(fac.capacity * 0.2);
          for (const k of Object.keys(fac.inventory)) {
            fac.inventory[k] = Math.floor(fac.inventory[k] * 0.2);
          }
        }
        const edge = this.state.roadEdges.find(e => e.id === incident.targetId);
        if (edge) {
          edge.status = 'blocked';
          edge.hazardExposureCost = 300;
          this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
        }
        // EMP disables first vehicle in proximity
        if (this.state.vehicles[0]) this.state.vehicles[0].status = 'disabled';
      } else if (incident.type === 'warehouse_outage') {
        const fac = this.state.facilities.find(f => f.id === incident.targetId);
        if (fac) {
          fac.operationalStatus = 'offline';
        }
      } else if (incident.type === 'demand_spike') {
        const fac = this.state.facilities.find(f => f.id === incident.targetId);
        if (fac) {
          fac.population += 500;
          for (const res of Object.keys(fac.consumptionRates)) {
            fac.consumptionRates[res] = Math.ceil(fac.consumptionRates[res] * 1.8);
          }
        }
      }

      this.emitEvent({
        id: `evt-inc-${tick}-${incident.id}`,
        simulationId: this.state.id,
        tick,
        eventType: 'incident_started',
        severity: incident.severity === 'catastrophic' || incident.severity === 'severe' ? 'critical' : 'warning',
        title: `INCIDENT: ${incident.name}`,
        message: incident.description,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * User Triggered Disaster Interventions
   * Supports: flood_expansion, earthquake, landslide, weather_change, acid_rain, satellite_fall, road_closure, demand_spike, warehouse_outage, vehicle_breakdown
   */
  public triggerUserIncident(params: {
    type: Incident['type'];
    targetId: string;
    description: string;
  }): void {
    const tick = this.state.currentTick;
    let incidentPos: [number, number, number] = [0, 0, 0];
    let incidentRadius = 8;
    let severity: Incident['severity'] = 'severe';
    let incidentName = `User Action: ${params.type.replace('_', ' ').toUpperCase()}`;

    // Compute center position and specific disruption effects based on disaster type
    if (params.type === 'earthquake') {
      incidentName = 'Seismic Event: Quake Rupture';
      severity = 'catastrophic';
      incidentRadius = 14;
      const fac = this.state.facilities.find(f => f.id === params.targetId) || this.state.facilities[0];
      if (fac) {
        incidentPos = [...fac.position];
        // Damage facility: reduce capacity, degrade operational status, destroy 30% unreserved inventory
        fac.operationalStatus = 'degraded';
        fac.capacity = Math.max(100, Math.floor(fac.capacity * 0.6));
        for (const k of Object.keys(fac.inventory)) {
          fac.inventory[k] = Math.floor(fac.inventory[k] * 0.75);
        }
        // Fracture adjacent roads within radius
        for (const edge of this.state.roadEdges) {
          const nodeFrom = this.state.roadNodes.find(n => n.id === edge.fromNode);
          const nodeTo = this.state.roadNodes.find(n => n.id === edge.toNode);
          if (nodeFrom && nodeTo) {
            const d1 = Math.hypot(nodeFrom.position[0] - incidentPos[0], nodeFrom.position[2] - incidentPos[2]);
            const d2 = Math.hypot(nodeTo.position[0] - incidentPos[0], nodeTo.position[2] - incidentPos[2]);
            if (d1 < 16 || d2 < 16) {
              edge.status = 'slow';
              edge.hazardExposureCost = Math.max(edge.hazardExposureCost, 50);
            }
          }
        }
        this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
      }
    } else if (params.type === 'landslide') {
      incidentName = 'Mass Movement: Landslide Barrier';
      severity = 'severe';
      incidentRadius = 9;
      // Target is a road edge
      const edge = this.state.roadEdges.find(e => e.id === params.targetId) || this.state.roadEdges[0];
      if (edge) {
        edge.status = 'blocked';
        edge.hazardExposureCost = 150;
        const nodeFrom = this.state.roadNodes.find(n => n.id === edge.fromNode);
        const nodeTo = this.state.roadNodes.find(n => n.id === edge.toNode);
        if (nodeFrom && nodeTo) {
          incidentPos = [
            (nodeFrom.position[0] + nodeTo.position[0]) / 2,
            0,
            (nodeFrom.position[2] + nodeTo.position[2]) / 2,
          ];
        }
        // Check if any vehicles currently traversing this edge, immobilize them
        for (const veh of this.state.vehicles) {
          if (veh.status === 'in_transit') {
            const d = Math.hypot(veh.position[0] - incidentPos[0], veh.position[2] - incidentPos[2]);
            if (d < 10) {
              veh.status = 'disabled';
            }
          }
        }
        this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
      }
    } else if (params.type === 'flood_expansion') {
      incidentName = 'Hydrological Surge: Flash Flood Expansion';
      severity = 'severe';
      incidentRadius = 12;
      const edge = this.state.roadEdges.find(e => e.id === params.targetId);
      if (edge) {
        edge.status = 'blocked';
        edge.hazardExposureCost = 100;
        const nodeFrom = this.state.roadNodes.find(n => n.id === edge.fromNode);
        if (nodeFrom) incidentPos = [...nodeFrom.position];
      } else {
        const fac = this.state.facilities.find(f => f.id === params.targetId);
        if (fac) incidentPos = [...fac.position];
      }
      this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
    } else if (params.type === 'weather_change') {
      incidentName = 'Severe Weather: Blizzard & Gale Storm';
      severity = 'moderate';
      incidentRadius = 22;
      // Affects entire quadrant or selected facility zone
      const fac = this.state.facilities.find(f => f.id === params.targetId) || this.state.facilities[0];
      if (fac) incidentPos = [...fac.position];
      // Slow down road speeds across network
      for (const edge of this.state.roadEdges) {
        if (edge.status === 'open') {
          edge.status = 'slow';
          edge.hazardExposureCost = Math.max(edge.hazardExposureCost, 25);
        }
      }
      // Quadruple blanket & fuel burn rates at shelters
      for (const f of this.state.facilities) {
        if (f.type === 'shelter') {
          if (f.consumptionRates['blankets']) f.consumptionRates['blankets'] = Math.ceil(f.consumptionRates['blankets'] * 2.5);
          if (f.consumptionRates['fuel']) f.consumptionRates['fuel'] = Math.ceil(f.consumptionRates['fuel'] * 2);
        }
      }
      this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
    } else if (params.type === 'acid_rain') {
      incidentName = 'Atmospheric Hazard: Corrosive Acid Rain';
      severity = 'severe';
      incidentRadius = 15;
      const fac = this.state.facilities.find(f => f.id === params.targetId) || this.state.facilities[0];
      if (fac) {
        incidentPos = [...fac.position];
        // Corrode unsealed rations & medical stock
        for (const f of this.state.facilities) {
          const dist = Math.hypot(f.position[0] - incidentPos[0], f.position[2] - incidentPos[2]);
          if (dist <= 18) {
            f.operationalStatus = 'degraded';
            if (f.inventory['water']) f.inventory['water'] = Math.floor(f.inventory['water'] * 0.7);
            if (f.inventory['food']) f.inventory['food'] = Math.floor(f.inventory['food'] * 0.7);
          }
        }
      }
    } else if (params.type === 'satellite_fall') {
      incidentName = 'Orbital Debris: Kinetic Satellite Impact';
      severity = 'catastrophic';
      incidentRadius = 11;
      // Strike target facility or node
      const fac = this.state.facilities.find(f => f.id === params.targetId);
      const edge = this.state.roadEdges.find(e => e.id === params.targetId);
      if (fac) {
        incidentPos = [...fac.position];
        fac.operationalStatus = 'offline';
        fac.capacity = Math.floor(fac.capacity * 0.2);
        for (const k of Object.keys(fac.inventory)) {
          fac.inventory[k] = Math.floor(fac.inventory[k] * 0.2);
        }
      } else if (edge) {
        edge.status = 'blocked';
        edge.hazardExposureCost = 300;
        const node = this.state.roadNodes.find(n => n.id === edge.fromNode);
        if (node) incidentPos = [...node.position];
      }
      // EMP shockwave disables electronics in radius
      for (const veh of this.state.vehicles) {
        const d = Math.hypot(veh.position[0] - incidentPos[0], veh.position[2] - incidentPos[2]);
        if (d <= 14) {
          veh.status = 'disabled';
        }
      }
      this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
    } else if (params.type === 'road_closure') {
      const edge = this.state.roadEdges.find(e => e.id === params.targetId);
      if (edge) {
        edge.status = edge.status === 'blocked' ? 'open' : 'blocked';
        const nodeFrom = this.state.roadNodes.find(n => n.id === edge.fromNode);
        if (nodeFrom) incidentPos = [...nodeFrom.position];
        this.graph.updateGraph(this.state.roadNodes, this.state.roadEdges);
      }
    } else if (params.type === 'warehouse_outage') {
      const fac = this.state.facilities.find(f => f.id === params.targetId);
      if (fac) {
        fac.operationalStatus = fac.operationalStatus === 'offline' ? 'operational' : 'offline';
        incidentPos = [...fac.position];
      }
    } else if (params.type === 'demand_spike') {
      const fac = this.state.facilities.find(f => f.id === params.targetId);
      if (fac) {
        fac.population += 600;
        for (const k of Object.keys(fac.consumptionRates)) {
          fac.consumptionRates[k] = Math.ceil(fac.consumptionRates[k] * 2);
        }
        incidentPos = [...fac.position];
      }
    } else if (params.type === 'vehicle_breakdown') {
      const veh = this.state.vehicles.find(v => v.id === params.targetId);
      if (veh) {
        veh.status = veh.status === 'disabled' ? 'idle' : 'disabled';
        incidentPos = [...veh.position];
      }
    }

    const incident: Incident = {
      id: `user-inc-${tick}-${Math.random().toString(36).substring(2, 6)}`,
      name: incidentName,
      type: params.type,
      targetId: params.targetId,
      position: incidentPos,
      radius: incidentRadius,
      startTick: tick,
      durationTicks: 50,
      severity,
      resolved: false,
      description: params.description,
    };

    this.state.incidents.push(incident);

    this.emitEvent({
      id: `evt-user-${tick}-${incident.id}`,
      simulationId: this.state.id,
      tick,
      eventType: 'user_event_injected',
      severity: incident.severity === 'catastrophic' || incident.severity === 'severe' ? 'critical' : 'warning',
      title: `Disaster Deployed: ${incident.name}`,
      message: params.description,
      timestamp: new Date().toISOString(),
    });

    this.notify();
  }

  private updateMetrics(tick: number): void {
    let totalRequested = 0;
    let totalFulfilled = 0;
    let criticalRequested = 0;
    let criticalFulfilled = 0;
    let totalWaitTicks = 0;
    let criticalWaitTicks = 0;
    let completedRequestsCount = 0;
    let completedCriticalCount = 0;

    let requestsFulfilled = 0;
    let requestsPartial = 0;
    let requestsUnfulfilled = 0;

    const unmetByResource: Record<string, number> = {};
    const unmetByFacility: Record<string, number> = {};
    const facilityFulfillments: number[] = [];

    for (const req of this.state.requests) {
      totalRequested += req.requestedQuantity;
      totalFulfilled += req.fulfilledQuantity;
      const deficit = req.requestedQuantity - req.fulfilledQuantity;

      if (deficit > 0) {
        unmetByResource[req.resourceId] = (unmetByResource[req.resourceId] || 0) + deficit;
        unmetByFacility[req.facilityId] = (unmetByFacility[req.facilityId] || 0) + deficit;
      }

      if (req.urgency === 'critical') {
        criticalRequested += req.requestedQuantity;
        criticalFulfilled += req.fulfilledQuantity;
      }

      if (req.status === 'fulfilled') {
        requestsFulfilled++;
        completedRequestsCount++;
        totalWaitTicks += Math.max(1, tick - req.createdTick);
        if (req.urgency === 'critical') {
          completedCriticalCount++;
          criticalWaitTicks += Math.max(1, tick - req.createdTick);
        }
      } else if (req.status === 'partially_allocated' || req.fulfilledQuantity > 0) {
        requestsPartial++;
      } else {
        requestsUnfulfilled++;
      }
    }

    // Fairness Calculation (Jain's Fairness Index across facilities with requests)
    for (const fac of this.state.facilities) {
      const facReqs = this.state.requests.filter(r => r.facilityId === fac.id);
      if (facReqs.length > 0) {
        const facReqTotal = facReqs.reduce((sum, r) => sum + r.requestedQuantity, 0);
        const facFulTotal = facReqs.reduce((sum, r) => sum + r.fulfilledQuantity, 0);
        facilityFulfillments.push(facReqTotal > 0 ? facFulTotal / facReqTotal : 1);
      }
    }

    let fairnessIndex = 1.0;
    if (facilityFulfillments.length > 1) {
      const sumX = facilityFulfillments.reduce((a, b) => a + b, 0);
      const sumX2 = facilityFulfillments.reduce((a, b) => a + b * b, 0);
      const n = facilityFulfillments.length;
      if (sumX2 > 0) {
        fairnessIndex = Math.min(1.0, Math.max(0, (sumX * sumX) / (n * sumX2)));
      }
    }

    const criticalPercent = criticalRequested > 0 
      ? Math.round((criticalFulfilled / criticalRequested) * 100) 
      : 100;

    const vehiclesUtilized = this.state.vehicles.filter(v => v.status === 'in_transit').length;
    const vehicleUtilRate = this.state.vehicles.length > 0 
      ? Math.round((vehiclesUtilized / this.state.vehicles.length) * 100) 
      : 0;

    const metrics: SimulationMetrics = {
      tick,
      criticalDemandFulfilledPercent: criticalPercent,
      totalRequested,
      totalFulfilled,
      totalUnmetDemand: Math.max(0, totalRequested - totalFulfilled),
      unmetDemandByResource: unmetByResource,
      unmetDemandByFacility: unmetByFacility,
      averageFulfillmentTimeTicks: completedRequestsCount > 0 ? Math.round((totalWaitTicks / completedRequestsCount) * 10) / 10 : 0,
      criticalFulfillmentTimeTicks: completedCriticalCount > 0 ? Math.round((criticalWaitTicks / completedCriticalCount) * 10) / 10 : 0,
      requestsTotal: this.state.requests.length,
      requestsFulfilled,
      requestsPartial,
      requestsUnfulfilled,
      deliveriesSuccessful: this.state.deliveries.filter(d => d.status === 'delivered').length,
      deliveriesActive: this.state.deliveries.filter(d => d.status === 'in_transit' || d.status === 'rerouted').length,
      deliveriesRerouted: this.state.deliveries.filter(d => d.status === 'rerouted').length,
      deliveriesFailed: this.state.deliveries.filter(d => d.status === 'cancelled').length,
      vehiclesUtilizedCount: vehiclesUtilized,
      vehicleUtilizationRate: vehicleUtilRate,
      predictedShortagesAvoided: Math.floor(totalFulfilled / 25),
      fairnessIndex: Math.round(fairnessIndex * 100) / 100,
    };

    this.state.metrics = metrics;
    this.state.metricsHistory.push(metrics);
  }

  private emitEvent(event: SimulationEvent): void {
    this.state.events.unshift(event); // most recent first
    if (this.state.events.length > 200) {
      this.state.events.pop();
    }
  }
}
