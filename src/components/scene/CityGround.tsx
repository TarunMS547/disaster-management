import React from 'react';
import { Text } from '@react-three/drei';
import { UrbanFoliage } from './models/UrbanFoliage';

export const CityGround: React.FC = () => {
  return (
    <group>
      {/* 1. Asphalt & Concrete Metropolitan Base Deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* 2. Green Grass Parkland Polygons */}
      {[
        [-15, 6, 32, 2.8],
        [15, 6, 32, 2.8],
        [-15, 18, 32, 2.8],
        [15, 18, 32, 2.8],
        [-32, -8, 12, 14],
        [32, -8, 12, 14],
      ].map(([gx, gz, gw, gd], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[gx, 0.01, gz]} receiveShadow>
          <planeGeometry args={[gw, gd]} />
          <meshStandardMaterial color="#14532d" roughness={0.95} />
        </mesh>
      ))}

      {/* 3. Deep Realistic River Water Channel */}
      {/* Excavated River Bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 12]}>
        <planeGeometry args={[130, 9.5]} />
        <meshStandardMaterial color="#022c43" roughness={0.9} />
      </mesh>

      {/* Dynamic Water Surface with Deep Specular Glint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 12]}>
        <planeGeometry args={[130, 9.4]} />
        <meshStandardMaterial 
          color="#0369a1" 
          roughness={0.08} 
          metalness={0.9} 
          transparent 
          opacity={0.88} 
        />
      </mesh>

      {/* Concrete Embankment Sea-Walls (North & South) */}
      <mesh position={[0, 0.2, 7.2]} receiveShadow>
        <boxGeometry args={[130, 0.6, 0.5]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 16.8]} receiveShadow>
        <boxGeometry args={[130, 0.6, 0.5]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* 4. 3D Trees and Urban Parks */}
      <UrbanFoliage />

      {/* 5. Elegant District Signage */}
      <Text
        position={[-25, 0.12, -32]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.8}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
        fontWeight="bold"
      >
        NORTH LOGISTICS & HARBOR DISTRICT
      </Text>

      <Text
        position={[25, 0.12, -32]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.8}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
        fontWeight="bold"
      >
        STRATEGIC DEPOT & SUPPLY CORRIDOR
      </Text>

      <Text
        position={[0, 0.12, -6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.0}
        color="#00e5ff"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.8}
        fontWeight="bold"
      >
        CENTRAL OPERATIONS PLAZA
      </Text>

      <Text
        position={[-25, 0.12, 33]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.8}
        color="#f43f5e"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
        fontWeight="bold"
      >
        TRAUMA CARE & EMERGENCY MEDICAL ZONE
      </Text>

      <Text
        position={[22, 0.12, 33]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.8}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
        fontWeight="bold"
      >
        CIVIL DEFENSE EVACUATION SECTOR
      </Text>
    </group>
  );
};
