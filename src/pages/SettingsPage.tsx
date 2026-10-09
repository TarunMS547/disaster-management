import React from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Trash2,
  ExternalLink 
} from 'lucide-react';
import { 
  isClerkConfigured, 
  isSupabaseConfigured, 
  CLERK_KEY, 
  SUPABASE_URL 
} from '../services/supabase';
import { useARESAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';

export const SettingsPage: React.FC = () => {
  const { userId, userEmail, userName, isMockMode } = useARESAuth();
  const { viewMode, setViewMode } = useSimulation();

  const handleClearLocalData = () => {
    if (confirm('Are you sure you want to clear locally cached simulation snapshots?')) {
      localStorage.removeItem('ares_simulations_v1');
      alert('Local storage cache purged.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6 select-none font-mono text-xs">
      <div className="border-b border-ares-border pb-4">
        <h1 className="text-xl font-bold uppercase text-ares-text flex items-center gap-2">
          <Settings className="w-5 h-5 text-ares-accent" />
          <span>System & Workspace Configuration</span>
        </h1>
        <p className="text-xs text-ares-subtext mt-1">
          Verify authentication providers, database replication, and rendering engine preferences.
        </p>
      </div>

      {/* Operator Identity Card */}
      <div className="p-5 rounded-xl bg-ares-surface border border-ares-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase text-ares-text flex items-center gap-2">
            <Shield className="w-4 h-4 text-ares-accent" />
            <span>Authenticated Operator Profile</span>
          </h2>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isMockMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}>
            {isMockMode ? 'LOCAL MOCK SESSION' : 'VERIFIED CLERK USER'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-ares-card border border-ares-border">
            <div className="text-[10px] text-ares-muted uppercase">OPERATOR NAME</div>
            <div className="font-bold text-ares-text mt-0.5 truncate">{userName}</div>
          </div>
          <div className="p-3 rounded-lg bg-ares-card border border-ares-border">
            <div className="text-[10px] text-ares-muted uppercase">USER ID</div>
            <div className="font-bold text-ares-text mt-0.5 truncate">{userId}</div>
          </div>
          <div className="p-3 rounded-lg bg-ares-card border border-ares-border">
            <div className="text-[10px] text-ares-muted uppercase">COMM LINK EMAIL</div>
            <div className="font-bold text-ares-text mt-0.5 truncate">{userEmail}</div>
          </div>
        </div>
      </div>

      {/* External Cloud Services Diagnostics */}
      <div className="p-5 rounded-xl bg-ares-surface border border-ares-border space-y-4">
        <h2 className="text-sm font-bold uppercase text-ares-text flex items-center gap-2">
          <Key className="w-4 h-4 text-ares-accent" />
          <span>Cloud Infrastructure Integration Health</span>
        </h2>

        <div className="space-y-3">
          {/* Clerk Auth Diagnostic */}
          <div className="p-4 rounded-lg bg-ares-card border border-ares-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ares-text">Clerk Authentication Service</span>
                {isClerkConfigured ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> LIVE CONNECTED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" /> OFFLINE FALLBACK MODE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ares-subtext mt-1">
                {isClerkConfigured 
                  ? 'Active Clerk React SDK with enterprise JWT session verification.' 
                  : 'VITE_CLERK_PUBLISHABLE_KEY is unset. Running zero-crash local workspace session.'}
              </p>
            </div>
          </div>

          {/* Supabase PostgreSQL Diagnostic */}
          <div className="p-4 rounded-lg bg-ares-card border border-ares-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ares-text">Supabase PostgreSQL & Realtime</span>
                {isSupabaseConfigured ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED & RLS VERIFIED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-sky-400">
                    <Database className="w-3.5 h-3.5" /> LOCAL STORAGE PERSISTENCE ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ares-subtext mt-1">
                {isSupabaseConfigured 
                  ? `Connected to ${SUPABASE_URL} with row level security.` 
                  : 'VITE_SUPABASE_URL is unset. Simulation runs and snapshots are persisted safely to local browser storage.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rendering Engine Preferences */}
      <div className="p-5 rounded-xl bg-ares-surface border border-ares-border space-y-4">
        <h2 className="text-sm font-bold uppercase text-ares-text flex items-center gap-2">
          <Layers className="w-4 h-4 text-ares-accent" />
          <span>Viewport & Graphic Engine</span>
        </h2>

        <div className="flex items-center justify-between p-3 rounded-lg bg-ares-card border border-ares-border">
          <div>
            <div className="font-bold text-ares-text">Default Visualization Canvas</div>
            <div className="text-[11px] text-ares-subtext">Toggle between 3D WebGL Digital Twin and 2D Low-Motion Schematic</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded transition-all font-bold ${
                viewMode === '3d' ? 'bg-ares-accent text-ares-bg' : 'text-ares-subtext hover:text-ares-text'
              }`}
            >
              3D DIGITAL TWIN
            </button>
            <button
              onClick={() => setViewMode('osm')}
              className={`px-3 py-1.5 rounded transition-all font-bold ${
                viewMode === 'osm' ? 'bg-ares-accent text-ares-bg' : 'text-ares-subtext hover:text-ares-text'
              }`}
            >
              OPENSTREET MAP (OSM)
            </button>
            <button
              onClick={() => setViewMode('2d_fallback')}
              className={`px-3 py-1.5 rounded transition-all font-bold ${
                viewMode === '2d_fallback' ? 'bg-ares-accent text-ares-bg' : 'text-ares-subtext hover:text-ares-text'
              }`}
            >
              2D SCHEMATIC
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-ares-card border border-ares-border">
          <div>
            <div className="font-bold text-ares-text">Purge Local Simulation Cache</div>
            <div className="text-[11px] text-ares-subtext">Removes all locally stored scenario snapshots and run records</div>
          </div>
          <button
            onClick={handleClearLocalData}
            className="px-3 py-1.5 rounded bg-ares-critical/15 hover:bg-ares-critical/25 text-ares-critical border border-ares-critical/40 transition-colors flex items-center gap-1.5 font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>PURGE CACHE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
