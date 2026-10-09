import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSimulation } from '../../context/SimulationContext';
import { CityGround } from './CityGround';
import { RoadNetwork } from './RoadNetwork';
import { FacilityMarker } from './FacilityMarker';
import { VehicleMarker } from './VehicleMarker';
import { HazardZone } from './HazardZone';

interface DigitalTwinSceneProps {
  onSelectEntity?: (type: 'facility' | 'vehicle' | 'edge', id: string) => void;
}

export const DigitalTwinScene: React.FC<DigitalTwinSceneProps> = () => {
  const { state, selectedEntity, selectEntity } = useSimulation();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Active deliveries
  const activeDeliveries = state.deliveries.filter(
    d => d.status === 'in_transit' || d.status === 'rerouted' || d.status === 'scheduled'
  );

  return (
    <div className="w-full h-full relative select-none bg-ares-bg">
      <Canvas
        camera={{ position: [0, 48, 55], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => selectEntity(null, null)}
      >
        <color attach="background" args={['#070a11']} />
        <fog attach="fog" args={['#070a11', 40, 140]} />

        {/* Cinematic lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[30, 60, 20]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />
        <pointLight position={[0, 25, 0]} intensity={0.8} color="#00e5ff" distance={80} />

        <Suspense fallback={null}>
          <CityGround />

          <RoadNetwork
            nodes={state.roadNodes}
            edges={state.roadEdges}
            activeDeliveries={activeDeliveries}
            selectedEdgeId={selectedEntity.type === 'edge' ? selectedEntity.id : null}
            onSelectEdge={(edgeId) => selectEntity('edge', edgeId)}
          />

          {/* Facility markers */}
          {state.facilities.map(facility => (
            <FacilityMarker
              key={facility.id}
              facility={facility}
              isSelected={selectedEntity.type === 'facility' && selectedEntity.id === facility.id}
              onSelect={(id) => selectEntity('facility', id)}
            />
          ))}

          {/* Vehicle markers */}
          {state.vehicles.map(vehicle => (
            <VehicleMarker
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedEntity.type === 'vehicle' && selectedEntity.id === vehicle.id}
              onSelect={(id) => selectEntity('vehicle', id)}
            />
          ))}

          {/* Active Hazard Zones */}
          {state.incidents.map(inc => (
            <HazardZone key={inc.id} incident={inc} />
          ))}
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={15}
          maxDistance={110}
        />
      </Canvas>
    </div>
  );
};
