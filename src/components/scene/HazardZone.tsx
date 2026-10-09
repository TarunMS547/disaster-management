import React from 'react';
import { Incident } from '../../types/simulation';

interface HazardZoneProps {
  incident: Incident;
}

export const HazardZone: React.FC<HazardZoneProps> = ({ incident }) => {
  const isFlood = incident.type === 'flood_expansion';
  const color = isFlood ? '#0284c7' : '#ef4444';
  const radius = Math.max(4, incident.radius || 8);

  return (
    <group position={[incident.position[0], 0.2, incident.position[2]]}>
      {/* Translucent perimeter dome */}
      <mesh>
        <cylinderGeometry args={[radius, radius * 1.1, 1.5, 24]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.35} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Warning boundary ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]}>
        <ringGeometry args={[radius - 0.3, radius, 32]} />
        <meshBasicMaterial color={color} side={2} transparent opacity={0.8} />
      </mesh>

      <pointLight color={color} intensity={1.5} distance={radius * 2} />
    </group>
  );
};
