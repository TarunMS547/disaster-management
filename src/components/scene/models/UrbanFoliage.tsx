import React, { useMemo } from 'react';

interface TreeItem {
  id: number;
  position: [number, number, number];
  scale: number;
  type: 'deciduous' | 'pine';
}

export const UrbanFoliage: React.FC = () => {
  const trees = useMemo(() => {
    const list: TreeItem[] = [];
    let id = 0;

    // Green park zones along riverbanks and district borders
    const parkClusters: Array<[number, number]> = [
      [-20, 5],
      [-10, 5],
      [10, 5],
      [20, 5],
      [-20, 19],
      [-10, 19],
      [10, 19],
      [20, 19],
      [-32, -5],
      [32, -5],
      [-5, -15],
      [5, -15],
    ];

    for (const [cx, cz] of parkClusters) {
      for (let i = 0; i < 4; i++) {
        const ox = (Math.sin(id * 2.3) * 3);
        const oz = (Math.cos(id * 3.7) * 3);
        list.push({
          id: id++,
          position: [cx + ox, 0, cz + oz],
          scale: 0.8 + ((id % 5) * 0.1),
          type: id % 2 === 0 ? 'deciduous' : 'pine',
        });
      }
    }

    return list;
  }, []);

  return (
    <group>
      {trees.map(t => (
        <group key={t.id} position={t.position} scale={t.scale}>
          {/* Tree Trunk */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>

          {/* Foliage */}
          {t.type === 'pine' ? (
            // Layered pine cones
            <group position={[0, 1.4, 0]}>
              <mesh position={[0, 0, 0]} castShadow>
                <coneGeometry args={[0.9, 1.2, 7]} />
                <meshStandardMaterial color="#14532d" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.7, 0]} castShadow>
                <coneGeometry args={[0.7, 1.0, 7]} />
                <meshStandardMaterial color="#166534" roughness={0.8} />
              </mesh>
              <mesh position={[0, 1.3, 0]} castShadow>
                <coneGeometry args={[0.45, 0.8, 7]} />
                <meshStandardMaterial color="#15803d" roughness={0.8} />
              </mesh>
            </group>
          ) : (
            // Deciduous canopy
            <group position={[0, 1.8, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.95, 8, 8]} />
                <meshStandardMaterial color="#166534" roughness={0.7} />
              </mesh>
              <mesh position={[0.2, 0.4, 0.1]} castShadow>
                <sphereGeometry args={[0.65, 7, 7]} />
                <meshStandardMaterial color="#22c55e" roughness={0.7} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
};
