import React from 'react';
import { 
  Building2, 
  Truck, 
  Package, 
  TrendingDown, 
  ShieldCheck, 
  AlertCircle, 
  X,
  Gauge,
  Navigation
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const EntityDetailPanel: React.FC = () => {
  const { state, selectedEntity, selectEntity } = useSimulation();

  if (!selectedEntity.id) {
    return (
      <div className="w-88 bg-ares-surface/95 border-l border-ares-border flex flex-col h-full select-none p-6 items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-ares-card border border-ares-border flex items-center justify-center text-ares-muted mb-3">
          <Navigation className="w-5 h-5 animate-pulse text-ares-accent" />
        </div>
        <h3 className="text-sm font-mono font-bold text-ares-text uppercase">Telemetry Feed Idle</h3>
        <p className="text-xs text-ares-subtext mt-1 max-w-xs leading-relaxed">
          Select any facility, moving vehicle, or road edge on the digital twin to inspect real-time inventory, route telemetry, and projected shortages.
        </p>
      </div>
    );
  }

  // Facility View
  if (selectedEntity.type === 'facility') {
    const facility = state.facilities.find(f => f.id === selectedEntity.id);
    if (!facility) return null;

    const isHospital = facility.type === 'hospital';
    const isShelter = facility.type === 'shelter';
    const isOffline = facility.operationalStatus === 'offline';

    return (
      <div className="w-88 bg-ares-surface/95 border-l border-ares-border flex flex-col h-full overflow-hidden select-none">
        <div className="p-4 border-b border-ares-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-ares-accent" />
            <h3 className="text-xs font-mono font-bold uppercase text-ares-text truncate max-w-[200px]">
              {facility.name}
            </h3>
          </div>
          <button
            onClick={() => selectEntity(null, null)}
            className="p-1 rounded hover:bg-ares-border text-ares-muted hover:text-ares-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Status badge and meta */}
          <div className="flex items-center justify-between bg-ares-card p-3 rounded-lg border border-ares-border">
            <div>
              <div className="text-[10px] font-mono uppercase text-ares-muted">CLASSIFICATION</div>
              <div className="font-bold font-mono text-ares-text uppercase">{facility.type.replace('_', ' ')}</div>
            </div>
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
              isOffline ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {facility.operationalStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-lg bg-ares-card border border-ares-border">
              <div className="text-[10px] text-ares-muted">POPULATION</div>
              <div className="text-base font-bold text-ares-text">{facility.population}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-ares-card border border-ares-border">
              <div className="text-[10px] text-ares-muted">PRIORITY WEIGHT</div>
              <div className="text-base font-bold text-ares-accent">{facility.priority} / 10</div>
            </div>
          </div>

          {/* Stock inventory & reserves */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-ares-subtext font-semibold">
              <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-ares-accent" /> Stock Inventory</span>
              <span className="text-[10px] text-ares-muted">Reserved</span>
            </div>

            <div className="space-y-1.5">
              {state.resources.map(res => {
                const stock = facility.inventory[res.id] || 0;
                const reserved = facility.reservedInventory[res.id] || 0;
                const burnRate = facility.consumptionRates[res.id] || 0;
                const timeToShortage = burnRate > 0 ? Math.floor(stock / burnRate) : null;

                const isCrit = timeToShortage !== null && timeToShortage <= 6;
                const isWarn = timeToShortage !== null && timeToShortage <= 12;

                return (
                  <div key={res.id} className="p-2.5 rounded-lg bg-ares-card border border-ares-border flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ares-text truncate">{res.name}</span>
                      <div className="font-mono flex items-center gap-2">
                        <span className={`font-bold ${isCrit ? 'text-ares-critical' : isWarn ? 'text-ares-amber' : 'text-ares-text'}`}>
                          {stock}
                        </span>
                        {reserved > 0 && (
                          <span className="text-[10px] text-ares-muted font-mono">({reserved})</span>
                        )}
                      </div>
                    </div>

                    {burnRate > 0 && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-ares-muted pt-1 border-t border-ares-border/60">
                        <span className="flex items-center gap-1">
                          <TrendingDown className="w-3 h-3 text-ares-amber" />
                          Burn: {burnRate}/tick
                        </span>
                        <span className={isCrit ? 'text-ares-critical font-bold' : ''}>
                          {timeToShortage !== null ? `Depletion: ~${timeToShortage} ticks` : 'Stable'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vehicle View
  if (selectedEntity.type === 'vehicle') {
    const vehicle = state.vehicles.find(v => v.id === selectedEntity.id);
    if (!vehicle) return null;

    const assignedDelivery = state.deliveries.find(d => d.id === vehicle.assignedDeliveryId);

    return (
      <div className="w-88 bg-ares-surface/95 border-l border-ares-border flex flex-col h-full overflow-hidden select-none">
        <div className="p-4 border-b border-ares-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-ares-accent" />
            <h3 className="text-xs font-mono font-bold uppercase text-ares-text truncate max-w-[200px]">
              {vehicle.name}
            </h3>
          </div>
          <button
            onClick={() => selectEntity(null, null)}
            className="p-1 rounded hover:bg-ares-border text-ares-muted hover:text-ares-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-ares-card border border-ares-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ares-muted uppercase">TYPE</span>
              <span className="font-bold text-ares-accent uppercase">{vehicle.type.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ares-muted uppercase">STATUS</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                vehicle.status === 'in_transit' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-ares-border text-ares-subtext'
              }`}>
                {vehicle.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ares-muted uppercase">SPEED</span>
              <span className="text-ares-text font-bold">{vehicle.speed}x Mach</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-ares-card border border-ares-border space-y-1.5">
            <div className="flex items-center justify-between text-ares-subtext">
              <span>CARGO PAYLOAD</span>
              <span className="font-bold text-ares-text">{vehicle.currentLoad} / {vehicle.capacity}</span>
            </div>
            <div className="w-full bg-ares-border h-2 rounded-full overflow-hidden">
              <div 
                className="bg-ares-accent h-full rounded-full transition-all duration-300" 
                style={{ width: `${(vehicle.currentLoad / vehicle.capacity) * 100}%` }}
              />
            </div>
          </div>

          {assignedDelivery && (
            <div className="p-3 rounded-lg bg-ares-card border border-ares-accent/40 space-y-2">
              <div className="text-[10px] uppercase text-ares-accent font-bold">ACTIVE MANIFEST</div>
              <div className="text-ares-text text-[11px]">
                Transporting {assignedDelivery.quantity} units of {assignedDelivery.resourceId}
              </div>
              <div className="text-[10px] text-ares-subtext">
                Destination: {assignedDelivery.destinationFacilityId}
              </div>
              <div className="text-[10px] text-ares-muted">
                Est. Arrival: Tick {assignedDelivery.estimatedArrivalTick}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edge View
  if (selectedEntity.type === 'edge') {
    const edge = state.roadEdges.find(e => e.id === selectedEntity.id);
    if (!edge) return null;

    return (
      <div className="w-88 bg-ares-surface/95 border-l border-ares-border flex flex-col h-full overflow-hidden select-none p-4 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-ares-border pb-3">
          <span className="font-bold text-ares-text">ROAD SEGMENT TELEMETRY</span>
          <button onClick={() => selectEntity(null, null)}><X className="w-4 h-4 text-ares-muted" /></button>
        </div>
        <div className="p-3 rounded-lg bg-ares-card border border-ares-border space-y-2">
          <div><span className="text-ares-muted">CORRIDOR:</span> {edge.fromNode} ↔ {edge.toNode}</div>
          <div><span className="text-ares-muted">STATUS:</span> <span className="font-bold text-ares-accent uppercase">{edge.status}</span></div>
          <div><span className="text-ares-muted">TRAVEL TIME:</span> {edge.travelTimeTicks} ticks</div>
          <div><span className="text-ares-muted">HAZARD RISK:</span> {edge.hazardExposureCost}</div>
        </div>
      </div>
    );
  }

  return null;
};
