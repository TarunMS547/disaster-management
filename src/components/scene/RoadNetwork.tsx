import React from 'react';
import * as THREE from 'three';
import { RoadNode, RoadEdge, DeliveryTransfer } from '../../types/simulation';

interface RoadNetworkProps {
  nodes: RoadNode[];
  edges: RoadEdge[];
  activeDeliveries: DeliveryTransfer[];
  selectedEdgeId?: string | null;
  onSelectEdge?: (edgeId: string) => void;
}

export const RoadNetwork: React.FC<RoadNetworkProps> = ({
  nodes,
  edges,
  activeDeliveries,
  onSelectEdge,
}) => {
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    for (const n of nodes) {
      map.set(n.id, n.position);
    }
    return map;
  }, [nodes]);

  return (
    <group>
      {/* 1. Road Edges */}
      {edges.map(edge => {
        const p1 = nodeMap.get(edge.fromNode);
        const p2 = nodeMap.get(edge.toNode);
        if (!p1 || !p2) return null;

        const start = new THREE.Vector3(p1[0], 0.15, p1[2]);
        const end = new THREE.Vector3(p2[0], 0.15, p2[2]);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);

        // Rotation towards target
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

        let roadColor = '#1e293b';
        let roadWidth = 1.2;
        let isBlocked = edge.status === 'blocked';
        let isSlow = edge.status === 'slow';

        if (isBlocked) {
          roadColor = '#ef4444';
          roadWidth = 1.8;
        } else if (isSlow) {
          roadColor = '#f59e0b';
        }

        return (
          <group 
            key={edge.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectEdge?.(edge.id);
            }}
          >
            {/* Road Surface */}
            <mesh
              position={[mid.x, 0.12, mid.z]}
              quaternion={orientation}
            >
              <cylinderGeometry args={[roadWidth / 2, roadWidth / 2, distance, 8]} />
              <meshStandardMaterial 
                color={roadColor} 
                roughness={0.7} 
                emissive={isBlocked ? '#7f1d1d' : isSlow ? '#78350f' : '#0f172a'}
                emissiveIntensity={isBlocked ? 0.8 : 0.2}
              />
            </mesh>

            {/* Blocked Barrier Marker */}
            {isBlocked && (
              <group position={[mid.x, 1.2, mid.z]}>
                <mesh>
                  <boxGeometry args={[2.5, 0.8, 0.4]} />
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
                </mesh>
                <pointLight color="#ef4444" intensity={2} distance={8} />
              </group>
            )}
          </group>
        );
      })}

      {/* 2. Active Transit Flow Line Overlays */}
      {activeDeliveries.map(del => {
        if (!del.routeNodeIds || del.routeNodeIds.length < 2) return null;
        const points = del.routeNodeIds
          .map(id => nodeMap.get(id))
          .filter((p): p is [number, number, number] => p !== undefined)
          .map(p => new THREE.Vector3(p[0], 0.25, p[2]));

        if (points.length < 2) return null;
        const lineCurve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
        const tubeGeo = new THREE.TubeGeometry(lineCurve, 20, 0.35, 6, false);

        return (
          <mesh key={`path-${del.id}`} geometry={tubeGeo}>
            <meshStandardMaterial 
              color="#00e5ff" 
              emissive="#00e5ff" 
              emissiveIntensity={0.8} 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        );
      })}

      {/* 3. Intersection Hub Nodes */}
      {nodes.map(node => (
        <mesh key={node.id} position={[node.position[0], 0.15, node.position[2]]}>
          <cylinderGeometry args={[1.5, 1.5, 0.15, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};
