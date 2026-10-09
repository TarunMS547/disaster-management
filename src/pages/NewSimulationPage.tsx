import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Settings, 
  RotateCcw, 
  Compass, 
  Building2, 
  Truck, 
  ShieldAlert, 
  Zap,
  Info
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { SEEDED_SCENARIOS } from '../simulation/scenarios';
import { ScenarioDefinition } from '../types/simulation';

export const NewSimulationPage: React.FC = () => {
  const { switchScenario } = useSimulation();
  const navigate = useNavigate();

  const [selectedKey, setSelectedKey] = useState<ScenarioDefinition['key']>('urban_flood');
  const [customSeed, setCustomSeed] = useState<number>(SEEDED_SCENARIOS.urban_flood.initialSeed);

  const scenario = SEEDED_SCENARIOS[selectedKey];

  const handleSelectScenario = (key: ScenarioDefinition['key']) => {
    setSelectedKey(key);
    setCustomSeed(SEEDED_SCENARIOS[key].initialSeed);
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    switchScenario(selectedKey, customSeed);
    navigate('/app/simulations/active');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6 select-none font-mono">
      <div className="border-b border-ares-border pb-4">
        <h1 className="text-xl font-bold uppercase text-ares-text">
          Configure New Disaster Scenario
        </h1>
        <p className="text-xs text-ares-subtext mt-1">
          Select initial crisis topology and deterministic PRNG seed parameters.
        </p>
      </div>

      <form onSubmit={handleLaunch} className="space-y-6">
        {/* Scenario Selection Grid */}
        <div className="space-y-3">
          <label className="text-xs uppercase text-ares-subtext font-bold">1. Select Scenario Blueprint</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(SEEDED_SCENARIOS).map(scen => {
              const isSelected = selectedKey === scen.key;
              return (
                <div
                  key={scen.key}
                  onClick={() => handleSelectScenario(scen.key)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-ares-accent bg-ares-accentMuted shadow-glow-cyan'
                      : 'border-ares-border bg-ares-surface hover:border-ares-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-ares-subtext">SCENARIO</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-ares-card border border-ares-border">
                      {scen.maxTicks} Ticks
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-ares-text mb-1">{scen.name}</h3>
                  <p className="text-xs text-ares-subtext leading-relaxed line-clamp-2">
                    {scen.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seed & PRNG Settings */}
        <div className="p-4 rounded-xl bg-ares-surface border border-ares-border space-y-4">
          <label className="text-xs uppercase text-ares-subtext font-bold block">
            2. Seed & Reproducibility Parameters
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-ares-muted block mb-1">
                Deterministic PRNG Seed (Integer)
              </label>
              <input
                type="number"
                value={customSeed}
                onChange={(e) => setCustomSeed(parseInt(e.target.value) || 0)}
                className="w-full bg-ares-card border border-ares-border rounded-lg p-2.5 text-ares-text focus:outline-none focus:border-ares-accent font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] text-ares-muted block mb-1">
                Max Simulation Horizon
              </label>
              <input
                type="text"
                disabled
                value={`${scenario.maxTicks} Simulation Ticks (~${Math.round((scenario.maxTicks * scenario.tickIntervalMs) / 1000)}s)`}
                className="w-full bg-ares-card/50 border border-ares-border rounded-lg p-2.5 text-ares-subtext font-mono text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-ares-card border border-ares-border/80 flex items-start gap-2.5 text-xs text-ares-subtext">
            <Info className="w-4 h-4 text-ares-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Every simulation tick runs deterministically with Mulberry32 PRNG. The same seed and incident sequence will produce the exact identical trajectory, allowing fair mathematical comparison against baseline logistics.
            </p>
          </div>
        </div>

        {/* Blueprint Breakdown */}
        <div className="p-4 rounded-xl bg-ares-surface border border-ares-border space-y-3">
          <div className="text-xs uppercase text-ares-subtext font-bold">
            3. Initial Topology Breakdown
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-ares-card border border-ares-border">
              <div className="text-xs text-ares-muted">FACILITIES</div>
              <div className="text-lg font-bold text-ares-text">{scenario.facilities.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-ares-card border border-ares-border">
              <div className="text-xs text-ares-muted">LOGISTICS UNITS</div>
              <div className="text-lg font-bold text-ares-accent">{scenario.vehicles.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-ares-card border border-ares-border">
              <div className="text-xs text-ares-muted">ROAD NODES</div>
              <div className="text-lg font-bold text-ares-text">{scenario.roadNodes.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-ares-card border border-ares-border">
              <div className="text-xs text-ares-muted">SCHEDULED EVENTS</div>
              <div className="text-lg font-bold text-ares-critical">{scenario.eventSchedule.length}</div>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            id="btn-confirm-launch"
            className="px-6 py-3 rounded-xl bg-ares-accent hover:bg-ares-accent/80 text-ares-bg font-bold text-xs shadow-glow-cyan flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>INITIALIZE & LAUNCH TWIN</span>
          </button>
        </div>
      </form>
    </div>
  );
};
