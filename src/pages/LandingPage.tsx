import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Compass, 
  Activity, 
  ArrowRight, 
  Layers, 
  Network, 
  CheckCircle2 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ares-bg text-ares-text cyber-grid flex flex-col justify-between select-none">
      {/* Top Navbar */}
      <nav className="h-18 border-b border-ares-border bg-ares-surface/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-ares-accent fill-ares-accent" />
          <span className="font-mono font-extrabold text-xl tracking-wider">ARES</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ares-accent/10 text-ares-accent border border-ares-accent/30 font-bold">
            DIGITAL TWIN
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/app"
            className="px-4 py-2 rounded-lg bg-ares-accent hover:bg-ares-accent/80 text-ares-bg font-mono font-bold text-xs transition-all shadow-glow-cyan flex items-center gap-2"
          >
            <span>LAUNCH OPERATIONS CENTER</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col items-center text-center justify-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ares-card border border-ares-border text-xs font-mono text-ares-subtext">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AUTONOMOUS RESILIENCE & EMERGENCY PLATFORM</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-mono max-w-4xl leading-tight">
          Multi-Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Digital Twin</span> for Disaster Resource Logistics
        </h1>

        <p className="text-base md:text-lg text-ares-subtext max-w-2xl leading-relaxed">
          Coordinate scarce medical supplies, drinking water, and rations across hospitals and shelters. Five bounded autonomous agents dynamically optimize allocations and reroute convoys as floods expand and bridges collapse.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            id="btn-hero-launch"
            to="/app/simulations/active"
            className="px-6 py-3.5 rounded-xl bg-ares-accent hover:bg-ares-accent/80 text-ares-bg font-mono font-bold text-sm transition-all shadow-glow-cyan flex items-center gap-2"
          >
            <span>LAUNCH 3D LIVE SIMULATION</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/app/simulations/new"
            className="px-6 py-3.5 rounded-xl bg-ares-card hover:bg-ares-border border border-ares-border text-ares-text font-mono font-bold text-sm transition-all flex items-center gap-2"
          >
            <span>CONFIGURE NEW SCENARIO</span>
          </Link>
        </div>

        {/* Live Disaster Simulation Quick Select Strip */}
        <div className="w-full max-w-4xl p-5 rounded-2xl bg-ares-surface/90 border border-ares-border space-y-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-ares-border pb-2">
            <span className="text-xs font-mono font-bold uppercase text-ares-text flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ares-critical animate-ping" />
              <span>Simulate Real-Time Catastrophes (Select Any Disaster To Run)</span>
            </span>
            <span className="text-[10px] font-mono text-ares-muted">7 ACTIVE DISASTER MODULES</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-left">
            <Link
              to="/app/simulations/active"
              className="p-3 rounded-xl bg-ares-card border border-sky-500/30 hover:border-sky-400 hover:bg-sky-950/20 transition-all flex flex-col items-center text-center gap-1.5 group"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">🌊</span>
              <span className="text-xs font-mono font-bold text-sky-400">Flood Surge</span>
              <span className="text-[10px] font-mono text-ares-muted">River Overflow</span>
            </Link>

            <Link
              to="/app/simulations/active"
              className="p-3 rounded-xl bg-ares-card border border-orange-500/30 hover:border-orange-400 hover:bg-orange-950/20 transition-all flex flex-col items-center text-center gap-1.5 group"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">💥</span>
              <span className="text-xs font-mono font-bold text-orange-400">Earthquake</span>
              <span className="text-[10px] font-mono text-ares-muted">Mag 7.8 Rupture</span>
            </Link>

            <Link
              to="/app/simulations/active"
              className="p-3 rounded-xl bg-ares-card border border-amber-600/30 hover:border-amber-400 hover:bg-amber-950/20 transition-all flex flex-col items-center text-center gap-1.5 group"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">⛰️</span>
              <span className="text-xs font-mono font-bold text-amber-400">Landslide</span>
              <span className="text-[10px] font-mono text-ares-muted">Mud Avalanche</span>
            </Link>

            <Link
              to="/app/simulations/active"
              className="p-3 rounded-xl bg-ares-card border border-purple-500/30 hover:border-purple-400 hover:bg-purple-950/20 transition-all flex flex-col items-center text-center gap-1.5 group"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">❄️</span>
              <span className="text-xs font-mono font-bold text-purple-400">Blizzard Gale</span>
              <span className="text-[10px] font-mono text-ares-muted">Weather Freeze</span>
            </Link>

            <Link
              to="/app/simulations/active"
              className="p-3 rounded-xl bg-ares-card border border-lime-500/30 hover:border-lime-400 hover:bg-lime-950/20 transition-all flex flex-col items-center text-center gap-1.5 group"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">🧪</span>
              <span className="text-xs font-mono font-bold text-lime-400">Acid Rain</span>
              <span className="text-[10px] font-mono text-ares-muted">Chemical Smog</span>
            </Link>

            <Link
              to="/app/simulations/active"
              className="p-3 rounded-xl bg-ares-card border border-rose-500/30 hover:border-rose-400 hover:bg-rose-950/20 transition-all flex flex-col items-center text-center gap-1.5 group"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">🛰️</span>
              <span className="text-xs font-mono font-bold text-rose-400">Satellite Fall</span>
              <span className="text-[10px] font-mono text-ares-muted">Kinetic + EMP</span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16 text-left">
          <div className="p-6 rounded-2xl bg-ares-surface/80 border border-ares-border hover:border-ares-accent/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-ares-accent">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-mono font-bold text-ares-text uppercase">5 Bounded Autonomous Agents</h3>
            <p className="text-xs text-ares-subtext leading-relaxed">
              Disaster Coordinator, Hospital, Shelter, Logistics, and Marketplace agents arbitrate conflicts and enforce mathematical invariant guarantees without hallucinatory drift.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-ares-surface/80 border border-ares-border hover:border-ares-accent/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-mono font-bold text-ares-text uppercase">3D Synthetic Digital Twin</h3>
            <p className="text-xs text-ares-subtext leading-relaxed">
              Interactive WebGL city canvas tracking facility inventories, dynamic hazard zones, moving logistics units, and road graph chokepoints with accessible 2D fallback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-ares-surface/80 border border-ares-border hover:border-ares-accent/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-mono font-bold text-ares-text uppercase">Fair Baseline Comparison</h3>
            <p className="text-xs text-ares-subtext leading-relaxed">
              Empirical side-by-side benchmarking against First-Come-First-Served policies on identical seeds, computing critical fulfillment %, latency, and Jain&apos;s fairness index.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 border-t border-ares-border px-6 flex items-center justify-between text-xs font-mono text-ares-muted">
        <div>ARES — Autonomous Resilience & Emergency Operations Digital Twin</div>
        <div>STRICT INVARIANTS • SEEDED REPRODUCIBILITY</div>
      </footer>
    </div>
  );
};
