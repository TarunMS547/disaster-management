import React from 'react';
import { Text } from '@react-three/drei';
import { Facility } from '../../types/simulation';

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

  // Type styling
  const config = React.useMemo(() => {
    switch (facility.type) {
      case 'hospital':
        return {
          color: '#f43f5e',
          beaconColor: '#f43f5e',
          typeLabel: 'HOSPITAL',
          height: 4.5,
          radius: 2.2,
        };
      case 'shelter':
        return {
          color: '#10b981',
          beaconColor: '#10b981',
          typeLabel: 'SHELTER',
          height: 3.2,
          radius: 2.8,
        };
      case 'warehouse':
        return {
          color: '#38bdf8',
          beaconColor: '#0ea5e9',
          typeLabel: 'DEPOT',
          height: 3.8,
          radius: 3.0,
        };
      case 'response_center':
      default:
        return {
          color: '#00e5ff',
          beaconColor: '#00e5ff',
          typeLabel: 'HQ',
          height: 6.0,
          radius: 2.5,
        };
    }
  }, [facility.type]);

  const isOffline = facility.operationalStatus === 'offline';
  const effectiveColor = isOffline ? '#475569' : config.color;

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
      {/* 1. Base Building Geometry */}
      {facility.type === 'shelter' ? (
        // Dome for shelters
        <mesh position={[0, config.height / 2, 0]}>
          <sphereGeometry args={[config.radius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color={effectiveColor} 
            metalness={0.4} 
            roughness={0.3} 
            wireframe={hovered}
          />
        </mesh>
      ) : facility.type === 'response_center' ? (
        // Spire for emergency HQ
        <mesh position={[0, config.height / 2, 0]}>
          <coneGeometry args={[config.radius, config.height, 6]} />
          <meshStandardMaterial 
            color={effectiveColor} 
            metalness={0.7} 
            roughness={0.2} 
            wireframe={hovered}
          />
        </mesh>
      ) : (
        // Hexagonal block for hospitals & warehouses
        <mesh position={[0, config.height / 2, 0]}>
          <cylinderGeometry args={[config.radius, config.radius * 1.1, config.height, 6]} />
          <meshStandardMaterial 
            color={effectiveColor} 
            metalness={0.5} 
            roughness={0.3} 
            wireframe={hovered}
          />
        </mesh>
      )}

      {/* 2. Top Beacon Light */}
      {!isOffline && (
        <group position={[0, config.height + 0.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial 
              color={config.beaconColor} 
              emissive={config.beaconColor} 
              emissiveIntensity={2} 
            />
          </mesh>
          <pointLight color={config.beaconColor} intensity={2} distance={12} />
        </group>
      )}

      {/* 3. Selection Hologram Ring */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[config.radius * 1.3, config.radius * 1.5, 32]} />
          <meshBasicMaterial color="#00e5ff" side={2} transparent opacity={0.8} />
        </mesh>
      )}

      {/* 4. Floating Holographic Facility Tag */}
      <group position={[0, config.height + 2.5, 0]}>
        <Text
          fontSize={1.3}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.08}
          outlineColor="#090d16"
        >
          {facility.name.toUpperCase()}
        </Text>
        <Text
          position={[0, -1.0, 0]}
          fontSize={0.9}
          color={effectiveColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#090d16"
        >
          {`[${config.typeLabel}] ${isOffline ? 'OFFLINE' : `POP: ${facility.population}`}`}
        </Text>
      </group>
    </group>
  );
};
