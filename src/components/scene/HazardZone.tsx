import React from 'react';
import { Incident } from '../../types/simulation';

interface HazardZoneProps {
  incident: Incident;
}

export const HazardZone: React.FC<HazardZoneProps> = ({ incident }) => {
  const radius = Math.max(4, incident.radius || 8);

  // Pick color and theme per disaster type
  let color = '#ef4444';
  let emissiveColor = '#ef4444';
  let geometryType: 'flood' | 'earthquake' | 'landslide' | 'weather' | 'acid_rain' | 'satellite' | 'generic' = 'generic';

  switch (incident.type) {
    case 'flood_expansion':
      color = '#0284c7';
      emissiveColor = '#38bdf8';
      geometryType = 'flood';
      break;
    case 'earthquake':
      color = '#ea580c'; // Vibrant seismic orange
      emissiveColor = '#f97316';
      geometryType = 'earthquake';
      break;
    case 'landslide':
      color = '#b45309'; // Earthy rock amber
      emissiveColor = '#d97706';
      geometryType = 'landslide';
      break;
    case 'weather_change':
      color = '#8b5cf6'; // Storm violet / gale
      emissiveColor = '#a855f7';
      geometryType = 'weather';
      break;
    case 'acid_rain':
      color = '#84cc16'; // Toxic neon lime green
      emissiveColor = '#a3e635';
      geometryType = 'acid_rain';
      break;
    case 'satellite_fall':
      color = '#dc2626'; // Blazing kinetic crater red
      emissiveColor = '#f43f5e';
      geometryType = 'satellite';
      break;
    default:
      color = '#ef4444';
      emissiveColor = '#ef4444';
      geometryType = 'generic';
      break;
  }

  return (
    <group position={[incident.position[0], 0.2, incident.position[2]]}>
      {/* 1. Base Perimeter Wave / Dome */}
      <mesh>
        <cylinderGeometry args={[radius, radius * 1.08, 0.8, 32]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={geometryType === 'weather' ? 0.2 : 0.35} 
          roughness={geometryType === 'flood' ? 0.1 : 0.6}
          emissive={emissiveColor}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* 2. Specialized 3D Visual Detail per Disaster */}
      {geometryType === 'flood' && (
        /* Floating concentric water surge ripples */
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
          <ringGeometry args={[radius * 0.4, radius * 0.95, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={2} />
        </mesh>
      )}

      {geometryType === 'earthquake' && (
        /* Jagged Seismic Fault Fissure Ring */
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
            <ringGeometry args={[radius * 0.7, radius, 16]} />
            <meshStandardMaterial color="#f97316" wireframe emissive="#ea580c" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[radius * 0.6, 0.5, radius * 0.6]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.9} />
          </mesh>
        </group>
      )}

      {geometryType === 'landslide' && (
        /* Mountainous Rock / Rubble Mound */
        <group position={[0, 0.5, 0]}>
          <mesh>
            <coneGeometry args={[radius * 0.65, 2.2, 7]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          <mesh position={[radius * 0.3, 0.2, radius * 0.2]}>
            <dodecahedronGeometry args={[radius * 0.25]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
        </group>
      )}

      {geometryType === 'weather' && (
        /* Atmospheric Storm Vortex Cone */
        <mesh position={[0, 3.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[radius, 6, 24, 1, true]} />
          <meshStandardMaterial color="#7c3aed" transparent opacity={0.25} wireframe side={2} />
        </mesh>
      )}

      {geometryType === 'acid_rain' && (
        /* Toxic Vapor Cloud Mist Ring */
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
            <torusGeometry args={[radius * 0.75, 0.6, 12, 32]} />
            <meshStandardMaterial color="#84cc16" transparent opacity={0.4} emissive="#65a30d" emissiveIntensity={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
            <circleGeometry args={[radius * 0.85, 24]} />
            <meshBasicMaterial color="#4d7c0f" transparent opacity={0.45} side={2} />
          </mesh>
        </group>
      )}

      {geometryType === 'satellite' && (
        /* Impact Crater with Smoldering Metallic Wreckage Core */
        <group>
          <mesh position={[0, 0.1, 0]}>
            <torusGeometry args={[radius * 0.6, 0.8, 12, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* Metallic crashed satellite debris */}
          <mesh position={[0, 0.7, 0]} rotation={[0.4, 0.6, 0.2]}>
            <boxGeometry args={[2.5, 1.2, 1.6]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} emissive="#ef4444" emissiveIntensity={0.7} />
          </mesh>
          {/* Solar panel wreckage wing */}
          <mesh position={[1.4, 0.9, 0]} rotation={[0.2, -0.4, 0.5]}>
            <boxGeometry args={[2.2, 0.1, 1.2]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* 3. Outer boundary safety warning ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]}>
        <ringGeometry args={[radius - 0.25, radius, 32]} />
        <meshBasicMaterial color={emissiveColor} side={2} transparent opacity={0.85} />
      </mesh>

      {/* Atmospheric Glow Light */}
      <pointLight color={emissiveColor} intensity={2.2} distance={radius * 2.5} />
    </group>
  );
};
