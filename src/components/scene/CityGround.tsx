import React from 'react';
import { Text } from '@react-three/drei';

export const CityGround: React.FC = () => {
  return (
    <group>
      {/* Dark city base plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#080d17" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grid line overlay */}
      <gridHelper args={[120, 24, '#1e293b', '#0f172a']} position={[0, 0.01, 0]} />

      {/* Synthetic River Corridor cutting through city */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 12]}>
        <planeGeometry args={[110, 10]} />
        <meshStandardMaterial 
          color="#0369a1" 
          roughness={0.1} 
          metalness={0.8} 
          transparent 
          opacity={0.65} 
        />
      </mesh>

      {/* River bank borders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 7]}>
        <planeGeometry args={[110, 0.5]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 17]}>
        <planeGeometry args={[110, 0.5]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>

      {/* District holographic text labels */}
      <Text
        position={[-25, 0.1, -30]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        NORTH HARBOR DISTRICT
      </Text>

      <Text
        position={[25, 0.1, -30]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        STRATEGIC DEPOT SECTOR
      </Text>

      <Text
        position={[0, 0.1, -8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.4}
        color="#00e5ff"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
      >
        METRO COMMAND CENTRAL
      </Text>

      <Text
        position={[-25, 0.1, 32]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color="#f43f5e"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        TRAUMA CARE DISTRICT
      </Text>

      <Text
        position={[20, 0.1, 32]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.6}
      >
        CIVIL EVACUATION ZONE
      </Text>
    </group>
  );
};
