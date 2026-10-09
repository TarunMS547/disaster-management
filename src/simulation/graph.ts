import { RoadNode, RoadEdge } from '../types/simulation';

export interface RouteResult {
  pathNodeIds: string[];
  totalDistance: number;
  estimatedTravelTicks: number;
  feasible: boolean;
  blockedEdgeFound?: boolean;
}

export class RoadGraph {
  private nodes: Map<string, RoadNode> = new Map();
  private edges: Map<string, RoadEdge> = new Map();
  // adjacency map: fromNodeId -> Array<{ toNodeId: string, edge: RoadEdge }>
  private adjacency: Map<string, Array<{ toNodeId: string; edge: RoadEdge }>> = new Map();

  constructor(nodes: RoadNode[] = [], edges: RoadEdge[] = []) {
    this.updateGraph(nodes, edges);
  }

  public updateGraph(nodes: RoadNode[], edges: RoadEdge[]): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();

    for (const node of nodes) {
      this.nodes.set(node.id, node);
      this.adjacency.set(node.id, []);
    }

    for (const edge of edges) {
      this.edges.set(edge.id, edge);

      // Roads in synthetic city are bidirectional by default
      const listA = this.adjacency.get(edge.fromNode);
      if (listA) {
        listA.push({ toNodeId: edge.toNode, edge });
      }

      const listB = this.adjacency.get(edge.toNode);
      if (listB) {
        listB.push({ toNodeId: edge.fromNode, edge });
      }
    }
  }

  public getNode(nodeId: string): RoadNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getEdge(edgeId: string): RoadEdge | undefined {
    return this.edges.get(edgeId);
  }

  public getAllNodes(): RoadNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): RoadEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Find shortest feasible path avoiding blocked roads using Dijkstra's algorithm.
   * Incorporates travel time, slow road penalties, and hazard exposure cost.
   */
  public findShortestPath(startNodeId: string, endNodeId: string): RouteResult {
    if (startNodeId === endNodeId) {
      return {
        pathNodeIds: [startNodeId],
        totalDistance: 0,
        estimatedTravelTicks: 0,
        feasible: true,
      };
    }

    if (!this.nodes.has(startNodeId) || !this.nodes.has(endNodeId)) {
      return {
        pathNodeIds: [],
        totalDistance: Infinity,
        estimatedTravelTicks: Infinity,
        feasible: false,
      };
    }

    const distances = new Map<string, number>();
    const previous = new Map<string, { nodeId: string; edge: RoadEdge }>();
    const unvisited = new Set<string>();

    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
      unvisited.add(nodeId);
    }

    distances.set(startNodeId, 0);

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let currentId: string | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        const d = distances.get(nodeId) ?? Infinity;
        if (d < minDistance) {
          minDistance = d;
          currentId = nodeId;
        }
      }

      if (currentId === null || minDistance === Infinity) {
        break; // Destination unreachable
      }

      if (currentId === endNodeId) {
        break; // Reached destination
      }

      unvisited.delete(currentId);

      const neighbors = this.adjacency.get(currentId) || [];
      for (const { toNodeId, edge } of neighbors) {
        if (!unvisited.has(toNodeId)) continue;

        // INVARIANT: Blocked edges are strictly excluded from feasible routes
        if (edge.status === 'blocked') {
          continue;
        }

        // Weight formula: base travel ticks * speed factor + hazard risk penalty
        const speedMultiplier = edge.status === 'slow' ? 2.5 : 1.0;
        const edgeWeight = (edge.travelTimeTicks * speedMultiplier) + (edge.hazardExposureCost * 1.5);

        const currentDist = distances.get(currentId) ?? Infinity;
        const candidateDist = currentDist + edgeWeight;

        if (candidateDist < (distances.get(toNodeId) ?? Infinity)) {
          distances.set(toNodeId, candidateDist);
          previous.set(toNodeId, { nodeId: currentId, edge });
        }
      }
    }

    const destDist = distances.get(endNodeId) ?? Infinity;
    if (destDist === Infinity) {
      return {
        pathNodeIds: [],
        totalDistance: Infinity,
        estimatedTravelTicks: Infinity,
        feasible: false,
      };
    }

    // Reconstruct path
    const path: string[] = [];
    let curr = endNodeId;
    let totalDist = 0;
    let totalTravelTicks = 0;

    path.unshift(curr);
    while (curr !== startNodeId) {
      const prevEntry = previous.get(curr);
      if (!prevEntry) break;
      totalDist += prevEntry.edge.distance;
      const speedMultiplier = prevEntry.edge.status === 'slow' ? 2.5 : 1.0;
      totalTravelTicks += Math.ceil(prevEntry.edge.travelTimeTicks * speedMultiplier);
      curr = prevEntry.nodeId;
      path.unshift(curr);
    }

    return {
      pathNodeIds: path,
      totalDistance: totalDist,
      estimatedTravelTicks: Math.max(1, totalTravelTicks),
      feasible: true,
    };
  }

  /**
   * Check if an existing route has any newly blocked roads.
   */
  public isRouteBlocked(routeNodeIds: string[]): boolean {
    if (routeNodeIds.length < 2) return false;
    for (let i = 0; i < routeNodeIds.length - 1; i++) {
      const u = routeNodeIds[i];
      const v = routeNodeIds[i + 1];
      const neighbors = this.adjacency.get(u) || [];
      const edgeEntry = neighbors.find(n => n.toNodeId === v);
      if (edgeEntry && edgeEntry.edge.status === 'blocked') {
        return true;
      }
    }
    return false;
  }

  /**
   * Interpolate 3D coordinates along a sequence of node IDs at a given fraction (0..1)
   */
  public interpolatePosition(routeNodeIds: string[], progressRatio: number): [number, number, number] {
    if (routeNodeIds.length === 0) return [0, 0, 0];
    if (routeNodeIds.length === 1) {
      const n = this.nodes.get(routeNodeIds[0]);
      return n ? n.position : [0, 0, 0];
    }

    const clampedRatio = Math.max(0, Math.min(1, progressRatio));
    const totalSegments = routeNodeIds.length - 1;
    const scaledProgress = clampedRatio * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segmentFraction = scaledProgress - segmentIndex;

    const n1 = this.nodes.get(routeNodeIds[segmentIndex]);
    const n2 = this.nodes.get(routeNodeIds[segmentIndex + 1]);

    if (!n1 || !n2) return [0, 0, 0];

    return [
      n1.position[0] + (n2.position[0] - n1.position[0]) * segmentFraction,
      n1.position[1] + (n2.position[1] - n1.position[1]) * segmentFraction,
      n1.position[2] + (n2.position[2] - n1.position[2]) * segmentFraction,
    ];
  }
}
