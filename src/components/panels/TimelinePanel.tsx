import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Radio 
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const TimelinePanel: React.FC = () => {
  const { state } = useSimulation();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeDeliveries = state.deliveries.filter(
    d => d.status === 'in_transit' || d.status === 'rerouted' || d.status === 'scheduled'
  );

  const recentEvents = state.events.slice(0, 15);

  return (
    <div className={`bg-ares-surface border-t border-ares-border transition-all duration-300 z-10 flex flex-col ${
      isExpanded ? 'h-64' : 'h-12'
    }`}>
      {/* Drawer Toggle Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-ares-card transition-colors select-none shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-ares-text">
            <Clock className="w-3.5 h-3.5 text-ares-accent" />
            <span>OPERATIONS LOG & ACTIVE TRANSFERS</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-ares-accent/15 text-ares-accent border border-ares-accent/30">
              {activeDeliveries.length} IN TRANSIT
            </span>
            <span className="text-ares-subtext hidden sm:inline">
              | Total Events: {state.events.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-ares-subtext">
          <span>{isExpanded ? 'COLLAPSE' : 'EXPAND TIMELINE'}</span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ares-border">
          {/* Active Deliveries Progress Rail */}
          <div className="p-3 overflow-y-auto space-y-2">
            <div className="text-[10px] font-mono uppercase text-ares-muted tracking-wider font-semibold">
              Live Fleet Dispatches ({activeDeliveries.length})
            </div>

            {activeDeliveries.length === 0 ? (
              <div className="text-xs text-ares-muted font-mono p-4 text-center">
                All scheduled convoys delivered or resting at depot.
              </div>
            ) : (
              activeDeliveries.map(del => {
                const vehicle = state.vehicles.find(v => v.id === del.vehicleId);
                const source = state.facilities.find(f => f.id === del.sourceFacilityId);
                const dest = state.facilities.find(f => f.id === del.destinationFacilityId);
                const totalTicks = Math.max(1, del.estimatedArrivalTick - del.departureTick);
                const currentTickInTransit = Math.max(0, state.currentTick - del.departureTick);
                const progressPct = Math.min(100, Math.round((currentTickInTransit / totalTicks) * 100));

                return (
                  <div key={del.id} className="p-2.5 rounded-lg bg-ares-card border border-ares-border font-mono text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ares-accent flex items-center gap-1.5 truncate">
                        <Truck className="w-3.5 h-3.5" />
                        {vehicle?.name || del.vehicleId}
                      </span>
                      <span className="text-[10px] text-ares-subtext">
                        ETA: TICK {del.estimatedArrivalTick}
                      </span>
                    </div>

                    <div className="text-[11px] text-ares-subtext truncate">
                      {source?.name} → {dest?.name} ({del.quantity} {del.resourceId})
                    </div>

                    <div className="w-full bg-ares-border h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-ares-accent h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Event Log */}
          <div className="p-3 overflow-y-auto space-y-2">
            <div className="text-[10px] font-mono uppercase text-ares-muted tracking-wider font-semibold">
              Chronological Event Feed
            </div>

            <div className="space-y-1.5">
              {recentEvents.map(evt => {
                const isCrit = evt.severity === 'critical';
                const isSuccess = evt.severity === 'success';

                return (
                  <div key={evt.id} className="p-2 rounded bg-ares-card/70 border border-ares-border/60 text-xs font-mono flex items-start gap-2">
                    <span className="text-[10px] text-ares-muted px-1.5 py-0.5 rounded bg-ares-border shrink-0">
                      T{evt.tick}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-[11px] truncate ${
                        isCrit ? 'text-ares-critical' : isSuccess ? 'text-ares-success' : 'text-ares-text'
                      }`}>
                        {evt.title}
                      </div>
                      <div className="text-[11px] text-ares-subtext truncate">
                        {evt.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
