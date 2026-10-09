import React, { useMemo } from 'react';
import * as THREE from 'three';

interface BuildingDef {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  floors: number;
  facadeColor: string;
  glassColor: string;
  hasSpire: boolean;
  hasSetback: boolean;
}

export const CityBuildings: React.FC = () => {
  const buildingDefs = useMemo(() => {
    const list: BuildingDef[] = [];
    let id = 0;

    // City block zones between primary road axes [-25, 0, 25]
    const blockCenters: Array<[number, number]> = [
      [-13, -13],
      [13, -13],
      [-13, 13],
      [13, 13],
      [-36, -13],
      [36, -13],
      [-36, 13],
      [36, 13],
      [-13, -36],
      [13, -36],
      [-36, -36],
      [36, -36],
    ];

    const facadePalettes = ['#1e293b', '#0f172a', '#334155', '#1e1b4b', '#022c43'];
    const glassPalettes = ['#00e5ff', '#0284c7', '#38bdf8', '#0ea5e9', '#06b6d4'];

    for (const [bx, bz] of blockCenters) {
      // 4 distinct architectural buildings per block
      const offsets = [
        [-3.6, -3.6],
        [3.6, -3.6],
        [-3.6, 3.6],
        [3.6, 3.6],
      ];

      for (const [ox, oz] of offsets) {
        const x = bx + ox;
        const z = bz + oz;
        const hash = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453);
        const floors = 3 + Math.floor((hash % 10)); // 3 to 12 floors
        const width = 4.2 + ((hash * 3) % 1.5);
        const depth = 4.2 + ((hash * 5) % 1.5);

        list.push({
          id: `b-${id++}`,
          x,
          z,
          width,
          depth,
          floors,
          facadeColor: facadePalettes[Math.floor(hash) % facadePalettes.length],
          glassColor: glassPalettes[Math.floor(hash * 2) % glassPalettes.length],
          hasSpire: floors > 8 && hash % 2 > 1,
          hasSetback: floors > 7,
        });
      }
    }

    return list;
  }, []);

  return (
    <group>
      {buildingDefs.map(b => {
        const totalHeight = b.floors * 1.6;
        const baseHeight = b.hasSetback ? totalHeight * 0.65 : totalHeight;
        const upperHeight = b.hasSetback ? totalHeight * 0.35 : 0;

        return (
          <group key={b.id} position={[b.x, 0, b.z]}>
            {/* Ground Level Entrance Glass Lobby */}
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[b.width, 1.5, b.depth]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
            </mesh>

            {/* Main Architectural Tower Shaft */}
            <mesh position={[0, 1.5 + (baseHeight - 1.5) / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[b.width * 0.95, baseHeight - 1.5, b.depth * 0.95]} />
              <meshStandardMaterial color={b.facadeColor} roughness={0.4} metalness={0.6} />
            </mesh>

            {/* Horizontal Window Ribbon Bands */}
            {Array.from({ length: Math.min(b.floors, 8) }).map((_, fi) => (
              <mesh key={fi} position={[0, 1.8 + fi * 1.5, 0]}>
                <boxGeometry args={[b.width * 0.96, 0.55, b.depth * 0.96]} />
                <meshStandardMaterial 
                  color={b.glassColor} 
                  roughness={0.1} 
                  metalness={0.9} 
                />
              </mesh>
            ))}

            {/* Stepped Architectural Setback (High-Rises) */}
            {b.hasSetback && (
              <group position={[0, baseHeight, 0]}>
                <mesh position={[0, upperHeight / 2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[b.width * 0.75, upperHeight, b.depth * 0.75]} />
                  <meshStandardMaterial color={b.facadeColor} roughness={0.3} metalness={0.7} />
                </mesh>

                {/* Rooftop Elevator Machine Penthouse */}
                <mesh position={[0, upperHeight + 0.4, 0]}>
                  <boxGeometry args={[b.width * 0.4, 0.8, b.depth * 0.4]} />
                  <meshStandardMaterial color="#334155" roughness={0.7} />
                </mesh>
              </group>
            )}

            {/* Crown Antenna Spire on Prestige High-rises */}
            {b.hasSpire && (
              <group position={[0, totalHeight, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.04, 0.12, 3.5, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
                </mesh>
                {/* Aircraft warning light */}
                <mesh position={[0, 1.8, 0]}>
                  <sphereGeometry args={[0.1, 8, 8]} />
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
