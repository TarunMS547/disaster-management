import React from 'react';
import { Text } from '@react-three/drei';
import { Vehicle } from '../../types/simulation';

interface VehicleMarkerProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: (vehicleId: string) => void;
}

export const VehicleMarker: React.FC<VehicleMarkerProps> = ({
  vehicle,
  isSelected,
  onSelect,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const pos = vehicle.position;

  const isDrone = vehicle.type === 'medical_drone';
  const isTruck = vehicle.type === 'heavy_cargo_truck';
  const isInTransit = vehicle.status === 'in_transit';

  const baseElevation = isDrone ? 4.5 : 0.8;
  const markerColor = isInTransit ? '#00e5ff' : vehicle.status === 'disabled' ? '#ef4444' : '#94a3b8';

  return (
    <group
      position={[pos[0], baseElevation, pos[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(vehicle.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Vehicle Body */}
      {isDrone ? (
        // Drone quadcopter shape
        <group>
          <mesh>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.5} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[2.2, 0.1, 0.3]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[2.2, 0.1, 0.3]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ) : isTruck ? (
        // Heavy Cargo Truck
        <group>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.8, 1.2, 3.2]} />
            <meshStandardMaterial color={markerColor} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, 1.8]}>
            <boxGeometry args={[1.6, 0.9, 1.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ) : (
        // Rapid Response Van / Amphibious
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.4, 0.9, 2.2]} />
          <meshStandardMaterial color={markerColor} metalness={0.5} roughness={0.4} />
        </mesh>
      )}

      {/* 2. Selection Ring */}
      {isSelected && (
        <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.2, 24]} />
          <meshBasicMaterial color="#00e5ff" side={2} />
        </mesh>
      )}

      {/* 3. Name & Load Indicator */}
      <group position={[0, isDrone ? 1.8 : 2.2, 0]}>
        <Text
          fontSize={0.9}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.06}
          outlineColor="#090d16"
        >
          {vehicle.name}
        </Text>
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.7}
          color={markerColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#090d16"
        >
          {isInTransit ? `CARGO: ${vehicle.currentLoad}/${vehicle.capacity}` : `STATUS: ${vehicle.status.toUpperCase()}`}
        </Text>
      </group>
    </group>
  );
};
