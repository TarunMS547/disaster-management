import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Radio,
  LineChart,
  List
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { VariableGraph } from '../analytics/VariableGraph';

export const TimelinePanel: React.FC = () => {
  const { state } = useSimulation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'transfers' | 'events' | 'graph'>('graph');

  const activeDeliveries = state.deliveries.filter(
    d => d.status === 'in_transit' || d.status === 'rerouted' || d.status === 'scheduled'
  );

  const recentEvents = state.events.slice(0, 25);

  return (
    <div className={`bg-ares-surface border-t border-ares-border transition-all duration-300 z-10 flex flex-col ${
      isExpanded ? (activeTab === 'graph' ? 'h-[440px]' : 'h-72') : 'h-12'
    }`}>
      {/* Drawer Toggle Header Bar */}
      <div 
        className="h-12 px-4 flex items-center justify-between hover:bg-ares-card transition-colors select-none shrink-0"
      >
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 font-mono text-xs font-bold text-black cursor-pointer"
          >
            <Clock className="w-4 h-4 text-ares-accent" />
            <span className="uppercase tracking-wider">Live Operations Hub</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-ares-card p-0.5 rounded-lg border border-ares-border text-xs font-mono">
            <button
              onClick={() => { setActiveTab('graph'); setIsExpanded(true); }}
              className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1 ${
                activeTab === 'graph'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-ares-border'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Variable Graph</span>
            </button>

            <button
              onClick={() => { setActiveTab('transfers'); setIsExpanded(true); }}
              className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1 ${
                activeTab === 'transfers'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-ares-border'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Transfers ({activeDeliveries.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('events'); setIsExpanded(true); }}
              className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1 ${
                activeTab === 'events'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-ares-border'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Events ({state.events.length})</span>
            </button>
          </div>
        </div>

        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-mono text-black font-semibold cursor-pointer"
        >
          <span>{isExpanded ? 'COLLAPSE' : 'EXPAND PANEL'}</span>
          {isExpanded ? <ChevronDown className="w-4 h-4 text-black" /> : <ChevronUp className="w-4 h-4 text-black" />}
        </div>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'graph' ? (
            <div className="w-full h-full">
              <VariableGraph 
                metricsHistory={state.metricsHistory} 
                currentTick={state.currentTick} 
                height={290}
                compact={false}
              />
            </div>
          ) : activeTab === 'transfers' ? (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase text-black font-bold tracking-wider">
                Live Fleet Dispatches ({activeDeliveries.length})
              </div>

              {activeDeliveries.length === 0 ? (
                <div className="text-xs text-black font-mono p-6 text-center bg-ares-card rounded-lg border border-ares-border">
                  All scheduled convoys delivered or resting at depot. Ready for assignment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {activeDeliveries.map(del => {
                    const vehicle = state.vehicles.find(v => v.id === del.vehicleId);
                    const source = state.facilities.find(f => f.id === del.sourceFacilityId);
                    const dest = state.facilities.find(f => f.id === del.destinationFacilityId);
                    const totalTicks = Math.max(1, del.estimatedArrivalTick - del.departureTick);
                    const currentTickInTransit = Math.max(0, state.currentTick - del.departureTick);
                    const progressPct = Math.min(100, Math.round((currentTickInTransit / totalTicks) * 100));

                    return (
                      <div key={del.id} className="p-3 rounded-lg bg-ares-card border border-ares-border font-mono text-xs space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ares-accent flex items-center gap-1.5 truncate">
                            <Truck className="w-4 h-4" />
                            {vehicle?.name || del.vehicleId}
                          </span>
                          <span className="text-[11px] text-black font-semibold">
                            ETA: TICK {del.estimatedArrivalTick}
                          </span>
                        </div>

                        <div className="text-xs text-black truncate font-medium">
                          {source?.name} &rarr; {dest?.name} ({del.quantity} {del.resourceId})
                        </div>

                        <div className="w-full bg-ares-border h-2 rounded-full overflow-hidden mt-1">
                          <div 
                            className="bg-ares-accent h-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase text-black font-bold tracking-wider">
                Chronological Event Feed ({recentEvents.length} Recent)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recentEvents.map(evt => {
                  const isCrit = evt.severity === 'critical';
                  const isSuccess = evt.severity === 'success';

                  return (
                    <div key={evt.id} className="p-2.5 rounded-lg bg-ares-card border border-ares-border text-xs font-mono flex items-start gap-2 shadow-sm">
                      <span className="text-[11px] font-bold text-black px-1.5 py-0.5 rounded bg-ares-border shrink-0">
                        T{evt.tick}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-xs truncate ${
                          isCrit ? 'text-ares-critical' : isSuccess ? 'text-ares-success' : 'text-black'
                        }`}>
                          {evt.title}
                        </div>
                        <div className="text-[11px] text-black font-medium truncate mt-0.5">
                          {evt.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
