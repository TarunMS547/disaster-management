import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../src/simulation/engine';
import { RoadGraph } from '../src/simulation/graph';
import { SEEDED_SCENARIOS, generateBaseCityTopology } from '../src/simulation/scenarios';
import { DisasterCoordinatorAgent } from '../src/simulation/agents/coordinator';
import { DeliveryTransfer } from '../src/types/simulation';

describe('ARES Simulation Invariants & Domain Engine', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine('urban_flood', 42001);
  });

  it('INVARIANT: Reproducibility — Same seed produces identical initial state and events', () => {
    const engineA = new SimulationEngine('urban_flood', 12345);
    const engineB = new SimulationEngine('urban_flood', 12345);

    expect(engineA.getState().seed).toBe(engineB.getState().seed);
    expect(engineA.getState().facilities.length).toBe(engineB.getState().facilities.length);
    expect(engineA.getState().roadEdges.length).toBe(engineB.getState().roadEdges.length);

    // Initial inventories match exactly
    for (let i = 0; i < engineA.getState().facilities.length; i++) {
      expect(engineA.getState().facilities[i].inventory).toEqual(engineB.getState().facilities[i].inventory);
    }
  });

  it('INVARIANT: Inventory is never negative during simulation advancement', () => {
    // Advance simulation through multiple ticks
    for (let t = 0; t < 25; t++) {
      engine.step();
      for (const fac of engine.getState().facilities) {
        for (const [resId, qty] of Object.entries(fac.inventory)) {
          expect(qty).toBeGreaterThanOrEqual(0);
        }
        for (const [resId, reservedQty] of Object.entries(fac.reservedInventory)) {
          expect(reservedQty).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('INVARIANT: Routing — Blocked roads are strictly excluded from feasible routes', () => {
    const { nodes, edges } = generateBaseCityTopology();
    const graph = new RoadGraph(nodes, edges);

    // Initial path from node-cc to node-sc is 1 edge (travelTicks: 3)
    const initialRoute = graph.findShortestPath('node-cc', 'node-sc');
    expect(initialRoute.feasible).toBe(true);
    expect(initialRoute.pathNodeIds).toEqual(['node-cc', 'node-sc']);

    // Block the edge
    const directEdge = edges.find(e => e.id === 'edge-cc-sc')!;
    directEdge.status = 'blocked';
    graph.updateGraph(nodes, edges);

    // Recompute path: must route around blocked corridor
    const rerouted = graph.findShortestPath('node-cc', 'node-sc');
    expect(rerouted.feasible).toBe(true);
    // Cannot contain direct edge
    expect(rerouted.pathNodeIds.length).toBeGreaterThan(2);
    expect(graph.isRouteBlocked(rerouted.pathNodeIds)).toBe(false);
  });

  it('INVARIANT: Vehicle Capacity & Reservation Enforcement', () => {
    const state = engine.getState();
    const source = state.facilities[0];
    const dest = state.facilities[1];
    const vehicle = state.vehicles[0];

    // Attempt transfer that exceeds vehicle capacity
    const excessiveTransfer: DeliveryTransfer = {
      id: 'test-del-overflow',
      requestId: 'test-req',
      sourceFacilityId: source.id,
      destinationFacilityId: dest.id,
      resourceId: 'res-med',
      quantity: vehicle.capacity + 999, // Exceeds capacity
      vehicleId: vehicle.id,
      routeNodeIds: ['node-nw', 'node-nc'],
      departureTick: 0,
      estimatedArrivalTick: 5,
      actualArrivalTick: null,
      status: 'scheduled',
    };

    const evaluation = DisasterCoordinatorAgent.evaluateProposedTransfers(state, [excessiveTransfer]);
    expect(evaluation.approvedTransfers.length).toBe(0);
    expect(evaluation.rejectedTransfers.length).toBe(1);
    expect(evaluation.rejectedTransfers[0].reason).toContain('exceeds vehicle capacity');
  });

  it('INVARIANT: Reset returns engine to the exact initial state', () => {
    // Advance 10 ticks
    for (let i = 0; i < 10; i++) {
      engine.step();
    }
    expect(engine.getState().currentTick).toBe(10);

    // Reset
    engine.reset();
    expect(engine.getState().currentTick).toBe(0);
    expect(engine.getState().status).toBe('idle');
    expect(engine.getState().deliveries.length).toBe(0);
  });

  it('LIFECYCLE: Step advances clock by exactly 1 tick', () => {
    const startTick = engine.getState().currentTick;
    engine.step();
    expect(engine.getState().currentTick).toBe(startTick + 1);
  });

  it('USER DISRUPTIONS: Injected road closure updates graph immediately', () => {
    const edgeToClose = engine.getState().roadEdges[0];
    engine.triggerUserIncident({
      type: 'road_closure',
      targetId: edgeToClose.id,
      description: 'Test manual bridge explosion',
    });

    const updatedEdge = engine.getState().roadEdges.find(e => e.id === edgeToClose.id);
    expect(updatedEdge?.status).toBe('blocked');
  });
});
