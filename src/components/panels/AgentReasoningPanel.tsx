import React from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  Calculator, 
  Bot 
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const AgentReasoningPanel: React.FC = () => {
  const { state } = useSimulation();
  const recentDecisions = state.decisions.slice(-6).reverse();

  return (
    <div className="bg-ares-card/90 border border-ares-border rounded-xl p-4 space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-ares-border pb-2.5">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-ares-accent animate-pulse" />
          <h3 className="font-bold uppercase tracking-wider text-ares-text">
            Autonomous Agent Decision Pipeline
          </h3>
        </div>
        <span className="text-[10px] text-ares-muted">
          5 BOUNDED ROLES ACTIVE
        </span>
      </div>

      {recentDecisions.length === 0 ? (
        <div className="p-4 text-center text-ares-muted text-xs border border-dashed border-ares-border rounded-lg">
          Agents monitoring simulation state. Actions will register as shortages or road closures occur.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {recentDecisions.map(dec => {
            const isValid = dec.validationStatus === 'valid';
            const roleColor = 
              dec.agentRole === 'disaster_coordinator' ? 'text-ares-accent' :
              dec.agentRole === 'hospital_agent' ? 'text-ares-critical' :
              dec.agentRole === 'shelter_agent' ? 'text-ares-success' :
              dec.agentRole === 'logistics_agent' ? 'text-ares-blue' : 'text-ares-amber';

            return (
              <div 
                key={dec.id} 
                className="p-3 rounded-lg bg-ares-surface border border-ares-border/80 space-y-1.5 transition-all hover:border-ares-accent/40"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-[11px] uppercase ${roleColor}`}>
                    {dec.agentName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-ares-muted">TICK {dec.tick}</span>
                    {isValid ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                        <XCircle className="w-3 h-3" /> {dec.validationStatus.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-ares-text font-semibold text-xs">
                  {dec.summary}
                </div>

                <div className="text-[11px] text-ares-subtext leading-relaxed bg-ares-card/60 p-2 rounded border border-ares-border/40">
                  <span className="text-ares-muted uppercase text-[9px] block mb-0.5">Decision Rationale:</span>
                  {dec.rationale}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
