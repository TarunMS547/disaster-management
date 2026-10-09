import { 
  ScenarioDefinition, 
  ResourceItem, 
  Facility, 
  RoadNode, 
  RoadEdge, 
  Vehicle 
} from '../types/simulation';

export const STANDARD_RESOURCES: ResourceItem[] = [
  {
    id: 'res-med',
    name: 'Critical Medicine Kits',
    category: 'medicine',
    unit: 'crates',
    criticality: 'life_critical',
  },
  {
    id: 'res-oxy',
    name: 'Medical Oxygen Cylinders',
    category: 'medical_oxygen',
    unit: 'tanks',
    criticality: 'life_critical',
  },
  {
    id: 'res-water',
    name: 'Purified Drinking Water',
    category: 'water',
    unit: 'liters (x100)',
    criticality: 'high',
  },
  {
    id: 'res-food',
    name: 'Emergency Ration Packs',
    category: 'food',
    unit: 'rations',
    criticality: 'high',
  },
  {
    id: 'res-blanket',
    name: 'Thermal Blankets',
    category: 'blankets',
    unit: 'bundles',
    criticality: 'medium',
  },
  {
    id: 'res-rescue',
    name: 'Heavy Rescue Gear',
    category: 'rescue_equipment',
    unit: 'kits',
    criticality: 'high',
  },
];

// Helper to generate city road network
export function generateBaseCityTopology(): { nodes: RoadNode[]; edges: RoadEdge[] } {
  // Synthetic city grid layout: 9 primary intersections
  const nodes: RoadNode[] = [
    { id: 'node-nw', name: 'Northwest District', position: [-25, 0, -25] },
    { id: 'node-nc', name: 'North Bridge Sector', position: [0, 0, -25] },
    { id: 'node-ne', name: 'Northeast Harbor', position: [25, 0, -25] },
    { id: 'node-cw', name: 'West Industrial Park', position: [-25, 0, 0] },
    { id: 'node-cc', name: 'Central Plaza Hub', position: [0, 0, 0] },
    { id: 'node-ce', name: 'East Commercial Zone', position: [25, 0, 0] },
    { id: 'node-sw', name: 'Southwest Residential', position: [-25, 0, 25] },
    { id: 'node-sc', name: 'South River Crossing', position: [0, 0, 25] },
    { id: 'node-se', name: 'Southeast Suburbs', position: [25, 0, 25] },
  ];

  const edges: RoadEdge[] = [
    // Horizontal highway links
    { id: 'edge-nw-nc', fromNode: 'node-nw', toNode: 'node-nc', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-nc-ne', fromNode: 'node-nc', toNode: 'node-ne', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-cw-cc', fromNode: 'node-cw', toNode: 'node-cc', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-cc-ce', fromNode: 'node-cc', toNode: 'node-ce', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-sw-sc', fromNode: 'node-sw', toNode: 'node-sc', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-sc-se', fromNode: 'node-sc', toNode: 'node-se', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },

    // Vertical arterial links
    { id: 'edge-nw-cw', fromNode: 'node-nw', toNode: 'node-cw', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-cw-sw', fromNode: 'node-cw', toNode: 'node-sw', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-nc-cc', fromNode: 'node-nc', toNode: 'node-cc', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-cc-sc', fromNode: 'node-cc', toNode: 'node-sc', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-ne-ce', fromNode: 'node-ne', toNode: 'node-ce', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-ce-se', fromNode: 'node-ce', toNode: 'node-se', distance: 25, travelTimeTicks: 3, status: 'open', hazardExposureCost: 0 },

    // Perimeter ring bypasses
    { id: 'edge-nw-cc', fromNode: 'node-nw', toNode: 'node-cc', distance: 35, travelTimeTicks: 4, status: 'open', hazardExposureCost: 0 },
    { id: 'edge-cc-se', fromNode: 'node-cc', toNode: 'node-se', distance: 35, travelTimeTicks: 4, status: 'open', hazardExposureCost: 0 },
  ];

  return { nodes, edges };
}

export function createVehicles(): Vehicle[] {
  return [
    {
      id: 'veh-01',
      name: 'Titan Rapid-01',
      type: 'rapid_response_van',
      capacity: 60,
      currentLoad: 0,
      speed: 1.2,
      position: [-25, 0, 0],
      currentFacilityId: 'fac-resp-hq',
      status: 'idle',
      assignedDeliveryId: null,
      currentRouteNodeIds: [],
      routeProgress: 0,
      currentEdgeIndex: 0,
    },
    {
      id: 'veh-02',
      name: 'Atlas Cargo-02',
      type: 'heavy_cargo_truck',
      capacity: 250,
      currentLoad: 0,
      speed: 0.8,
      position: [25, 0, -25],
      currentFacilityId: 'fac-wh-north',
      status: 'idle',
      assignedDeliveryId: null,
      currentRouteNodeIds: [],
      routeProgress: 0,
      currentEdgeIndex: 0,
    },
    {
      id: 'veh-03',
      name: 'AeroMed Drone-03',
      type: 'medical_drone',
      capacity: 35,
      currentLoad: 0,
      speed: 2.0,
      position: [-25, 0, 25],
      currentFacilityId: 'fac-hosp-metro',
      status: 'idle',
      assignedDeliveryId: null,
      currentRouteNodeIds: [],
      routeProgress: 0,
      currentEdgeIndex: 0,
    },
    {
      id: 'veh-04',
      name: 'Hydra Amphibious-04',
      type: 'amphibious_hauler',
      capacity: 120,
      currentLoad: 0,
      speed: 1.0,
      position: [0, 0, 0],
      currentFacilityId: 'fac-resp-hq',
      status: 'idle',
      assignedDeliveryId: null,
      currentRouteNodeIds: [],
      routeProgress: 0,
      currentEdgeIndex: 0,
    },
  ];
}

// SCENARIO A: Urban Flood Scenario
export function getUrbanFloodScenario(): ScenarioDefinition {
  const { nodes, edges } = generateBaseCityTopology();

  const facilities: Facility[] = [
    {
      id: 'fac-resp-hq',
      name: 'Metro Emergency HQ',
      type: 'response_center',
      district: 'Central Hub',
      position: [0, 0, 0],
      inventory: { 'res-med': 120, 'res-oxy': 80, 'res-water': 300, 'res-food': 300, 'res-blanket': 150, 'res-rescue': 40 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 1500,
      priority: 9,
      population: 400,
      consumptionRates: { 'res-water': 1, 'res-food': 1 },
      operationalStatus: 'operational',
    },
    {
      id: 'fac-wh-north',
      name: 'North Logistics Depot',
      type: 'warehouse',
      district: 'Harbor North',
      position: [25, 0, -25],
      inventory: { 'res-med': 180, 'res-oxy': 120, 'res-water': 600, 'res-food': 500, 'res-blanket': 250, 'res-rescue': 60 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 2500,
      priority: 6,
      population: 50,
      consumptionRates: {},
      operationalStatus: 'operational',
    },
    {
      id: 'fac-hosp-metro',
      name: 'St. Jude General Hospital',
      type: 'hospital',
      district: 'Southwest Sector',
      position: [-25, 0, 25],
      inventory: { 'res-med': 25, 'res-oxy': 15, 'res-water': 80, 'res-food': 60, 'res-blanket': 40, 'res-rescue': 0 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 600,
      priority: 10,
      population: 1250,
      consumptionRates: { 'res-med': 3, 'res-oxy': 2, 'res-water': 5, 'res-food': 4 },
      operationalStatus: 'operational',
    },
    {
      id: 'fac-shelter-east',
      name: 'Riverside Community Shelter',
      type: 'shelter',
      district: 'East Commercial',
      position: [25, 0, 0],
      inventory: { 'res-med': 5, 'res-oxy': 0, 'res-water': 40, 'res-food': 30, 'res-blanket': 50, 'res-rescue': 0 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 800,
      priority: 7,
      population: 850,
      consumptionRates: { 'res-water': 6, 'res-food': 5, 'res-blanket': 1 },
      operationalStatus: 'operational',
    },
    {
      id: 'fac-shelter-south',
      name: 'South Valley High Shelter',
      type: 'shelter',
      district: 'South River District',
      position: [0, 0, 25],
      inventory: { 'res-med': 10, 'res-oxy': 0, 'res-water': 50, 'res-food': 45, 'res-blanket': 30, 'res-rescue': 0 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 700,
      priority: 8,
      population: 950,
      consumptionRates: { 'res-water': 7, 'res-food': 6 },
      operationalStatus: 'operational',
    },
  ];

  return {
    id: 'scen-01',
    key: 'urban_flood',
    name: 'Scenario A: Urban Flash Flood',
    description: 'Catastrophic river surge strikes the southern and central corridors. Key bridges flood and close, cutting off traditional supply lines while hospital and shelter critical reserves deplete.',
    initialSeed: 42001,
    tickIntervalMs: 1200,
    maxTicks: 150,
    facilities,
    roadNodes: nodes,
    roadEdges: edges,
    vehicles: createVehicles(),
    resources: STANDARD_RESOURCES,
    eventSchedule: [
      {
        tick: 4,
        incident: {
          name: 'Flash Flood Cresting - River Crossing',
          type: 'flood_expansion',
          targetId: 'edge-cc-sc',
          position: [0, 0, 15],
          radius: 12,
          startTick: 4,
          durationTicks: 45,
          severity: 'severe',
          description: 'Rising water levels submerge Central-South arterial bridge. Road impassable for standard vehicles.',
        },
      },
      {
        tick: 10,
        incident: {
          name: 'Critical Road Inundation',
          type: 'road_closure',
          targetId: 'edge-sw-sc',
          position: [-12, 0, 25],
          radius: 8,
          startTick: 10,
          durationTicks: 50,
          severity: 'severe',
          description: 'Secondary levee breach closes Southwest connecting link.',
        },
      },
      {
        tick: 18,
        incident: {
          name: 'Evacuee Surge at South Shelter',
          type: 'demand_spike',
          targetId: 'fac-shelter-south',
          position: [0, 0, 25],
          radius: 5,
          startTick: 18,
          durationTicks: 30,
          severity: 'moderate',
          description: '600 additional flood victims arrive at South Valley Shelter. Water and ration burn rates double.',
        },
      },
    ],
  };
}

// SCENARIO B: Hospital Supply Shortage
export function getHospitalShortageScenario(): ScenarioDefinition {
  const { nodes, edges } = generateBaseCityTopology();

  const facilities: Facility[] = [
    {
      id: 'fac-resp-hq',
      name: 'Metro Emergency HQ',
      type: 'response_center',
      district: 'Central Hub',
      position: [0, 0, 0],
      inventory: { 'res-med': 40, 'res-oxy': 20, 'res-water': 400, 'res-food': 300, 'res-blanket': 100, 'res-rescue': 20 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 1500,
      priority: 8,
      population: 200,
      consumptionRates: {},
      operationalStatus: 'operational',
    },
    {
      id: 'fac-wh-near',
      name: 'West Industrial Annex (Near)',
      type: 'warehouse',
      district: 'Industrial West',
      position: [-25, 0, 0],
      inventory: { 'res-med': 15, 'res-oxy': 8, 'res-water': 120, 'res-food': 100, 'res-blanket': 40, 'res-rescue': 10 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 1000,
      priority: 5,
      population: 30,
      consumptionRates: {},
      operationalStatus: 'operational', // Partial supply
    },
    {
      id: 'fac-wh-far',
      name: 'Harbor Deep Strategic Reserve (Far)',
      type: 'warehouse',
      district: 'Northeast Harbor',
      position: [25, 0, -25],
      inventory: { 'res-med': 220, 'res-oxy': 180, 'res-water': 800, 'res-food': 600, 'res-blanket': 300, 'res-rescue': 80 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 3000,
      priority: 6,
      population: 40,
      consumptionRates: {},
      operationalStatus: 'operational', // Surplus supply
    },
    {
      id: 'fac-hosp-critical',
      name: 'Memorial Trauma Hospital',
      type: 'hospital',
      district: 'Southwest Sector',
      position: [-25, 0, 25],
      inventory: { 'res-med': 10, 'res-oxy': 4, 'res-water': 50, 'res-food': 40, 'res-blanket': 20, 'res-rescue': 0 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 800,
      priority: 10,
      population: 1800,
      consumptionRates: { 'res-med': 4, 'res-oxy': 3, 'res-water': 3, 'res-food': 2 },
      operationalStatus: 'operational',
    },
  ];

  return {
    id: 'scen-02',
    key: 'hospital_shortage',
    name: 'Scenario B: Severe Hospital Supply Shortage',
    description: 'Trauma center faces acute oxygen and life-saving medicine depletion within simulated minutes. The nearest annex has only partial inventory, demanding multi-tier coordinated dispatch from the distant strategic reserve.',
    initialSeed: 53102,
    tickIntervalMs: 1200,
    maxTicks: 150,
    facilities,
    roadNodes: nodes,
    roadEdges: edges,
    vehicles: createVehicles(),
    resources: STANDARD_RESOURCES,
    eventSchedule: [
      {
        tick: 2,
        incident: {
          name: 'ICU Oxygen Depletion Alert',
          type: 'demand_spike',
          targetId: 'fac-hosp-critical',
          position: [-25, 0, 25],
          radius: 4,
          startTick: 2,
          durationTicks: 60,
          severity: 'catastrophic',
          description: 'Mass casualty intake rapidly exhausts remaining medical oxygen and cardiovascular medicines.',
        },
      },
      {
        tick: 8,
        incident: {
          name: 'Traffic Chokepoint on Central Artery',
          type: 'road_closure',
          targetId: 'edge-cc-sc',
          position: [0, 0, 15],
          radius: 6,
          startTick: 8,
          durationTicks: 25,
          severity: 'moderate',
          description: 'Civilian congestion forces heavy medical transports to reroute through peripheral ring.',
        },
      },
    ],
  };
}

// SCENARIO C: Compound Disruption
export function getCompoundDisruptionScenario(): ScenarioDefinition {
  const { nodes, edges } = generateBaseCityTopology();

  const facilities: Facility[] = [
    {
      id: 'fac-resp-hq',
      name: 'Metro Emergency HQ',
      type: 'response_center',
      district: 'Central Hub',
      position: [0, 0, 0],
      inventory: { 'res-med': 100, 'res-oxy': 60, 'res-water': 350, 'res-food': 250, 'res-blanket': 100, 'res-rescue': 50 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 1500,
      priority: 9,
      population: 300,
      consumptionRates: {},
      operationalStatus: 'operational',
    },
    {
      id: 'fac-wh-primary',
      name: 'South Central Distribution Hub',
      type: 'warehouse',
      district: 'South River Crossing',
      position: [0, 0, 25],
      inventory: { 'res-med': 150, 'res-oxy': 100, 'res-water': 500, 'res-food': 400, 'res-blanket': 200, 'res-rescue': 40 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 2200,
      priority: 7,
      population: 40,
      consumptionRates: {},
      operationalStatus: 'operational',
    },
    {
      id: 'fac-wh-backup',
      name: 'Northwest Auxiliary Warehouse',
      type: 'warehouse',
      district: 'Northwest District',
      position: [-25, 0, -25],
      inventory: { 'res-med': 90, 'res-oxy': 70, 'res-water': 450, 'res-food': 350, 'res-blanket': 180, 'res-rescue': 30 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 1800,
      priority: 6,
      population: 30,
      consumptionRates: {},
      operationalStatus: 'operational',
    },
    {
      id: 'fac-hosp-east',
      name: 'East Shore Medical Center',
      type: 'hospital',
      district: 'East Commercial',
      position: [25, 0, 0],
      inventory: { 'res-med': 20, 'res-oxy': 12, 'res-water': 70, 'res-food': 50, 'res-blanket': 30, 'res-rescue': 0 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 700,
      priority: 10,
      population: 1400,
      consumptionRates: { 'res-med': 3, 'res-oxy': 2, 'res-water': 4, 'res-food': 3 },
      operationalStatus: 'operational',
    },
    {
      id: 'fac-shelter-suburbs',
      name: 'Southeast Evacuation Center',
      type: 'shelter',
      district: 'Southeast Suburbs',
      position: [25, 0, 25],
      inventory: { 'res-med': 10, 'res-oxy': 0, 'res-water': 60, 'res-food': 40, 'res-blanket': 60, 'res-rescue': 0 },
      reservedInventory: { 'res-med': 0, 'res-oxy': 0, 'res-water': 0, 'res-food': 0, 'res-blanket': 0, 'res-rescue': 0 },
      capacity: 900,
      priority: 7,
      population: 1100,
      consumptionRates: { 'res-water': 8, 'res-food': 7 },
      operationalStatus: 'operational',
    },
  ];

  return {
    id: 'scen-03',
    key: 'compound_disruption',
    name: 'Scenario C: Compound Cascading Disruption',
    description: 'Catastrophic chain reaction: Primary distribution hub suffers structural failure, arterial roads collapse simultaneously, and hospital burn rate peaks.',
    initialSeed: 69420,
    tickIntervalMs: 1200,
    maxTicks: 150,
    facilities,
    roadNodes: nodes,
    roadEdges: edges,
    vehicles: createVehicles(),
    resources: STANDARD_RESOURCES,
    eventSchedule: [
      {
        tick: 5,
        incident: {
          name: 'Primary Hub Structural Failure',
          type: 'warehouse_outage',
          targetId: 'fac-wh-primary',
          position: [0, 0, 25],
          radius: 8,
          startTick: 5,
          durationTicks: 50,
          severity: 'catastrophic',
          description: 'Power grid collapse and seismic damage shuts down South Central Hub. Automated logistics offline.',
        },
      },
      {
        tick: 12,
        incident: {
          name: 'Key Arterial Bridge Collapse',
          type: 'road_closure',
          targetId: 'edge-cc-ce',
          position: [12, 0, 0],
          radius: 6,
          startTick: 12,
          durationTicks: 40,
          severity: 'severe',
          description: 'Bridge collapse blocks East Commercial corridor. Deliveries in transit must recalculate alternative routes.',
        },
      },
    ],
  };
}

// SCENARIO D: Earthquake Catastrophe
export function getEarthquakeScenario(): ScenarioDefinition {
  const { nodes, edges } = generateBaseCityTopology();
  const base = getUrbanFloodScenario();

  return {
    id: 'scen-04',
    key: 'earthquake_catastrophe',
    name: 'Scenario D: Magnitude 7.8 Richter Earthquake',
    description: 'Massive tectonic rupture fractures central city foundations, partially collapses hospitals, fractures key arterial roads into crawl speeds, and creates critical medical trauma surges.',
    initialSeed: 55432,
    tickIntervalMs: 1200,
    maxTicks: 150,
    facilities: base.facilities,
    roadNodes: nodes,
    roadEdges: edges,
    vehicles: createVehicles(),
    resources: STANDARD_RESOURCES,
    eventSchedule: [
      {
        tick: 2,
        incident: {
          name: 'Epicenter Rupture - Southwest Basin',
          type: 'earthquake',
          targetId: 'fac-hosp-metro',
          position: [-25, 0, 25],
          radius: 16,
          startTick: 2,
          durationTicks: 60,
          severity: 'catastrophic',
          description: 'Magnitude 7.8 seismic strike severely damages St. Jude General Hospital and cracks regional asphalt bridges.',
        },
      },
      {
        tick: 8,
        incident: {
          name: 'Critical Trauma Mass Influx',
          type: 'demand_spike',
          targetId: 'fac-hosp-metro',
          position: [-25, 0, 25],
          radius: 6,
          startTick: 8,
          durationTicks: 45,
          severity: 'severe',
          description: 'Hundreds of injured citizens overwhelm hospital ER. Oxygen and critical medicine consumption triples.',
        },
      },
    ],
  };
}

// SCENARIO E: Landslide Avalanche
export function getLandslideScenario(): ScenarioDefinition {
  const { nodes, edges } = generateBaseCityTopology();
  const base = getUrbanFloodScenario();

  return {
    id: 'scen-05',
    key: 'landslide_avalanche',
    name: 'Scenario E: Mountainous Landslide & Mud Avalanche',
    description: 'Torrential hillside destabilization sends thousands of tons of mud and boulders down on main logistics arteries, burying trucks and cutting off industrial warehouses.',
    initialSeed: 33219,
    tickIntervalMs: 1200,
    maxTicks: 150,
    facilities: base.facilities,
    roadNodes: nodes,
    roadEdges: edges,
    vehicles: createVehicles(),
    resources: STANDARD_RESOURCES,
    eventSchedule: [
      {
        tick: 3,
        incident: {
          name: 'Massive Hillside Slump Barrier',
          type: 'landslide',
          targetId: 'edge-cw-cc',
          position: [-12, 0, 0],
          radius: 10,
          startTick: 3,
          durationTicks: 55,
          severity: 'severe',
          description: 'High velocity mudflow smothers the West Industrial Park connector. Ground logistics disabled along this axis.',
        },
      },
      {
        tick: 9,
        incident: {
          name: 'Secondary Slope Failure',
          type: 'landslide',
          targetId: 'edge-nw-cw',
          position: [-25, 0, -12],
          radius: 9,
          startTick: 9,
          durationTicks: 50,
          severity: 'severe',
          description: 'Secondary rockfall isolates the Northwest distribution corridor.',
        },
      },
    ],
  };
}

// SCENARIO F: Extreme Weather Blizzard
export function getWeatherBlizzardScenario(): ScenarioDefinition {
  const { nodes, edges } = generateBaseCityTopology();
  const base = getUrbanFloodScenario();

  return {
    id: 'scen-06',
    key: 'extreme_weather_blizzard',
    name: 'Scenario F: Arctic Freeze & Severe Gale Blizzard',
    description: 'Sub-zero temperatures and 80mph blizzard winds sweep the metro grid. Road speeds drop dramatically while thermal blanket and heating fuel burn rates escalate.',
    initialSeed: 88712,
    tickIntervalMs: 1200,
    maxTicks: 150,
    facilities: base.facilities,
    roadNodes: nodes,
    roadEdges: edges,
    vehicles: createVehicles(),
    resources: STANDARD_RESOURCES,
    eventSchedule: [
      {
        tick: 2,
        incident: {
          name: 'Sub-Zero Polar Vortex Strike',
          type: 'weather_change',
          targetId: 'fac-shelter-east',
          position: [0, 0, 0],
          radius: 25,
          startTick: 2,
          durationTicks: 65,
          severity: 'severe',
          description: 'City-wide arctic tempest reduces vehicle traction and quadruples blanket demand at all civilian shelters.',
        },
      },
    ],
  };
}

// SCENARIO G: Acid Rain Fallout
export function getAcidRainScenario(): ScenarioDefinition {
  const { nodes, edges } = generateBaseCityTopology();
  const base = getUrbanFloodScenario();

  return {
    id: 'scen-07',
    key: 'acid_rain_fallout',
    name: 'Scenario G: Toxic Chemical Acid Rain Fallout',
    description: 'Industrial chemical refinery disaster releases corrosive nitric and sulfuric aerosol clouds, showering toxic rain that ruins water reservoirs and corrodes open storehouses.',
    initialSeed: 91144,
    tickIntervalMs: 1200,
    maxTicks: 150,
    facilities: base.facilities,
    roadNodes: nodes,
    roadEdges: edges,
    vehicles: createVehicles(),
    resources: STANDARD_RESOURCES,
    eventSchedule: [
      {
        tick: 3,
        incident: {
          name: 'Corrosive Vapor Plume & Acid Downpour',
          type: 'acid_rain',
          targetId: 'fac-wh-central',
          position: [0, 0, -25],
          radius: 18,
          startTick: 3,
          durationTicks: 55,
          severity: 'severe',
          description: 'Acidic fallout degrades open warehouse stockpiles, contaminating potable water supplies across the northern sectors.',
        },
      },
    ],
  };
}

// SCENARIO H: Satellite Kinetic Impact
export function getSatelliteFallScenario(): ScenarioDefinition {
  const { nodes, edges } = generateBaseCityTopology();
  const base = getUrbanFloodScenario();

  return {
    id: 'scen-08',
    key: 'satellite_kinetic_impact',
    name: 'Scenario H: Orbital Satellite De-Orbit & EMP Blast',
    description: 'A 6-ton defunct military reconnaissance satellite crashes into the urban core, creating a smoking crater and radiating a high-frequency EMP burst that disables nearby autonomous vehicles.',
    initialSeed: 77205,
    tickIntervalMs: 1200,
    maxTicks: 150,
    facilities: base.facilities,
    roadNodes: nodes,
    roadEdges: edges,
    vehicles: createVehicles(),
    resources: STANDARD_RESOURCES,
    eventSchedule: [
      {
        tick: 4,
        incident: {
          name: 'Orbital Kinetic Crater & EMP Burst',
          type: 'satellite_fall',
          targetId: 'edge-cc-ce',
          position: [12, 0, 0],
          radius: 12,
          startTick: 4,
          durationTicks: 60,
          severity: 'catastrophic',
          description: 'Orbital wreckage incinerates East Commercial bridge node. EMP shockwave fries guidance systems of in-transit vehicles.',
        },
      },
    ],
  };
}

// SCENARIO I: Compound Mega Apocalypse
export function getCompoundApocalypseScenario(): ScenarioDefinition {
  const { nodes, edges } = generateBaseCityTopology();
  const base = getUrbanFloodScenario();

  return {
    id: 'scen-09',
    key: 'compound_apocalypse',
    name: 'Scenario I: Simultaneous Multi-Disaster Cataclysm',
    description: 'Simultaneous compounding mega-disaster: River flood surge, magnitude 7 earthquake, mountain landslide, and orbital crash ignite simultaneous emergency calls.',
    initialSeed: 99999,
    tickIntervalMs: 1200,
    maxTicks: 150,
    facilities: base.facilities,
    roadNodes: nodes,
    roadEdges: edges,
    vehicles: createVehicles(),
    resources: STANDARD_RESOURCES,
    eventSchedule: [
      {
        tick: 2,
        incident: {
          name: 'Flash River Flooding',
          type: 'flood_expansion',
          targetId: 'edge-cc-sc',
          position: [0, 0, 15],
          radius: 12,
          startTick: 2,
          durationTicks: 50,
          severity: 'severe',
          description: 'Southern river breach inundates primary crossing.',
        },
      },
      {
        tick: 5,
        incident: {
          name: 'Seismic Shockwave',
          type: 'earthquake',
          targetId: 'fac-hosp-metro',
          position: [-25, 0, 25],
          radius: 14,
          startTick: 5,
          durationTicks: 60,
          severity: 'catastrophic',
          description: 'Earthquake damages hospital infrastructure.',
        },
      },
      {
        tick: 9,
        incident: {
          name: 'Mountain Landslide Barrier',
          type: 'landslide',
          targetId: 'edge-nw-cw',
          position: [-25, 0, -12],
          radius: 10,
          startTick: 9,
          durationTicks: 45,
          severity: 'severe',
          description: 'Mudflow shuts down Western logistics depot.',
        },
      },
      {
        tick: 14,
        incident: {
          name: 'Satellite Kinetic Impact',
          type: 'satellite_fall',
          targetId: 'edge-cc-ce',
          position: [12, 0, 0],
          radius: 12,
          startTick: 14,
          durationTicks: 50,
          severity: 'catastrophic',
          description: 'Satellite crater burns East corridor with EMP wave.',
        },
      },
    ],
  };
}

export const SEEDED_SCENARIOS: Record<ScenarioDefinition['key'], ScenarioDefinition> = {
  urban_flood: getUrbanFloodScenario(),
  hospital_shortage: getHospitalShortageScenario(),
  compound_disruption: getCompoundDisruptionScenario(),
  earthquake_catastrophe: getEarthquakeScenario(),
  landslide_avalanche: getLandslideScenario(),
  extreme_weather_blizzard: getWeatherBlizzardScenario(),
  acid_rain_fallout: getAcidRainScenario(),
  satellite_kinetic_impact: getSatelliteFallScenario(),
  compound_apocalypse: getCompoundApocalypseScenario(),
};
