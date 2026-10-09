import React from 'react';
import { 
  AlertOctagon, 
  Users, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Flame, 
  ChevronRight 
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const IncidentPanel: React.FC = () => {
  const { state, selectEntity } = useSimulation();

  // Aggregate stats
  const totalPopulationAtRisk = state.facilities.reduce((sum, f) => sum + f.population, 0);
  const criticalRequests = state.requests.filter(
    r => (r.urgency === 'critical' || r.urgency === 'high') && r.status !== 'fulfilled'
  );
  const activeIncidents = state.incidents.filter(i => !i.resolved);

  return (
    <div className="w-80 bg-ares-surface/95 border-r border-ares-border flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 border-b border-ares-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-ares-critical animate-pulse" />
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-ares-text">
            Threat & Demand Matrix
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ares-critical/20 text-ares-critical border border-ares-critical/30 font-bold">
          {activeIncidents.length} HAZARDS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-ares-card border border-ares-border">
            <div className="flex items-center gap-1.5 text-ares-muted text-[10px] font-mono uppercase">
              <Users className="w-3.5 h-3.5 text-ares-accent" />
              <span>POP AT RISK</span>
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-ares-text">
              {totalPopulationAtRisk.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-ares-card border border-ares-border">
            <div className="flex items-center gap-1.5 text-ares-muted text-[10px] font-mono uppercase">
              <AlertOctagon className="w-3.5 h-3.5 text-ares-critical" />
              <span>CRITICAL REQS</span>
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-ares-critical">
              {criticalRequests.length}
            </div>
          </div>
        </div>

        {/* Active Disaster Incidents */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ares-subtext font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-ares-amber" />
            <span>Active Incidents</span>
          </div>

          {activeIncidents.length === 0 ? (
            <div className="p-3 rounded-lg bg-ares-card/40 border border-dashed border-ares-border text-center text-xs text-ares-muted font-mono">
              No active disaster breaches reported.
            </div>
          ) : (
            activeIncidents.map(inc => (
              <div
                key={inc.id}
                className="p-3 rounded-lg bg-ares-critical/10 border border-ares-critical/30 space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ares-critical truncate">
                    {inc.name}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-ares-critical/20 text-ares-critical">
                    {inc.severity}
                  </span>
                </div>
                <p className="text-[11px] text-ares-subtext leading-relaxed">
                  {inc.description}
                </p>
                <div className="text-[10px] font-mono text-ares-muted flex items-center justify-between pt-1 border-t border-ares-critical/20">
                  <span>START: TICK {inc.startTick}</span>
                  <span>RAD: {inc.radius}m</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Priority Resource Requests Queue */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ares-subtext font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-ares-accent" />
            <span>Urgent Resource Requests</span>
          </div>

          {criticalRequests.length === 0 ? (
            <div className="p-3 rounded-lg bg-ares-card/40 border border-dashed border-ares-border text-center text-xs text-ares-muted font-mono">
              All facilities currently stable.
            </div>
          ) : (
            criticalRequests.map(req => {
              const fac = state.facilities.find(f => f.id === req.facilityId);
              const isCrit = req.urgency === 'critical';

              return (
                <div
                  key={req.id}
                  onClick={() => selectEntity('facility', req.facilityId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isCrit 
                      ? 'bg-ares-critical/10 border-ares-critical/40 hover:border-ares-critical' 
                      : 'bg-ares-amber/10 border-ares-amber/40 hover:border-ares-amber'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ares-text truncate">
                      {fac?.name || req.facilityId}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                      isCrit ? 'bg-ares-critical/20 text-ares-critical' : 'bg-ares-amber/20 text-ares-amber'
                    }`}>
                      {req.urgency}
                    </span>
                  </div>

                  <div className="mt-1.5 text-xs font-mono text-ares-subtext flex items-center justify-between">
                    <span>{req.requestedQuantity} units of {req.resourceId}</span>
                    <span className="text-[10px] text-ares-muted">Allocated: {req.allocatedQuantity}</span>
                  </div>

                  {req.reason && (
                    <div className="mt-1 text-[10px] text-ares-muted truncate">
                      {req.reason}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
