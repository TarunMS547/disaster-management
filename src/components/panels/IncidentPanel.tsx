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
  const { state, selectEntity, triggerUserIncident } = useSimulation();

  // Aggregate stats
  const totalPopulationAtRisk = state.facilities.reduce((sum, f) => sum + f.population, 0);
  const criticalRequests = state.requests.filter(
    r => (r.urgency === 'critical' || r.urgency === 'high') && r.status !== 'fulfilled'
  );
  const activeIncidents = state.incidents.filter(i => !i.resolved);

  return (
    <div className="w-full md:w-80 bg-ares-surface/95 border-r border-ares-border flex flex-col h-full overflow-hidden select-none">
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

        {/* Quick Launch Disaster Simulation Buttons */}
        <div className="space-y-1.5 p-3 rounded-xl bg-ares-card/60 border border-ares-border">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ares-subtext font-bold">
              ⚡ Quick Deploy Disasters
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => triggerUserIncident({
                type: 'flood_expansion',
                targetId: state.roadEdges[0]?.id || '',
                description: 'Flash river overflow inundating central artery'
              })}
              className="p-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/40 text-sky-400 text-[10px] font-mono font-bold flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
              title="Deploy Flood Surge"
            >
              <span className="text-sm">🌊</span>
              <span>Flood</span>
            </button>

            <button
              onClick={() => triggerUserIncident({
                type: 'earthquake',
                targetId: state.facilities[0]?.id || '',
                description: 'Magnitude 7.8 Richter earthquake rupture'
              })}
              className="p-1.5 rounded-lg bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/40 text-orange-400 text-[10px] font-mono font-bold flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
              title="Deploy Seismic Earthquake"
            >
              <span className="text-sm">💥</span>
              <span>Quake</span>
            </button>

            <button
              onClick={() => triggerUserIncident({
                type: 'landslide',
                targetId: state.roadEdges[1]?.id || state.roadEdges[0]?.id || '',
                description: 'Mountain mudslide blocking transit corridors'
              })}
              className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 text-amber-400 text-[10px] font-mono font-bold flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
              title="Deploy Mountain Landslide"
            >
              <span className="text-sm">⛰️</span>
              <span>Slide</span>
            </button>

            <button
              onClick={() => triggerUserIncident({
                type: 'weather_change',
                targetId: state.facilities[1]?.id || state.facilities[0]?.id || '',
                description: 'Arctic gale blizzard slowing fleet speed'
              })}
              className="p-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-400 text-[10px] font-mono font-bold flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
              title="Deploy Severe Storm"
            >
              <span className="text-sm">❄️</span>
              <span>Storm</span>
            </button>

            <button
              onClick={() => triggerUserIncident({
                type: 'acid_rain',
                targetId: state.facilities[2]?.id || state.facilities[0]?.id || '',
                description: 'Corrosive chemical acid downpour'
              })}
              className="p-1.5 rounded-lg bg-lime-950/40 hover:bg-lime-900/60 border border-lime-500/40 text-lime-400 text-[10px] font-mono font-bold flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
              title="Deploy Acid Rain"
            >
              <span className="text-sm">🧪</span>
              <span>Acid Rain</span>
            </button>

            <button
              onClick={() => triggerUserIncident({
                type: 'satellite_fall',
                targetId: state.facilities[0]?.id || '',
                description: 'Orbital satellite kinetic impact & EMP burst'
              })}
              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-400 text-[10px] font-mono font-bold flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
              title="Deploy Satellite Impact"
            >
              <span className="text-sm">🛰️</span>
              <span>Satellite</span>
            </button>
          </div>
        </div>

        {/* Active Disaster Incidents */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ares-subtext font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-ares-amber" />
            <span>Active Incidents ({activeIncidents.length})</span>
          </div>

          {activeIncidents.length === 0 ? (
            <div className="p-3 rounded-lg bg-ares-card/40 border border-dashed border-ares-border text-center text-xs text-ares-muted font-mono">
              No active disaster breaches reported.
            </div>
          ) : (
            activeIncidents.map(inc => {
              let tagColor = 'border-ares-critical/40 bg-ares-critical/10 text-ares-critical';
              let badgeLabel = 'HAZARD';

              if (inc.type === 'flood_expansion') {
                tagColor = 'border-sky-500/40 bg-sky-950/30 text-sky-400';
                badgeLabel = 'FLOOD';
              } else if (inc.type === 'earthquake') {
                tagColor = 'border-orange-500/40 bg-orange-950/30 text-orange-400';
                badgeLabel = 'QUAKE';
              } else if (inc.type === 'landslide') {
                tagColor = 'border-amber-600/40 bg-amber-950/30 text-amber-400';
                badgeLabel = 'SLIDE';
              } else if (inc.type === 'weather_change') {
                tagColor = 'border-purple-500/40 bg-purple-950/30 text-purple-400';
                badgeLabel = 'STORM';
              } else if (inc.type === 'acid_rain') {
                tagColor = 'border-lime-500/40 bg-lime-950/30 text-lime-400';
                badgeLabel = 'ACID';
              } else if (inc.type === 'satellite_fall') {
                tagColor = 'border-rose-600/40 bg-rose-950/30 text-rose-400';
                badgeLabel = 'ORBITAL';
              }

              return (
                <div
                  key={inc.id}
                  className={`p-3 rounded-lg border space-y-1.5 shadow-sm transition-all ${tagColor}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">
                      {inc.name}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-current font-bold">
                      {badgeLabel} • {inc.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-ares-subtext leading-relaxed">
                    {inc.description}
                  </p>
                  <div className="text-[10px] font-mono text-ares-muted flex items-center justify-between pt-1 border-t border-current/20">
                    <span>START: TICK {inc.startTick}</span>
                    <span>RAD: {inc.radius}m</span>
                  </div>
                </div>
              );
            })
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
