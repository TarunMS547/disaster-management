import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Compass, 
  ScrollText, 
  LineChart, 
  Package, 
  Settings 
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const SideRail: React.FC = () => {
  const { state } = useSimulation();
  const { simulationId } = useParams<{ simulationId: string }>();
  const activeSimId = simulationId || state.id;

  const navItems = [
    { to: '/app', icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard' },
    { to: '/app/simulations/new', icon: PlusCircle, label: 'New Scenario', id: 'nav-new-sim' },
    { to: `/app/simulations/${activeSimId}`, icon: Compass, label: 'Live Twin', id: 'nav-live-sim' },
    { to: `/app/simulations/${activeSimId}/events`, icon: ScrollText, label: 'Decisions Log', id: 'nav-events' },
    { to: `/app/simulations/${activeSimId}/analytics`, icon: LineChart, label: 'Analytics', id: 'nav-analytics' },
    { to: '/app/resources', icon: Package, label: 'Resources', id: 'nav-resources' },
    { to: '/app/settings', icon: Settings, label: 'Settings', id: 'nav-settings' },
  ];

  return (
    <aside className="w-16 md:w-56 bg-ares-surface border-r border-ares-border flex flex-col justify-between py-4 select-none shrink-0 z-20">
      <div className="space-y-1 px-2">
        <div className="hidden md:block px-3 py-2 text-[10px] font-mono uppercase text-ares-muted tracking-wider">
          Operations
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.id}
            id={item.id}
            to={item.to}
            end={item.to === '/app' || item.to === '/app/simulations/new'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all
              ${isActive 
                ? 'bg-ares-accent/15 text-ares-accent border border-ares-accent/30 shadow-glow-cyan' 
                : 'text-ares-subtext hover:bg-ares-card hover:text-ares-text'}
            `}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Mini status indicator at bottom */}
      <div className="hidden md:block px-4 py-3 mx-2 rounded-lg bg-ares-card border border-ares-border text-[11px] font-mono space-y-1">
        <div className="text-ares-muted">ACTIVE PROTOCOL</div>
        <div className="text-ares-accent font-bold truncate">{state.scenarioKey.toUpperCase()}</div>
        <div className="text-[10px] text-ares-subtext">SEED: {state.seed}</div>
      </div>
    </aside>
  );
};
