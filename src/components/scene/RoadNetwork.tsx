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
      {/* 1. Realistic Multi-Lane Asphalt Highways & Bridges */}
      {edges.map(edge => {
        const p1 = nodeMap.get(edge.fromNode);
        const p2 = nodeMap.get(edge.toNode);
        if (!p1 || !p2) return null;

        const start = new THREE.Vector3(p1[0], 0.1, p1[2]);
        const end = new THREE.Vector3(p2[0], 0.1, p2[2]);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);

        // Direction & rotation
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

        const isBlocked = edge.status === 'blocked';
        const isSlow = edge.status === 'slow';
        const isRiverBridge = (p1[2] < 12 && p2[2] > 12) || (p1[2] > 12 && p2[2] < 12);

        const roadWidth = 2.8;

        return (
          <group 
            key={edge.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectEdge?.(edge.id);
            }}
          >
            {/* Main Asphalt Road Surface */}
            <mesh position={[mid.x, 0.08, mid.z]} quaternion={orientation} receiveShadow>
              <cylinderGeometry args={[roadWidth / 2, roadWidth / 2, distance, 12]} />
              <meshStandardMaterial 
                color={isBlocked ? '#450a0a' : isSlow ? '#292524' : '#1e293b'} 
                roughness={0.85} 
                metalness={0.1}
              />
            </mesh>

            {/* Concrete Sidewalks & Curbs (Left & Right) */}
            <mesh position={[mid.x, 0.11, mid.z]} quaternion={orientation} receiveShadow>
              <cylinderGeometry args={[(roadWidth + 0.6) / 2, (roadWidth + 0.6) / 2, distance, 12]} />
              <meshStandardMaterial color="#475569" roughness={0.7} />
            </mesh>

            {/* Double Solid Yellow Centerline (When Open) */}
            {!isBlocked && (
              <mesh position={[mid.x, 0.12, mid.z]} quaternion={orientation}>
                <cylinderGeometry args={[0.06, 0.06, distance * 0.96, 6]} />
                <meshBasicMaterial color="#eab308" />
              </mesh>
            )}

            {/* Bridge Support Pillars & Truss Arches across River */}
            {isRiverBridge && (
              <group position={[mid.x, 0, mid.z]} quaternion={orientation}>
                {/* Massive Concrete Water Pier Pillars */}
                <mesh position={[0, -2.5, 0]}>
                  <cylinderGeometry args={[0.8, 1.2, 5.0, 12]} />
                  <meshStandardMaterial color="#475569" roughness={0.8} />
                </mesh>
                {/* Bridge Suspension Steel Cables */}
                <mesh position={[roadWidth / 2, 2.0, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, distance * 0.8, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
                </mesh>
                <mesh position={[-roadWidth / 2, 2.0, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, distance * 0.8, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
                </mesh>
              </group>
            )}

            {/* Street Lamp Posts with Warm Point Lights */}
            {[-distance * 0.3, distance * 0.3].map((offDist, li) => {
              const lampPos = new THREE.Vector3().copy(mid).add(direction.clone().multiplyScalar(offDist));
              return (
                <group key={li} position={[lampPos.x + 1.6, 0, lampPos.z]}>
                  {/* Steel Pole */}
                  <mesh position={[0, 1.6, 0]}>
                    <cylinderGeometry args={[0.05, 0.08, 3.2, 8]} />
                    <meshStandardMaterial color="#334155" metalness={0.8} />
                  </mesh>
                  {/* Lamp Fixture */}
                  <mesh position={[-0.3, 3.2, 0]}>
                    <boxGeometry args={[0.6, 0.1, 0.2]} />
                    <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.5} />
                  </mesh>
                  <pointLight position={[-0.3, 3.0, 0]} color="#fef08a" intensity={0.4} distance={9} />
                </group>
              );
            })}

            {/* Blocked Disaster Barricades & Emergency Flashers */}
            {isBlocked && (
              <group position={[mid.x, 0.6, mid.z]}>
                {/* Striped Police / National Guard Barricade */}
                <mesh castShadow>
                  <boxGeometry args={[roadWidth * 1.1, 0.8, 0.3]} />
                  <meshStandardMaterial color="#ef4444" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, 0.16]}>
                  <planeGeometry args={[roadWidth * 0.9, 0.25]} />
                  <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                </mesh>
                {/* Flashing Amber Hazard Beacons */}
                <mesh position={[-1.2, 0.55, 0]}>
                  <cylinderGeometry args={[0.15, 0.15, 0.3, 12]} />
                  <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={3.0} />
                </mesh>
                <mesh position={[1.2, 0.55, 0]}>
                  <cylinderGeometry args={[0.15, 0.15, 0.3, 12]} />
                  <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={3.0} />
                </mesh>
                <pointLight position={[0, 0.8, 0]} color="#ef4444" intensity={2.5} distance={10} />
              </group>
            )}
          </group>
        );
      })}

      {/* 2. Active Transit Glowing Route Tubes */}
      {activeDeliveries.map(del => {
        if (!del.routeNodeIds || del.routeNodeIds.length < 2) return null;
        const points = del.routeNodeIds
          .map(id => nodeMap.get(id))
          .filter((p): p is [number, number, number] => p !== undefined)
          .map(p => new THREE.Vector3(p[0], 0.28, p[2]));

        if (points.length < 2) return null;
        const lineCurve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
        const tubeGeo = new THREE.TubeGeometry(lineCurve, 24, 0.25, 8, false);

        return (
          <mesh key={`path-${del.id}`} geometry={tubeGeo}>
            <meshStandardMaterial 
              color="#00e5ff" 
              emissive="#00e5ff" 
              emissiveIntensity={1.2} 
              transparent 
              opacity={0.8} 
            />
          </mesh>
        );
      })}

      {/* 3. Circular Intersection Plazas with Traffic Circles */}
      {nodes.map(node => (
        <group key={node.id} position={[node.position[0], 0.1, node.position[2]]}>
          {/* Asphalt Circle */}
          <mesh receiveShadow>
            <cylinderGeometry args={[2.5, 2.5, 0.1, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.85} />
          </mesh>
          {/* Center Roundabout Island */}
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <cylinderGeometry args={[1.1, 1.1, 0.18, 24]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          {/* Small Center Grass Mound */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.05, 16]} />
            <meshStandardMaterial color="#15803d" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
