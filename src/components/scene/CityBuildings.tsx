import React, { useMemo } from 'react';
import * as THREE from 'three';

interface BuildingBlock {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  type: 'commercial' | 'residential' | 'industrial';
}

export const CityBuildings: React.FC = () => {
  // Deterministic procedural city buildings arranged in blocks between highways
  const buildings = useMemo(() => {
    const list: BuildingBlock[] = [];
    let id = 0;

    // Define building clusters avoiding road axes: x in [-25, 0, 25], z in [-25, 0, 25]
    const blockCenters: Array<[number, number]> = [
      [-13, -13],
      [13, -13],
      [-13, 13],
      [13, 13],
      [-35, -13],
      [35, -13],
      [-35, 13],
      [35, 13],
      [-13, -35],
      [13, -35],
    ];

    const colors = ['#111c2e', '#152238', '#1a2942', '#0f172a', '#1e293b'];

    for (const [bx, bz] of blockCenters) {
      // 4 to 6 buildings per block
      for (let ix = -1; ix <= 1; ix += 2) {
        for (let iz = -1; iz <= 1; iz += 2) {
          const x = bx + ix * 4.5;
          const z = bz + iz * 4.5;
          const height = 4 + Math.abs((x * 7 + z * 13) % 18);
          const width = 3 + Math.abs((x * 3) % 2.5);
          const depth = 3 + Math.abs((z * 5) % 2.5);
          const color = colors[Math.abs(Math.floor(x + z)) % colors.length];

          list.push({
            id: `bld-${id++}`,
            position: [x, height / 2, z],
            size: [width, height, depth],
            color,
            type: height > 14 ? 'commercial' : 'residential',
          });
        }
      }
    }

    return list;
  }, []);

  return (
    <group>
      {buildings.map(b => (
        <group key={b.id} position={b.position}>
          {/* Main building block */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial 
              color={b.color} 
              roughness={0.4} 
              metalness={0.6} 
            />
          </mesh>

          {/* Roof border glow */}
          <mesh position={[0, b.size[1] / 2 + 0.05, 0]}>
            <boxGeometry args={[b.size[0] * 0.9, 0.1, b.size[2] * 0.9]} />
            <meshStandardMaterial 
              color="#0f172a" 
              roughness={0.8}
            />
          </mesh>

          {/* Window illumination bands on highrises */}
          {b.size[1] > 10 && (
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[b.size[0] + 0.05, b.size[1] * 0.8, b.size[2] + 0.05]} />
              <meshBasicMaterial 
                color="#38bdf8" 
                wireframe 
                transparent 
                opacity={0.12} 
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};
