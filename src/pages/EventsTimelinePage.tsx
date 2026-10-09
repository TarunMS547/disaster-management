import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  ScrollText, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Bot, 
  ShieldAlert, 
  Truck, 
  Activity,
  Layers
} from 'lucide-react';
import { AgentRole } from '../types/simulation';

export const EventsTimelinePage: React.FC = () => {
  const { state } = useSimulation();

  const [activeTab, setActiveTab] = useState<'decisions' | 'events'>('decisions');
  const [selectedRole, setSelectedRole] = useState<AgentRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDecisions = state.decisions.filter(dec => {
    if (selectedRole !== 'all' && dec.agentRole !== selectedRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        dec.summary.toLowerCase().includes(q) ||
        dec.rationale.toLowerCase().includes(q) ||
        dec.agentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredEvents = state.events.filter(evt => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return evt.title.toLowerCase().includes(q) || evt.message.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none font-mono text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ares-border pb-4">
        <div>
          <h1 className="text-xl font-bold uppercase text-ares-text flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-ares-accent" />
            <span>Auditable Operations & Decision Log</span>
          </h1>
          <p className="text-xs text-ares-subtext mt-1">
            Deterministic record of agent actions, constraint verification proofs, and invariant states.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-ares-card rounded-lg border border-ares-border p-1">
          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-3 py-1.5 rounded transition-all font-bold ${
              activeTab === 'decisions' ? 'bg-ares-accent text-ares-bg' : 'text-ares-subtext hover:text-ares-text'
            }`}
          >
            AGENT DECISIONS ({state.decisions.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded transition-all font-bold ${
              activeTab === 'events' ? 'bg-ares-accent text-ares-bg' : 'text-ares-subtext hover:text-ares-text'
            }`}
          >
            SYSTEM EVENTS ({state.events.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-ares-muted" />
          <input
            type="text"
            placeholder="Search summaries, rationale, or parameters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ares-surface border border-ares-border rounded-lg pl-9 pr-4 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
          />
        </div>

        {activeTab === 'decisions' && (
          <div className="flex items-center gap-1 bg-ares-surface border border-ares-border rounded-lg p-1">
            <Filter className="w-3.5 h-3.5 text-ares-muted ml-2 mr-1" />
            {(['all', 'disaster_coordinator', 'hospital_agent', 'shelter_agent', 'logistics_agent', 'marketplace_agent'] as const).map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-2 py-1 rounded text-[11px] uppercase transition-colors ${
                  selectedRole === role ? 'bg-ares-card text-ares-accent font-bold' : 'text-ares-muted hover:text-ares-text'
                }`}
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Decisions Tab */}
      {activeTab === 'decisions' && (
        <div className="space-y-3">
          {filteredDecisions.length === 0 ? (
            <div className="p-8 text-center text-ares-muted bg-ares-surface rounded-xl border border-dashed border-ares-border">
              No matching agent decisions recorded in this simulation horizon.
            </div>
          ) : (
            filteredDecisions.map(dec => {
              const isValid = dec.validationStatus === 'valid';
              return (
                <div
                  key={dec.id}
                  className="p-4 rounded-xl bg-ares-surface border border-ares-border hover:border-ares-accent/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-ares-accent" />
                      <span className="font-bold text-ares-text uppercase">{dec.agentName}</span>
                      <span className="text-[10px] text-ares-muted bg-ares-card px-2 py-0.5 rounded border border-ares-border">
                        TICK {dec.tick}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isValid ? (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> INVARIANT VERIFIED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-bold">
                          <XCircle className="w-3.5 h-3.5" /> {dec.validationStatus.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-ares-text">
                    {dec.summary}
                  </div>

                  <div className="p-3 rounded-lg bg-ares-card border border-ares-border/60 text-ares-subtext leading-relaxed">
                    <span className="text-ares-muted block uppercase text-[10px] font-bold mb-1">Mathematical Rationale:</span>
                    {dec.rationale}
                  </div>

                  {dec.facts && Object.keys(dec.facts).length > 0 && (
                    <div className="text-[11px] text-ares-muted font-mono bg-ares-bg/50 p-2 rounded border border-ares-border/40">
                      <span className="text-ares-subtext font-bold">TELEMETRY FACTS: </span>
                      {JSON.stringify(dec.facts)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-2">
          {filteredEvents.map(evt => {
            const isCrit = evt.severity === 'critical';
            const isSuccess = evt.severity === 'success';

            return (
              <div
                key={evt.id}
                className="p-3.5 rounded-lg bg-ares-surface border border-ares-border flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 rounded bg-ares-card border border-ares-border text-ares-muted font-bold shrink-0">
                    TICK {evt.tick}
                  </span>
                  <div>
                    <div className={`font-bold ${
                      isCrit ? 'text-ares-critical' : isSuccess ? 'text-ares-success' : 'text-ares-text'
                    }`}>
                      {evt.title}
                    </div>
                    <div className="text-ares-subtext mt-0.5">
                      {evt.message}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-ares-muted shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
