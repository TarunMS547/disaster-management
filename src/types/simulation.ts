export type FacilityType = 'response_center' | 'warehouse' | 'hospital' | 'shelter';

export type ResourceCategory = 
  | 'food' 
  | 'water' 
  | 'medicine' 
  | 'medical_oxygen' 
  | 'blankets' 
  | 'fuel' 
  | 'rescue_equipment';

export interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  unit: string;
  criticality: 'low' | 'medium' | 'high' | 'life_critical';
  shelfLifeTicks?: number;
}

export interface InventoryMap {
  [resourceId: string]: number;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  district: string;
  position: [number, number, number]; // [x, y, z] for 3D coordinates
  inventory: InventoryMap;
  reservedInventory: InventoryMap; // Reserved for outgoing transfers
  capacity: number; // Max storage volume
  priority: number; // Base priority: 1-10 (hospitals & response centers higher)
  population: number; // Affected people sheltered/treated
  consumptionRates: { [resourceId: string]: number }; // Units per simulation tick
  operationalStatus: 'operational' | 'degraded' | 'offline';
}

export type RoadStatus = 'open' | 'slow' | 'blocked';

export interface RoadNode {
  id: string;
  name: string;
  position: [number, number, number];
}

export interface RoadEdge {
  id: string;
  fromNode: string;
  toNode: string;
  distance: number; // Distance in arbitrary map units
  travelTimeTicks: number; // Estimated baseline ticks
  status: RoadStatus;
  hazardExposureCost: number; // Risk penalty (e.g. near flood)
}

export type VehicleType = 'rapid_response_van' | 'heavy_cargo_truck' | 'medical_drone' | 'amphibious_hauler';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  capacity: number; // Load limit in units
  currentLoad: number;
  speed: number; // Units per tick
  position: [number, number, number];
  currentFacilityId: string | null;
  status: 'idle' | 'in_transit' | 'maintenance' | 'disabled';
  assignedDeliveryId: string | null;
  currentRouteNodeIds: string[];
  routeProgress: number; // 0 to 1 along current edge
  currentEdgeIndex: number;
}

export type RequestUrgency = 'low' | 'medium' | 'high' | 'critical';
export type RequestStatus = 'pending' | 'partially_allocated' | 'allocated' | 'in_transit' | 'fulfilled' | 'cancelled';

export interface ResourceRequest {
  id: string;
  facilityId: string;
  resourceId: string;
  requestedQuantity: number;
  allocatedQuantity: number;
  fulfilledQuantity: number;
  urgency: RequestUrgency;
  createdTick: number;
  deadlineTick: number;
  status: RequestStatus;
  reason?: string;
}

export type DeliveryStatus = 'scheduled' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled' | 'rerouted';

export interface DeliveryTransfer {
  id: string;
  requestId: string;
  sourceFacilityId: string;
  destinationFacilityId: string;
  resourceId: string;
  quantity: number;
  vehicleId: string;
  routeNodeIds: string[];
  departureTick: number;
  estimatedArrivalTick: number;
  actualArrivalTick: number | null;
  status: DeliveryStatus;
  pathCoordinates?: [number, number, number][];
}

export type IncidentType = 
  | 'flood_expansion' 
  | 'earthquake' 
  | 'landslide' 
  | 'weather_change' 
  | 'acid_rain' 
  | 'satellite_fall' 
  | 'road_closure' 
  | 'demand_spike' 
  | 'warehouse_outage' 
  | 'vehicle_breakdown';

export interface Incident {
  id: string;
  name: string;
  type: IncidentType;
  targetId: string; // facilityId, edgeId, or vehicleId
  position: [number, number, number];
  radius: number; // For area hazards (e.g., flood zones)
  startTick: number;
  durationTicks: number;
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  resolved: boolean;
  description: string;
}

export type AgentRole = 
  | 'disaster_coordinator' 
  | 'hospital_agent' 
  | 'shelter_agent' 
  | 'logistics_agent' 
  | 'marketplace_agent';

export interface AgentDecision {
  id: string;
  simulationId: string;
  tick: number;
  agentRole: AgentRole;
  agentName: string;
  actionType: 'request_created' | 'surplus_identified' | 'transfer_proposed' | 'plan_approved' | 'plan_rejected' | 'route_replanned' | 'transfer_dispatched' | 'transfer_delivered';
  summary: string;
  rationale: string;
  facts: Record<string, unknown>;
  proposal: Record<string, unknown>;
  validationStatus: 'valid' | 'rejected_invariant_failed' | 'infeasible_route' | 'insufficient_inventory';
  validationMessage?: string;
  timestamp: string;
}

export interface SimulationEvent {
  id: string;
  simulationId: string;
  tick: number;
  eventType: 
    | 'tick_advanced'
    | 'incident_started'
    | 'incident_resolved'
    | 'user_event_injected'
    | 'request_created'
    | 'delivery_dispatched'
    | 'delivery_rerouted'
    | 'delivery_arrived'
    | 'stockout_warning'
    | 'shortage_prevented';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface SimulationMetrics {
  tick: number;
  criticalDemandFulfilledPercent: number;
  totalRequested: number;
  totalFulfilled: number;
  totalUnmetDemand: number;
  unmetDemandByResource: Record<string, number>;
  unmetDemandByFacility: Record<string, number>;
  averageFulfillmentTimeTicks: number;
  criticalFulfillmentTimeTicks: number;
  requestsTotal: number;
  requestsFulfilled: number;
  requestsPartial: number;
  requestsUnfulfilled: number;
  deliveriesSuccessful: number;
  deliveriesActive: number;
  deliveriesRerouted: number;
  deliveriesFailed: number;
  vehiclesUtilizedCount: number;
  vehicleUtilizationRate: number;
  predictedShortagesAvoided: number;
  fairnessIndex: number; // Jain's fairness index (0 to 1)
}

export interface ScenarioDefinition {
  id: string;
  key: 
    | 'urban_flood' 
    | 'hospital_shortage' 
    | 'compound_disruption'
    | 'earthquake_catastrophe'
    | 'landslide_avalanche'
    | 'extreme_weather_blizzard'
    | 'acid_rain_fallout'
    | 'satellite_kinetic_impact'
    | 'compound_apocalypse';
  name: string;
  description: string;
  initialSeed: number;
  tickIntervalMs: number;
  maxTicks: number;
  eventSchedule: Array<{
    tick: number;
    incident: Omit<Incident, 'id' | 'resolved'>;
  }>;
  facilities: Facility[];
  roadNodes: RoadNode[];
  roadEdges: RoadEdge[];
  vehicles: Vehicle[];
  resources: ResourceItem[];
}

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface SimulationState {
  id: string;
  name: string;
  scenarioKey: ScenarioDefinition['key'];
  seed: number;
  status: SimulationStatus;
  currentTick: number;
  tickSpeedMultiplier: number; // 1, 2, 5
  facilities: Facility[];
  roadNodes: RoadNode[];
  roadEdges: RoadEdge[];
  vehicles: Vehicle[];
  requests: ResourceRequest[];
  deliveries: DeliveryTransfer[];
  incidents: Incident[];
  resources: ResourceItem[];
  events: SimulationEvent[];
  decisions: AgentDecision[];
  metrics: SimulationMetrics;
  metricsHistory: SimulationMetrics[];
  scheduledEvents: ScenarioDefinition['eventSchedule'];
}
