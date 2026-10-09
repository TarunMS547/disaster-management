import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Facility } from '../../types/simulation';
import { 
  RealisticHospitalModel, 
  RealisticWarehouseModel, 
  RealisticCommandHQModel, 
  RealisticShelterModel 
} from './models/RealisticFacilities';

interface FacilityMarkerProps {
  facility: Facility;
  isSelected: boolean;
  onSelect: (facilityId: string) => void;
}

export const FacilityMarker: React.FC<FacilityMarkerProps> = ({
  facility,
  isSelected,
  onSelect,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const pos = facility.position;

  const isOffline = facility.operationalStatus === 'offline';

  const typeConfig = React.useMemo(() => {
    switch (facility.type) {
      case 'hospital':
        return { tagColor: '#f43f5e', label: 'TRAUMA HOSPITAL', tagHeight: 11.5 };
      case 'shelter':
        return { tagColor: '#10b981', label: 'CIVIL SHELTER', tagHeight: 6.8 };
      case 'warehouse':
        return { tagColor: '#38bdf8', label: 'LOGISTICS DEPOT', tagHeight: 7.8 };
      case 'response_center':
      default:
        return { tagColor: '#00e5ff', label: 'OPERATIONS HQ', tagHeight: 16.5 };
    }
  }, [facility.type]);

  return (
    <group
      position={[pos[0], 0, pos[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(facility.id);
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
      {/* 1. Realistic 3D Architectural Model */}
      {facility.type === 'hospital' && (
        <RealisticHospitalModel facility={facility} isSelected={isSelected} />
      )}
      {facility.type === 'warehouse' && (
        <RealisticWarehouseModel facility={facility} isSelected={isSelected} />
      )}
      {facility.type === 'response_center' && (
        <RealisticCommandHQModel facility={facility} isSelected={isSelected} />
      )}
      {facility.type === 'shelter' && (
        <RealisticShelterModel facility={facility} isSelected={isSelected} />
      )}

      {/* 2. Selection Base Ground Decal */}
      {isSelected && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.2, 5.8, 36]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
      )}

      {/* Hover Pulse Ring */}
      {hovered && !isSelected && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.0, 5.3, 36]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      )}

      {/* 3. High-Definition Holographic Facility Header Tag */}
      <group position={[0, typeConfig.tagHeight, 0]}>
        <Text
          fontSize={1.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.12}
          outlineColor="#090d16"
          fontWeight="bold"
        >
          {facility.name.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.9, 0]}
          fontSize={0.85}
          color={isOffline ? '#ef4444' : typeConfig.tagColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.08}
          outlineColor="#090d16"
          fontWeight="bold"
        >
          {`[${typeConfig.label}] ${isOffline ? 'OFFLINE / BREACHED' : `POP: ${facility.population}`}`}
        </Text>
      </group>
    </group>
  );
};
