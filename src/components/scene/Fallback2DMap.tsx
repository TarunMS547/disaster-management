import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Building2, Truck, ShieldAlert, Cross, Warehouse } from 'lucide-react';

export const Fallback2DMap: React.FC = () => {
  const { state, selectedEntity, selectEntity } = useSimulation();

  // Project 3D coordinates [-30, 30] to SVG viewBox [0, 600]
  const project = (x: number, z: number): [number, number] => {
    const scale = 8.5;
    const cx = 300;
    const cy = 300;
    return [cx + x * scale, cy + z * scale];
  };

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, [number, number]>();
    for (const node of state.roadNodes) {
      map.set(node.id, project(node.position[0], node.position[2]));
    }
    return map;
  }, [state.roadNodes]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-ares-bg text-ares-text overflow-hidden">
      {/* 2D SVG Schematic Canvas */}
      <div className="flex-1 relative border-r border-ares-border flex items-center justify-center p-4">
        <svg viewBox="0 0 600 600" className="w-full h-full max-h-[700px] bg-ares-surface rounded-xl border border-ares-border/80 shadow-2xl">
          {/* Cyber Grid background */}
          <defs>
            <pattern id="grid2d" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="600" height="600" fill="url(#grid2d)" />

          {/* Synthetic River */}
          <rect x="0" y="380" width="600" height="70" fill="#0369a1" opacity="0.4" />

          {/* Road Network Lines */}
          {state.roadEdges.map(edge => {
            const p1 = nodeMap.get(edge.fromNode);
            const p2 = nodeMap.get(edge.toNode);
            if (!p1 || !p2) return null;

            const isBlocked = edge.status === 'blocked';
            const isSlow = edge.status === 'slow';
            const isSelected = selectedEntity.type === 'edge' && selectedEntity.id === edge.id;

            return (
              <g key={edge.id} className="cursor-pointer" onClick={() => selectEntity('edge', edge.id)}>
                <line
                  x1={p1[0]}
                  y1={p1[1]}
                  x2={p2[0]}
                  y2={p2[1]}
                  stroke={isBlocked ? '#ef4444' : isSlow ? '#f59e0b' : '#334155'}
                  strokeWidth={isSelected ? 6 : isBlocked ? 5 : 3}
                  strokeDasharray={isBlocked ? '8,4' : undefined}
                />
              </g>
            );
          })}

          {/* Hazard Zones */}
          {state.incidents.map(inc => {
            const [hx, hy] = project(inc.position[0], inc.position[2]);
            let color = '#ef4444';
            if (inc.type === 'flood_expansion') color = '#0284c7';
            else if (inc.type === 'earthquake') color = '#ea580c';
            else if (inc.type === 'landslide') color = '#b45309';
            else if (inc.type === 'weather_change') color = '#8b5cf6';
            else if (inc.type === 'acid_rain') color = '#84cc16';
            else if (inc.type === 'satellite_fall') color = '#dc2626';

            return (
              <circle
                key={inc.id}
                cx={hx}
                cy={hy}
                r={inc.radius * 7}
                fill={color}
                fillOpacity="0.25"
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Facilities */}
          {state.facilities.map(fac => {
            const [fx, fy] = project(fac.position[0], fac.position[2]);
            const isSelected = selectedEntity.type === 'facility' && selectedEntity.id === fac.id;
            const isHospital = fac.type === 'hospital';
            const isShelter = fac.type === 'shelter';
            const isWarehouse = fac.type === 'warehouse';

            const fillColor = isHospital ? '#f43f5e' : isShelter ? '#10b981' : isWarehouse ? '#38bdf8' : '#00e5ff';

            return (
              <g 
                key={fac.id} 
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => selectEntity('facility', fac.id)}
              >
                {isSelected && (
                  <circle cx={fx} cy={fy} r="22" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="3,3" />
                )}
                <circle cx={fx} cy={fy} r="14" fill="#0d131f" stroke={fillColor} strokeWidth="3" />
                <text x={fx} y={fy + 4} textAnchor="middle" fill={fillColor} fontSize="10" fontWeight="bold">
                  {isHospital ? 'H' : isShelter ? 'S' : isWarehouse ? 'W' : 'HQ'}
                </text>
                <text x={fx} y={fy + 28} textAnchor="middle" fill="#f1f5f9" fontSize="10" fontWeight="bold">
                  {fac.name}
                </text>
              </g>
            );
          })}

          {/* Moving Vehicles */}
          {state.vehicles.map(veh => {
            const [vx, vy] = project(veh.position[0], veh.position[2]);
            const isSelected = selectedEntity.type === 'vehicle' && selectedEntity.id === veh.id;
            return (
              <g
                key={veh.id}
                className="cursor-pointer"
                onClick={() => selectEntity('vehicle', veh.id)}
              >
                <circle cx={vx} cy={vy} r={isSelected ? 10 : 7} fill="#00e5ff" stroke="#fff" strokeWidth="1.5" />
                <text x={vx} y={vy - 10} textAnchor="middle" fill="#00e5ff" fontSize="9" fontWeight="bold">
                  {veh.name}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute top-6 left-6 bg-ares-card/90 backdrop-blur p-3 rounded-lg border border-ares-border text-xs space-y-1">
          <div className="text-ares-subtext font-mono font-semibold">2D ACCESSIBLE SCHEMATIC MODE</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/> Hospital</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/> Shelter</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-400 inline-block"/> Depot / Warehouse</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"/> Command HQ</div>
        </div>
      </div>

      {/* Facilities & Units Listing */}
      <div className="w-full md:w-80 bg-ares-surface p-4 overflow-y-auto space-y-4">
        <h3 className="text-sm font-semibold text-ares-subtext uppercase tracking-wider">Facility Roster</h3>
        <div className="space-y-2">
          {state.facilities.map(fac => (
            <div
              key={fac.id}
              onClick={() => selectEntity('facility', fac.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedEntity.id === fac.id
                  ? 'border-ares-accent bg-ares-accentMuted'
                  : 'border-ares-border bg-ares-card/50 hover:border-ares-subtext'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  {fac.type === 'hospital' && <Cross className="w-3.5 h-3.5 text-red-400" />}
                  {fac.type === 'shelter' && <Building2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {fac.type === 'warehouse' && <Warehouse className="w-3.5 h-3.5 text-sky-400" />}
                  {fac.type === 'response_center' && <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />}
                  {fac.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-ares-border font-mono">
                  {fac.operationalStatus.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 text-xs text-ares-subtext grid grid-cols-2 gap-1 font-mono">
                <div>Pop: {fac.population}</div>
                <div>Priority: {fac.priority}/10</div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-ares-subtext uppercase tracking-wider pt-2">Active Vehicles</h3>
        <div className="space-y-2">
          {state.vehicles.map(veh => (
            <div
              key={veh.id}
              onClick={() => selectEntity('vehicle', veh.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedEntity.id === veh.id
                  ? 'border-ares-accent bg-ares-accentMuted'
                  : 'border-ares-border bg-ares-card/50 hover:border-ares-subtext'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" />
                  {veh.name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  veh.status === 'in_transit' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-ares-border text-ares-subtext'
                }`}>
                  {veh.status.toUpperCase()}
                </span>
              </div>
              <div className="mt-1 text-xs text-ares-subtext font-mono">
                Load: {veh.currentLoad} / {veh.capacity} units
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
