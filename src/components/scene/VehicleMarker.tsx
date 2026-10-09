import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Vehicle } from '../../types/simulation';
import { 
  RealisticAmbulance, 
  RealisticCargoTruck, 
  RealisticMedicalDrone 
} from './models/RealisticVehicles';

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

  const baseElevation = isDrone ? 4.5 : 0.05;

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
      {/* 1. Realistic 3D Vehicle Model */}
      {isDrone ? (
        <RealisticMedicalDrone isSelected={isSelected} isInTransit={isInTransit} />
      ) : isTruck ? (
        <RealisticCargoTruck isSelected={isSelected} isInTransit={isInTransit} />
      ) : (
        <RealisticAmbulance isSelected={isSelected} isInTransit={isInTransit} />
      )}

      {/* 2. Selection Ring Decal */}
      {isSelected && (
        <mesh position={[0, isDrone ? -4.3 : 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 2.9, 24]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}

      {/* 3. Name & Manifest HUD Tag */}
      <group position={[0, isDrone ? 2.5 : 2.8, 0]}>
        <Text
          fontSize={0.9}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.08}
          outlineColor="#090d16"
          fontWeight="bold"
        >
          {vehicle.name}
        </Text>
        <Text
          position={[0, -0.65, 0]}
          fontSize={0.65}
          color={isInTransit ? '#00e5ff' : vehicle.status === 'disabled' ? '#ef4444' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#090d16"
          fontWeight="bold"
        >
          {isInTransit ? `CARGO: ${vehicle.currentLoad}/${vehicle.capacity} UNITS` : `STATUS: ${vehicle.status.toUpperCase()}`}
        </Text>
      </group>
    </group>
  );
};
