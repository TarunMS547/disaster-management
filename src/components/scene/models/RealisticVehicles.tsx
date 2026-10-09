import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vehicle } from '../../../types/simulation';

interface VehicleModelProps {
  vehicle: Vehicle;
  isSelected: boolean;
}

/**
 * Highly detailed authentic ambulance / medical van model
 */
export const RealisticAmbulance: React.FC<{ isSelected: boolean; isInTransit: boolean }> = ({
  isSelected,
  isInTransit,
}) => {
  const lightBarRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (isInTransit && lightBarRef.current) {
      // Alternate strobe flash between red and blue
      const t = clock.getElapsedTime() * 12;
      const redLight = lightBarRef.current.children[0] as THREE.Mesh;
      const blueLight = lightBarRef.current.children[1] as THREE.Mesh;
      if (redLight && blueLight) {
        const isRed = Math.sin(t) > 0;
        (redLight.material as THREE.MeshStandardMaterial).emissiveIntensity = isRed ? 2.5 : 0.2;
        (blueLight.material as THREE.MeshStandardMaterial).emissiveIntensity = isRed ? 0.2 : 2.5;
      }
    }
  });

  return (
    <group>
      {/* Chassis & Body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.5, 1.0, 3.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Front Cab / Windshield slant */}
      <mesh position={[0, 0.7, 1.1]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.48, 0.75, 1.1]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>

      {/* Windshield Glass */}
      <mesh position={[0, 0.85, 1.45]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[1.3, 0.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.05} metalness={0.9} />
      </mesh>

      {/* Red Paramedic Stripe along side */}
      <mesh position={[0.76, 0.6, -0.1]}>
        <planeGeometry args={[2.8, 0.25]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.76, 0.6, -0.1]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.8, 0.25]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Red Cross emblem on sides */}
      <group position={[0.77, 0.65, -0.6]}>
        <mesh>
          <planeGeometry args={[0.15, 0.5]} />
          <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <planeGeometry args={[0.5, 0.15]} />
          <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group position={[-0.77, 0.65, -0.6]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[0.15, 0.5]} />
          <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <planeGeometry args={[0.5, 0.15]} />
          <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Roof Emergency Lightbar */}
      <group ref={lightBarRef} position={[0, 1.25, 0.8]}>
        <mesh position={[-0.35, 0, 0]}>
          <boxGeometry args={[0.35, 0.15, 0.2]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
        </mesh>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.35, 0.15, 0.2]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={2.0} />
        </mesh>
        {isInTransit && (
          <pointLight color="#ef4444" intensity={1.5} distance={6} />
        )}
      </group>

      {/* 4 Rubber Wheels with Rims */}
      {[
        [-0.78, 0.25, 1.0],
        [0.78, 0.25, 1.0],
        [-0.78, 0.25, -1.0],
        [0.78, 0.25, -1.0],
      ].map(([wx, wy, wz], i) => (
        <group key={i} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.18, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[0, wx > 0 ? 0.09 : -0.09, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.05, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Headlights casting beam onto road */}
      <mesh position={[-0.5, 0.45, 1.62]}>
        <boxGeometry args={[0.22, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.5, 0.45, 1.62]}>
        <boxGeometry args={[0.22, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.5} />
      </mesh>
      {isInTransit && (
        <spotLight 
          position={[0, 0.5, 1.8]} 
          target-position={[0, 0, 8]} 
          angle={0.6} 
          penumbra={0.5} 
          intensity={2.0} 
          color="#fef08a" 
          distance={15} 
        />
      )}
    </group>
  );
};

/**
 * Highly detailed authentic Heavy Cargo Semi-Truck model
 */
export const RealisticCargoTruck: React.FC<{ isSelected: boolean; isInTransit: boolean }> = ({
  isSelected,
  isInTransit,
}) => {
  return (
    <group>
      {/* Front Tractor Cab */}
      <group position={[0, 0, 1.4]}>
        {/* Hood & Engine Compartment */}
        <mesh position={[0, 0.6, 0.5]} castShadow>
          <boxGeometry args={[1.5, 0.9, 1.4]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Chrome Front Grille */}
        <mesh position={[0, 0.55, 1.22]}>
          <boxGeometry args={[1.1, 0.7, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Driver Cab Sleeper */}
        <mesh position={[0, 1.15, -0.2]} castShadow>
          <boxGeometry args={[1.5, 1.4, 1.2]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, 1.35, 0.42]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[1.3, 0.65]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.05} />
        </mesh>

        {/* Vertical Chrome Exhaust Stacks */}
        <mesh position={[-0.8, 1.4, -0.6]}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.8, 1.4, -0.6]}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Front Steer Wheels */}
        {[-0.82, 0.82].map((x, i) => (
          <mesh key={i} position={[x, 0.35, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.22, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Large Commercial Freight Trailer */}
      <group position={[0, 0, -1.1]}>
        {/* Trailer Cargo Body */}
        <mesh position={[0, 1.35, 0]} castShadow>
          <boxGeometry args={[1.7, 1.8, 4.0]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Rear Loading Frame & Doors */}
        <mesh position={[0, 1.35, -2.01]}>
          <boxGeometry args={[1.65, 1.7, 0.05]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.5} />
        </mesh>

        {/* Steel Undercarriage Chassis Beam */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.2, 0.2, 3.8]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* Tandem Rear Trailer Axles (4 Wheels) */}
        {[-1.1, -1.7].map((z, zi) => (
          <group key={zi}>
            {[-0.92, 0.92].map((x, xi) => (
              <mesh key={xi} position={[x, 0.35, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.35, 0.35, 0.26, 16]} />
                <meshStandardMaterial color="#1e293b" roughness={0.8} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Headlights & Tail Lights */}
      <mesh position={[-0.55, 0.45, 2.65]}>
        <boxGeometry args={[0.2, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.0} />
      </mesh>
      <mesh position={[0.55, 0.45, 2.65]}>
        <boxGeometry args={[0.2, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.0} />
      </mesh>
      <mesh position={[-0.7, 0.5, -3.12]}>
        <boxGeometry args={[0.15, 0.1, 0.05]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
      </mesh>
      <mesh position={[0.7, 0.5, -3.12]}>
        <boxGeometry args={[0.15, 0.1, 0.05]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
      </mesh>
    </group>
  );
};

/**
 * Highly detailed Medical Rescue Drone with spinning counter-rotating carbon blades
 */
export const RealisticMedicalDrone: React.FC<{ isSelected: boolean; isInTransit: boolean }> = ({
  isSelected,
  isInTransit,
}) => {
  const rotorsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (rotorsRef.current) {
      const rotSpeed = isInTransit ? 25 : 8;
      rotorsRef.current.children.forEach((r, i) => {
        r.rotation.y += rotSpeed * delta * (i % 2 === 0 ? 1 : -1);
      });
    }
  });

  return (
    <group position={[0, 0.5, 0]}>
      {/* Aerodynamic Carbon Fuselage */}
      <mesh castShadow>
        <sphereGeometry args={[0.75, 16, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cockpit / Camera Gimbal Sphere */}
      <mesh position={[0, -0.2, 0.65]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.8} />
      </mesh>

      {/* Emergency Medical Cargo Pod (Underslung) */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.7, 12]} />
        <meshStandardMaterial color="#ef4444" metalness={0.2} roughness={0.3} />
      </mesh>

      {/* 4 Carbon Arms */}
      {[
        [0.85, 0.85],
        [-0.85, 0.85],
        [0.85, -0.85],
        [-0.85, -0.85],
      ].map(([ax, az], i) => (
        <group key={i}>
          {/* Carbon Fiber Tube Arm */}
          <mesh position={[ax / 2, 0.1, az / 2]} rotation={[0, -Math.atan2(az, ax), 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Motor Pod */}
          <mesh position={[ax, 0.15, az]}>
            <cylinderGeometry args={[0.14, 0.14, 0.22, 12]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 4 Spinning Rotor Blades */}
      <group ref={rotorsRef}>
        {[
          [0.85, 0.28, 0.85],
          [-0.85, 0.28, 0.85],
          [0.85, 0.28, -0.85],
          [-0.85, 0.28, -0.85],
        ].map(([rx, ry, rz], i) => (
          <group key={i} position={[rx, ry, rz]}>
            <mesh>
              <boxGeometry args={[1.3, 0.02, 0.12]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Aluminum Landing Skids */}
      <group position={[0, -0.8, 0]}>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[0.06, 0.06, 1.4]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[0.06, 0.06, 1.4]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
      </group>

      {/* Green/Red Nav Strobe Lights */}
      <mesh position={[-0.85, 0.1, -0.85]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.0} />
      </mesh>
      <mesh position={[0.85, 0.1, -0.85]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3.0} />
      </mesh>
    </group>
  );
};
