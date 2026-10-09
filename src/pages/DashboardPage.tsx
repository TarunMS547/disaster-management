import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Play, 
  Clock, 
  RotateCcw, 
  ShieldAlert, 
  Activity, 
  Flame, 
  CheckCircle, 
  ArrowRight,
  Database
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { SEEDED_SCENARIOS } from '../simulation/scenarios';
import { StorageService, SavedSimulationSummary } from '../services/storage';
import { useARESAuth } from '../context/AuthContext';
import { ScenarioDefinition } from '../types/simulation';

export const DashboardPage: React.FC = () => {
  const { switchScenario, state } = useSimulation();
  const { userId, getToken } = useARESAuth();
  const navigate = useNavigate();

  const [savedRuns, setSavedRuns] = useState<SavedSimulationSummary[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchRuns() {
      const token = await getToken();
      const runs = await StorageService.listSimulations(userId, token);
      if (mounted) {
        setSavedRuns(runs);
        setLoadingRuns(false);
      }
    }
    fetchRuns();
    return () => { mounted = false; };
  }, [userId, getToken]);

  const handleLaunchScenario = (key: ScenarioDefinition['key']) => {
    switchScenario(key);
    navigate(`/app/simulations/active`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ares-border pb-6">
        <div>
          <h1 className="text-2xl font-mono font-bold text-ares-text uppercase">
            Operations Command Dashboard
          </h1>
          <p className="text-xs text-ares-subtext font-mono mt-1">
            Autonomous Digital Twin Orchestrator • Workspace Node: {userId}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/simulations/new"
            className="px-4 py-2 rounded-lg bg-ares-accent hover:bg-ares-accent/80 text-ares-bg font-mono font-bold text-xs transition-all shadow-glow-cyan flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>NEW SCENARIO SETUP</span>
          </Link>
          <Link
            to="/app/simulations/active"
            className="px-4 py-2 rounded-lg bg-ares-card hover:bg-ares-border border border-ares-border text-ares-text font-mono font-bold text-xs transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 text-ares-accent" />
            <span>OPEN CURRENT TWIN</span>
          </Link>
        </div>
      </div>

      {/* Seeded Scenarios Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold text-ares-text uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-ares-accent" />
            <span>Standard Pre-Configured Scenarios</span>
          </h2>
          <span className="text-xs text-ares-muted font-mono">DETERMINISTIC BENCHMARKS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(SEEDED_SCENARIOS).map(scenario => {
            const isFlood = scenario.key === 'urban_flood';
            const isShortage = scenario.key === 'hospital_shortage';
            const accentBorder = isFlood ? 'hover:border-cyan-400' : isShortage ? 'hover:border-rose-400' : 'hover:border-amber-400';

            return (
              <div
                key={scenario.key}
                className={`p-5 rounded-xl bg-ares-surface border border-ares-border ${accentBorder} transition-all space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-ares-card text-ares-subtext border border-ares-border">
                      SEED: {scenario.initialSeed}
                    </span>
                    <span className="text-xs font-mono text-ares-muted">
                      {scenario.maxTicks} Ticks
                    </span>
                  </div>

                  <h3 className="font-mono font-bold text-sm text-ares-text">
                    {scenario.name}
                  </h3>

                  <p className="text-xs text-ares-subtext leading-relaxed line-clamp-3">
                    {scenario.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-ares-border">
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-ares-subtext">
                    <div>Facilities: {scenario.facilities.length}</div>
                    <div>Vehicles: {scenario.vehicles.length}</div>
                    <div>Road Nodes: {scenario.roadNodes.length}</div>
                    <div>Incidents: {scenario.eventSchedule.length}</div>
                  </div>

                  <button
                    onClick={() => handleLaunchScenario(scenario.key)}
                    className="w-full py-2.5 rounded-lg bg-ares-card hover:bg-ares-border border border-ares-border text-ares-text hover:text-ares-accent font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 text-ares-accent fill-ares-accent" />
                    <span>LAUNCH SIMULATION</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Simulation Runs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold text-ares-text uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-ares-subtext" />
            <span>Recent Workspace Runs</span>
          </h2>
          <span className="text-xs text-ares-muted font-mono">
            {savedRuns.length} SAVED RUNS
          </span>
        </div>

        {loadingRuns ? (
          <div className="p-8 text-center text-xs font-mono text-ares-muted">
            Loading simulation records from storage...
          </div>
        ) : savedRuns.length === 0 ? (
          <div className="p-8 rounded-xl bg-ares-surface border border-dashed border-ares-border text-center space-y-2">
            <Database className="w-8 h-8 text-ares-muted mx-auto" />
            <p className="text-xs text-ares-subtext font-mono">No persisted simulation runs found in this workspace.</p>
            <p className="text-[11px] text-ares-muted font-mono">Launch a scenario above and click Save to record run snapshots.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedRuns.map(run => (
              <div
                key={run.id}
                className="p-4 rounded-xl bg-ares-surface border border-ares-border hover:border-ares-accent/40 transition-all flex items-center justify-between font-mono"
              >
                <div>
                  <div className="font-bold text-xs text-ares-text truncate">{run.name}</div>
                  <div className="text-[10px] text-ares-subtext mt-0.5">
                    Tick: {run.currentTick} • Seed: {run.seed} • Critical Fulfilled: {run.criticalDemandPercent}%
                  </div>
                </div>

                <Link
                  to={`/app/simulations/${run.id}`}
                  className="px-3 py-1.5 rounded-lg bg-ares-card hover:bg-ares-border border border-ares-border text-xs text-ares-accent flex items-center gap-1.5"
                >
                  <span>RESUME</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
