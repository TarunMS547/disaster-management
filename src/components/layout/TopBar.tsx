import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Radio, 
  AlertTriangle, 
  Save, 
  Layers, 
  Zap,
  User,
  LogOut
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { useARESAuth } from '../../context/AuthContext';
import { isClerkConfigured, isSupabaseConfigured } from '../../services/supabase';

interface TopBarProps {
  onOpenTriggerDialog: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenTriggerDialog }) => {
  const { 
    state, 
    start, 
    pause, 
    step, 
    reset, 
    setSpeed, 
    switchScenario,
    viewMode, 
    setViewMode, 
    saveCurrentRun 
  } = useSimulation();

  const { userName, isMockMode, signOut, isSignedIn, signIn } = useARESAuth();
  const [saveStatus, setSaveStatus] = React.useState<string | null>(null);

  const handleSave = async () => {
    setSaveStatus('Saving...');
    const ok = await saveCurrentRun();
    setSaveStatus(ok ? 'Saved!' : 'Local Saved');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const isRunning = state.status === 'running';

  return (
    <header className="min-h-14 py-2 border-b border-ares-border bg-ares-surface/95 backdrop-blur-md px-3 md:px-4 flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
      {/* Brand & Scenario */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-ares-accent fill-ares-accent animate-pulse" />
            <div className="absolute inset-0 bg-ares-accent/20 blur-md rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-extrabold tracking-wider text-sm md:text-base text-ares-text">ARES</span>
              <span className="text-[9px] md:text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-ares-accent/15 text-ares-accent border border-ares-accent/30 font-bold">
                OPS v2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <select
                value={state.scenarioKey}
                onChange={(e) => switchScenario(e.target.value as any)}
                className="bg-ares-card border border-ares-border rounded px-1.5 py-0.5 text-[10px] md:text-[11px] font-mono text-ares-accent font-semibold focus:outline-none focus:border-ares-accent cursor-pointer hover:border-ares-accent/50 max-w-[130px] sm:max-w-[200px] truncate"
                title="Select Disaster Simulation Scenario"
              >
                <option value="urban_flood">🌊 Flood Expansion</option>
                <option value="earthquake_catastrophe">💥 Magnitude 7.8 Earthquake</option>
                <option value="landslide_avalanche">⛰️ Mountain Landslide</option>
                <option value="extreme_weather_blizzard">❄️ Blizzard & Gale Storm</option>
                <option value="acid_rain_fallout">🧪 Chemical Acid Rain</option>
                <option value="satellite_kinetic_impact">🛰️ Satellite Kinetic Impact</option>
                <option value="compound_apocalypse">🔥 Compound Mega-Disaster</option>
                <option value="hospital_shortage">🏥 Hospital Critical Shortage</option>
                <option value="compound_disruption">⚡ Multi-Hub Disruption</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuration indicators */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono pl-4 border-l border-ares-border">
          <span className={`px-2 py-0.5 rounded border ${isClerkConfigured ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
            {isClerkConfigured ? 'CLERK AUTH: CONNECTED' : 'CLERK: DEMO SESSION'}
          </span>
          <span className={`px-2 py-0.5 rounded border ${isSupabaseConfigured ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-sky-500/10 border-sky-500/30 text-sky-400'}`}>
            {isSupabaseConfigured ? 'SUPABASE RLS: ACTIVE' : 'STORAGE: LOCAL WORKSPACE'}
          </span>
        </div>
      </div>

      {/* Primary Simulation Controls */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        {/* Tick Clock Badge */}
        <div className="flex items-center gap-1.5 bg-ares-card px-2 md:px-3 py-1 rounded-lg border border-ares-border font-mono text-xs md:text-sm">
          <Radio className={`w-3 h-3 ${isRunning ? 'text-ares-accent animate-pulse' : 'text-ares-muted'}`} />
          <span className="text-ares-subtext hidden sm:inline">TICK:</span>
          <span className="text-ares-text font-bold text-xs md:text-base w-8 text-right">{state.currentTick}</span>
        </div>

        {/* Playback action group */}
        <div className="flex items-center bg-ares-card rounded-lg border border-ares-border p-0.5 gap-0.5">
          {isRunning ? (
            <button
              id="btn-pause-sim"
              onClick={pause}
              className="p-1.5 rounded hover:bg-ares-border text-ares-amber transition-colors flex items-center gap-1 px-2.5 text-xs font-mono font-semibold"
              title="Pause Simulation"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              id="btn-start-sim"
              onClick={start}
              className="p-1.5 rounded hover:bg-ares-accentMuted text-ares-accent transition-colors flex items-center gap-1 px-2.5 text-xs font-mono font-semibold"
              title="Start Simulation"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RUN</span>
            </button>
          )}

          <button
            id="btn-step-sim"
            onClick={step}
            className="p-1.5 rounded hover:bg-ares-border text-ares-text transition-colors flex items-center gap-1 px-2 text-xs font-mono"
            title="Step exactly 1 tick"
          >
            <StepForward className="w-4 h-4" />
            <span className="hidden sm:inline">STEP</span>
          </button>

          <button
            id="btn-reset-sim"
            onClick={reset}
            className="p-1.5 rounded hover:bg-ares-border text-ares-subtext hover:text-ares-critical transition-colors px-2 text-xs font-mono"
            title="Reset to Initial Seeded State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed selector */}
        <div className="hidden sm:flex items-center bg-ares-card rounded-lg border border-ares-border p-0.5 text-xs font-mono">
          {[1, 2, 5].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded transition-colors ${
                state.tickSpeedMultiplier === s
                  ? 'bg-ares-accent text-ares-bg font-bold'
                  : 'text-ares-subtext hover:text-ares-text'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Disaster Event Injection Button */}
        <button
          id="btn-trigger-event"
          onClick={onOpenTriggerDialog}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ares-critical/15 hover:bg-ares-critical/25 border border-ares-critical/40 text-ares-critical text-xs font-mono font-semibold transition-all shadow-glow-red"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden md:inline">INJECT DISASTER</span>
        </button>

        {/* 3D / OpenStreetMap / 2D Mode Switcher */}
        <div className="flex items-center bg-ares-card rounded-lg border border-ares-border p-0.5 text-xs font-mono">
          <button
            id="btn-mode-3d"
            onClick={() => setViewMode('3d')}
            className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1 ${
              viewMode === '3d'
                ? 'bg-ares-accent text-ares-bg shadow-glow-cyan'
                : 'text-ares-subtext hover:text-ares-text'
            }`}
            title="3D Digital Twin City Model"
          >
            <span>3D TWIN</span>
          </button>

          <button
            id="btn-mode-osm"
            onClick={() => setViewMode('osm')}
            className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1 ${
              viewMode === 'osm'
                ? 'bg-ares-accent text-ares-bg shadow-glow-cyan'
                : 'text-ares-subtext hover:text-ares-text'
            }`}
            title="Interactive OpenStreetMap (OSM)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OPENSTREET</span>
          </button>

          <button
            id="btn-mode-2d"
            onClick={() => setViewMode('2d_fallback')}
            className={`px-2 py-1 rounded transition-all font-bold hidden xl:inline-block ${
              viewMode === '2d_fallback'
                ? 'bg-ares-accent text-ares-bg shadow-glow-cyan'
                : 'text-ares-subtext hover:text-ares-text'
            }`}
            title="Accessible 2D Schematic"
          >
            <span>2D</span>
          </button>
        </div>

        {/* Save Run */}
        <button
          onClick={handleSave}
          className="p-2 rounded-lg bg-ares-card hover:bg-ares-border border border-ares-border text-ares-subtext hover:text-ares-accent transition-colors flex items-center gap-1 text-xs font-mono"
          title="Save run snapshot"
        >
          <Save className="w-4 h-4" />
          {saveStatus && <span className="text-[10px] text-ares-accent">{saveStatus}</span>}
        </button>
      </div>

      {/* User profile / session */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-xs font-semibold text-ares-text">{userName}</span>
          <span className="text-[10px] font-mono text-ares-subtext">
            {isMockMode ? 'MOCK COMMANDER' : 'VERIFIED CLERK OPERATOR'}
          </span>
        </div>

        {isSignedIn ? (
          <button
            onClick={signOut}
            className="p-2 rounded-lg bg-ares-card hover:bg-ares-border border border-ares-border text-ares-subtext hover:text-ares-critical transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={signIn}
            className="px-3 py-1.5 rounded-lg bg-ares-accent text-ares-bg text-xs font-mono font-bold hover:bg-ares-accent/80 transition-colors"
          >
            SIGN IN
          </button>
        )}
      </div>
    </header>
  );
};
