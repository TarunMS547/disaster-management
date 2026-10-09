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
      {/* 1. Flat Asphalt Road Surface & Markings */}
      {edges.map(edge => {
        const p1 = nodeMap.get(edge.fromNode);
        const p2 = nodeMap.get(edge.toNode);
        if (!p1 || !p2) return null;

        const start = new THREE.Vector3(p1[0], 0.02, p1[2]);
        const end = new THREE.Vector3(p2[0], 0.02, p2[2]);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);

        // Direction & rotation around Y axis
        const dx = end.x - start.x;
        const dz = end.z - start.z;
        const angle = Math.atan2(dx, dz);

        const isBlocked = edge.status === 'blocked';
        const isSlow = edge.status === 'slow';
        const isRiverBridge = (p1[2] < 12 && p2[2] > 12) || (p1[2] > 12 && p2[2] < 12);
        const roadWidth = 3.2;

        return (
          <group 
            key={edge.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectEdge?.(edge.id);
            }}
          >
            {/* Flat Asphalt Surface */}
            <mesh position={[mid.x, 0.02, mid.z]} rotation={[-Math.PI / 2, 0, -angle]} receiveShadow>
              <planeGeometry args={[roadWidth, distance]} />
              <meshStandardMaterial 
                color={isBlocked ? '#450a0a' : isSlow ? '#292524' : '#1e293b'} 
                roughness={0.9} 
                metalness={0.05}
              />
            </mesh>

            {/* Flat Outer Shoulders / Curbs */}
            <mesh position={[mid.x, 0.018, mid.z]} rotation={[-Math.PI / 2, 0, -angle]} receiveShadow>
              <planeGeometry args={[roadWidth + 0.5, distance]} />
              <meshStandardMaterial color="#475569" roughness={0.95} />
            </mesh>

            {/* Flat Yellow Center Striping (when open) */}
            {!isBlocked && (
              <mesh position={[mid.x, 0.025, mid.z]} rotation={[-Math.PI / 2, 0, -angle]}>
                <planeGeometry args={[0.12, distance * 0.98]} />
                <meshBasicMaterial color="#eab308" />
              </mesh>
            )}

            {/* Flat Bridge Deck when spanning River */}
            {isRiverBridge && (
              <group position={[mid.x, 0, mid.z]}>
                {/* Bridge Water Pier Bases */}
                <mesh position={[0, -1.8, 0]}>
                  <boxGeometry args={[roadWidth * 1.2, 3.6, 1.8]} />
                  <meshStandardMaterial color="#334155" roughness={0.8} />
                </mesh>
                {/* Minimal Flat Bridge Guardrails */}
                <mesh position={[roadWidth / 2 + 0.15, 0.4, 0]} rotation={[0, angle, 0]}>
                  <boxGeometry args={[0.15, 0.6, distance * 0.9]} />
                  <meshStandardMaterial color="#64748b" metalness={0.8} />
                </mesh>
                <mesh position={[-roadWidth / 2 - 0.15, 0.4, 0]} rotation={[0, angle, 0]}>
                  <boxGeometry args={[0.15, 0.6, distance * 0.9]} />
                  <meshStandardMaterial color="#64748b" metalness={0.8} />
                </mesh>
              </group>
            )}

            {/* Disaster Barricade when blocked */}
            {isBlocked && (
              <group position={[mid.x, 0.4, mid.z]}>
                <mesh castShadow>
                  <boxGeometry args={[roadWidth * 0.95, 0.7, 0.2]} />
                  <meshStandardMaterial color="#ef4444" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, 0.12]}>
                  <planeGeometry args={[roadWidth * 0.8, 0.2]} />
                  <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                </mesh>
                <pointLight position={[0, 0.5, 0]} color="#ef4444" intensity={2} distance={8} />
              </group>
            )}
          </group>
        );
      })}

      {/* 2. Active Transit Flat Glowing Route Ribbon */}
      {activeDeliveries.map(del => {
        if (!del.routeNodeIds || del.routeNodeIds.length < 2) return null;
        const points = del.routeNodeIds
          .map(id => nodeMap.get(id))
          .filter((p): p is [number, number, number] => p !== undefined)
          .map(p => new THREE.Vector3(p[0], 0.08, p[2]));

        if (points.length < 2) return null;
        const lineCurve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
        const tubeGeo = new THREE.TubeGeometry(lineCurve, 24, 0.14, 8, false);

        return (
          <mesh key={`path-${del.id}`} geometry={tubeGeo}>
            <meshStandardMaterial 
              color="#00e5ff" 
              emissive="#00e5ff" 
              emissiveIntensity={1.5} 
              transparent 
              opacity={0.85} 
            />
          </mesh>
        );
      })}

      {/* 3. Flat Circular Intersections & Junction Plazas */}
      {nodes.map(node => (
        <group key={node.id} position={[node.position[0], 0.022, node.position[2]]}>
          {/* Flat Asphalt Node Disk */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[2.4, 32]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* Inner Traffic Junction Marker */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <ringGeometry args={[1.6, 1.75, 32]} />
            <meshBasicMaterial color="#eab308" side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
