import React from 'react';
import * as THREE from 'three';
import { Facility } from '../../../types/simulation';

/**
 * Authentic Multi-Tier Hospital with Helipad and Emergency Room Bay
 */
export const RealisticHospitalModel: React.FC<{ facility: Facility; isSelected: boolean }> = ({
  facility,
  isSelected,
}) => {
  return (
    <group>
      {/* 1. Main Hospital Center Tower */}
      <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.0, 8.0, 5.0]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 2. Glass Window Facade Strips */}
      {[-2.5, 0, 2.5].map((yOff, yi) => (
        <mesh key={yi} position={[0, 4.0 + yOff, 2.52]}>
          <planeGeometry args={[6.2, 0.9]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.9} />
        </mesh>
      ))}

      {/* 3. Emergency Trauma ER Pavilion Wing (Left) */}
      <mesh position={[-4.5, 2.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 4.0, 4.0]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>

      {/* Ambulance Drop-off Canopy */}
      <mesh position={[-4.5, 2.2, 2.6]} castShadow>
        <boxGeometry args={[3.2, 0.3, 1.8]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>
      {/* Canopy Support Pillars */}
      <mesh position={[-5.8, 1.0, 3.3]}>
        <cylinderGeometry args={[0.08, 0.08, 2.0]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[-3.2, 1.0, 3.3]}>
        <cylinderGeometry args={[0.08, 0.08, 2.0]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* 4. Large Illuminated 3D Red Cross on Upper Facade */}
      <group position={[0, 6.5, 2.55]}>
        <mesh>
          <boxGeometry args={[0.4, 1.4, 0.1]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.8} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.4, 0.4, 0.1]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.8} />
        </mesh>
        <pointLight color="#ef4444" intensity={1.5} distance={10} />
      </group>

      {/* 5. Rooftop Helipad Pad */}
      <group position={[0, 8.05, 0]}>
        {/* Concrete Square Base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[4.2, 4.2]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* Yellow Landing Circle */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.65, 32]} />
          <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
        </mesh>
        {/* Bold White 'H' Markings */}
        <mesh position={[-0.45, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 1.2]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.45, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 1.2]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>

        {/* Perimeter Green Runway Lights */}
        {[
          [-1.9, -1.9],
          [1.9, -1.9],
          [-1.9, 1.9],
          [1.9, 1.9],
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.1, lz]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/**
 * Authentic Industrial Logistics Depot with Loading Docks and HVAC Systems
 */
export const RealisticWarehouseModel: React.FC<{ facility: Facility; isSelected: boolean }> = ({
  facility,
  isSelected,
}) => {
  return (
    <group>
      {/* Main Corrugated Steel Hangar */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.0, 5.0, 6.5]} />
        <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Raised Concrete Loading Dock Platform */}
      <mesh position={[0, 0.45, 3.75]} castShadow receiveShadow>
        <boxGeometry args={[8.6, 0.9, 1.2]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* 4 Roll-up Loading Dock Doors */}
      {[-3.0, -1.0, 1.0, 3.0].map((dx, i) => (
        <group key={i} position={[dx, 1.4, 3.26]}>
          {/* Roll-up door */}
          <mesh>
            <planeGeometry args={[1.4, 1.7]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Yellow Safety Hazard Frame */}
          <mesh position={[0, 0.9, 0.01]}>
            <planeGeometry args={[1.5, 0.15]} />
            <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Rooftop Industrial HVAC Chillers & Exhaust Fans */}
      {[-2.5, 2.5].map((hx, i) => (
        <group key={i} position={[hx, 5.4, -1.0]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.8, 1.6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Fan Grill */}
          <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.5, 12]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}

      {/* Office Annex Wing */}
      <mesh position={[4.8, 1.8, -1.2]} castShadow>
        <boxGeometry args={[2.0, 3.6, 3.5]} />
        <meshStandardMaterial color="#334155" roughness={0.3} />
      </mesh>

      {/* High-intensity Security Floodlights */}
      <group position={[0, 5.0, 3.3]}>
        <mesh>
          <boxGeometry args={[0.4, 0.2, 0.2]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.0} />
        </mesh>
        <pointLight color="#fef08a" intensity={1.5} distance={12} />
      </group>
    </group>
  );
};

/**
 * Authentic Operations Center Command Spire with Telecom Mast
 */
export const RealisticCommandHQModel: React.FC<{ facility: Facility; isSelected: boolean }> = ({
  facility,
  isSelected,
}) => {
  return (
    <group>
      {/* Lower Glass Atrium Podium */}
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.0, 4.0, 7.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Main Stepped Command Tower */}
      <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.0, 7.0, 5.0]} />
        <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Upper Observation & Telemetry Deck */}
      <mesh position={[0, 10.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.8, 2.4, 1.8, 16]} />
        <meshStandardMaterial color="#00e5ff" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Microwave Satellite Dishes */}
      {[-1.8, 1.8].map((sx, i) => (
        <mesh key={i} position={[sx, 11.2, 1.0]} rotation={[0.4, sx > 0 ? 0.3 : -0.3, 0]}>
          <cylinderGeometry args={[0.5, 0.05, 0.2, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
        </mesh>
      ))}

      {/* Tall Telecommunications Antenna Spire */}
      <group position={[0, 11.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.25, 6.0, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>

        {/* Red Aircraft Warning Beacon at Apex */}
        <mesh position={[0, 3.1, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.0} />
        </mesh>
        <pointLight position={[0, 3.1, 0]} color="#ef4444" intensity={2} distance={15} />
      </group>

      {/* Glowing Cyber Operations Core Ring */}
      <mesh position={[0, 2.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.8, 4.2, 32]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/**
 * Authentic Civic Arena / Emergency Evacuation Shelter
 */
export const RealisticShelterModel: React.FC<{ facility: Facility; isSelected: boolean }> = ({
  facility,
  isSelected,
}) => {
  return (
    <group>
      {/* Main Oval Civic Dome Structure */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[4.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#10b981" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Structural Arch Ribs */}
      {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((rot, i) => (
        <mesh key={i} position={[0, 2.2, 0]} rotation={[0, rot, 0]}>
          <torusGeometry args={[4.22, 0.12, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.7} />
        </mesh>
      ))}

      {/* Concrete Base Perimeter */}
      <mesh position={[0, 0.6, 0]} receiveShadow>
        <cylinderGeometry args={[4.5, 4.7, 1.2, 24]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Glass Front Entrance Pavilion */}
      <mesh position={[0, 1.0, 4.4]} castShadow>
        <boxGeometry args={[3.0, 1.8, 1.2]} />
        <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Green Civil Defense Beacon */}
      <mesh position={[0, 4.4, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.5} />
      </mesh>
      <pointLight position={[0, 4.4, 0]} color="#10b981" intensity={2} distance={14} />
    </group>
  );
};
