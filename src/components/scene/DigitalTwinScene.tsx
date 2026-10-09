import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSimulation } from '../../context/SimulationContext';
import { CityGround } from './CityGround';
import { CityBuildings } from './CityBuildings';
import { RoadNetwork } from './RoadNetwork';
import { FacilityMarker } from './FacilityMarker';
import { VehicleMarker } from './VehicleMarker';
import { HazardZone } from './HazardZone';
import { Eye, Camera, Compass, Maximize2 } from 'lucide-react';

export const DigitalTwinScene: React.FC = () => {
  const { state, selectedEntity, selectEntity } = useSimulation();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Active deliveries
  const activeDeliveries = state.deliveries.filter(
    d => d.status === 'in_transit' || d.status === 'rerouted' || d.status === 'scheduled'
  );

  const setCameraPreset = (preset: 'isometric' | 'topdown' | 'street' | 'focus') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (preset === 'isometric') {
      controls.object.position.set(38, 32, 48);
      controls.target.set(0, 0, 0);
    } else if (preset === 'topdown') {
      controls.object.position.set(0, 75, 5);
      controls.target.set(0, 0, 0);
    } else if (preset === 'street') {
      controls.object.position.set(12, 10, 32);
      controls.target.set(0, 5, 0);
    } else if (preset === 'focus' && selectedEntity.id) {
      if (selectedEntity.type === 'facility') {
        const fac = state.facilities.find(f => f.id === selectedEntity.id);
        if (fac) {
          controls.target.set(fac.position[0], 2, fac.position[2]);
          controls.object.position.set(fac.position[0] + 15, 14, fac.position[2] + 20);
        }
      } else if (selectedEntity.type === 'vehicle') {
        const veh = state.vehicles.find(v => v.id === selectedEntity.id);
        if (veh) {
          controls.target.set(veh.position[0], 2, veh.position[2]);
          controls.object.position.set(veh.position[0] + 10, 10, veh.position[2] + 15);
        }
      }
    }
    controls.update();
  };

  return (
    <div className="w-full h-full relative select-none bg-ares-bg">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [38, 34, 48], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => selectEntity(null, null)}
      >
        <color attach="background" args={['#e0f2fe']} />
        <fog attach="fog" args={['#e0f2fe', 60, 190]} />

        {/* Crisp Daylight Operations Lighting */}
        <ambientLight intensity={0.9} />
        <hemisphereLight args={['#e0f2fe', '#cbd5e1', 0.6]} />
        <directionalLight 
          position={[45, 80, 35]} 
          intensity={2.0} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048} 
          shadow-camera-near={10}
          shadow-camera-far={180}
          shadow-camera-left={-55}
          shadow-camera-right={55}
          shadow-camera-top={55}
          shadow-camera-bottom={-55}
        />
        <pointLight position={[0, 25, 0]} intensity={0.6} color="#0284c7" distance={80} />
        <pointLight position={[-25, 20, 25]} intensity={0.4} color="#0369a1" distance={60} />
        <pointLight position={[25, 20, -25]} intensity={0.4} color="#059669" distance={60} />

        <Suspense fallback={null}>
          {/* Ground Terrain */}
          <CityGround />

          {/* 3D Volumetric City Skyline Buildings */}
          <CityBuildings />

          {/* 3D Road Network */}
          <RoadNetwork
            nodes={state.roadNodes}
            edges={state.roadEdges}
            activeDeliveries={activeDeliveries}
            selectedEdgeId={selectedEntity.type === 'edge' ? selectedEntity.id : null}
            onSelectEdge={(edgeId) => selectEntity('edge', edgeId)}
          />

          {/* Facility 3D Architectural Beacons */}
          {state.facilities.map(facility => (
            <FacilityMarker
              key={facility.id}
              facility={facility}
              isSelected={selectedEntity.type === 'facility' && selectedEntity.id === facility.id}
              onSelect={(id) => selectEntity('facility', id)}
            />
          ))}

          {/* Moving 3D Vehicle Transports */}
          {state.vehicles.map(vehicle => (
            <VehicleMarker
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedEntity.type === 'vehicle' && selectedEntity.id === vehicle.id}
              onSelect={(id) => selectEntity('vehicle', id)}
            />
          ))}

          {/* Translucent Hazard Zones */}
          {state.incidents.map(inc => (
            <HazardZone key={inc.id} incident={inc} />
          ))}
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={10}
          maxDistance={120}
        />
      </Canvas>

      {/* Floating 3D Camera Angles Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-ares-card/90 backdrop-blur-md p-1.5 rounded-lg border border-ares-border text-xs font-mono shadow-xl">
        <Camera className="w-3.5 h-3.5 text-ares-accent ml-1 mr-1" />
        <button
          onClick={() => setCameraPreset('isometric')}
          className="px-2.5 py-1 rounded hover:bg-ares-border text-ares-subtext hover:text-ares-text transition-colors"
          title="Isometric 3D Perspective"
        >
          3D Angle
        </button>
        <button
          onClick={() => setCameraPreset('street')}
          className="px-2.5 py-1 rounded hover:bg-ares-border text-ares-subtext hover:text-ares-text transition-colors"
          title="Street Level Horizon"
        >
          Skyline
        </button>
        <button
          onClick={() => setCameraPreset('topdown')}
          className="px-2.5 py-1 rounded hover:bg-ares-border text-ares-subtext hover:text-ares-text transition-colors"
          title="Tactical Overhead"
        >
          Overhead
        </button>
        {selectedEntity.id && (
          <button
            onClick={() => setCameraPreset('focus')}
            className="px-2.5 py-1 rounded bg-ares-accent/20 text-ares-accent border border-ares-accent/40 font-bold flex items-center gap-1"
          >
            <Maximize2 className="w-3 h-3" />
            Focus
          </button>
        )}
      </div>

      {/* 3D Legend */}
      <div className="absolute bottom-6 left-4 z-10 bg-ares-card/90 backdrop-blur-md px-3 py-2 rounded-lg border border-ares-border font-mono text-[11px] space-y-1 shadow-2xl hidden sm:block">
        <div className="text-[10px] text-ares-muted uppercase font-bold tracking-wider mb-1">
          3D Digital Twin Visual Key
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"/> Hospital</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"/> Shelter</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block"/> Depot</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"/> Command HQ</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"/> Flood Surge</div>
        </div>
      </div>
    </div>
  );
};
