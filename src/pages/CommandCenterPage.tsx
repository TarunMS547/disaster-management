import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TopBar } from '../components/layout/TopBar';
import { IncidentPanel } from '../components/panels/IncidentPanel';
import { EntityDetailPanel } from '../components/panels/EntityDetailPanel';
import { AgentReasoningPanel } from '../components/panels/AgentReasoningPanel';
import { EventTriggerDialog } from '../components/panels/EventTriggerDialog';
import { DigitalTwinScene } from '../components/scene/DigitalTwinScene';
import { OpenStreetMapScene } from '../components/scene/OpenStreetMapScene';
import { Fallback2DMap } from '../components/scene/Fallback2DMap';
import { Bot, Layers } from 'lucide-react';

export const CommandCenterPage: React.FC = () => {
  const { viewMode } = useSimulation();
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [mobileTab, setMobileTab] = useState<'map' | 'threats' | 'telemetry'>('map');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-ares-bg">
      {/* Top Operations Bar */}
      <TopBar onOpenTriggerDialog={() => setIsTriggerOpen(true)} />

      {/* Mobile View Switcher Tab Bar (only visible on small screens < md) */}
      <div className="flex md:hidden bg-ares-card border-b border-ares-border font-mono text-xs">
        <button
          onClick={() => setMobileTab('threats')}
          className={`flex-1 py-2 text-center font-bold border-b-2 transition-all ${
            mobileTab === 'threats'
              ? 'border-ares-accent text-ares-accent bg-ares-accentMuted'
              : 'border-transparent text-ares-subtext'
          }`}
        >
          ⚡ Threats
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 text-center font-bold border-b-2 transition-all ${
            mobileTab === 'map'
              ? 'border-ares-accent text-ares-accent bg-ares-accentMuted'
              : 'border-transparent text-ares-subtext'
          }`}
        >
          🗺️ Live Map
        </button>
        <button
          onClick={() => setMobileTab('telemetry')}
          className={`flex-1 py-2 text-center font-bold border-b-2 transition-all ${
            mobileTab === 'telemetry'
              ? 'border-ares-accent text-ares-accent bg-ares-accentMuted'
              : 'border-transparent text-ares-subtext'
          }`}
        >
          📡 Telemetry
        </button>
      </div>

      {/* Main Operations Canvas (Responsive on Mobile) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Rail: Incident Severity & Requests (Hidden on mobile unless threats tab active) */}
        <div className={`${mobileTab === 'threats' ? 'flex flex-1 w-full' : 'hidden'} md:flex md:w-80 h-full`}>
          <IncidentPanel />
        </div>

        {/* Center: Interactive 3D Digital Twin, OpenStreetMap, or 2D Accessible Fallback */}
        <div className={`flex-1 relative flex flex-col overflow-hidden ${mobileTab === 'map' ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex-1 relative">
            {viewMode === '3d' ? (
              <DigitalTwinScene />
            ) : viewMode === 'osm' ? (
              <OpenStreetMapScene />
            ) : (
              <Fallback2DMap />
            )}

            {/* Floating Agent Reasoning Pipeline Drawer/Overlay */}
            <div className="absolute top-4 right-4 z-10 max-w-sm w-full">
              {showAgentPanel ? (
                <div className="relative">
                  <AgentReasoningPanel />
                  <button
                    onClick={() => setShowAgentPanel(false)}
                    className="absolute top-2 right-2 text-ares-muted hover:text-ares-text text-[10px] font-mono px-1.5 py-0.5 rounded bg-ares-border"
                  >
                    HIDE
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAgentPanel(true)}
                  className="px-3 py-1.5 rounded-lg bg-ares-card/90 border border-ares-border text-ares-accent font-mono text-xs flex items-center gap-1.5 shadow-lg backdrop-blur hover:bg-ares-border transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>SHOW AGENT LOGIC</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Facility / Vehicle Telemetry (Hidden on mobile unless telemetry tab active) */}
        <div className={`${mobileTab === 'telemetry' ? 'flex flex-1 w-full' : 'hidden'} md:flex md:w-88 h-full`}>
          <EntityDetailPanel />
        </div>
      </div>

      {/* Manual Disaster Intervention Dialog */}
      <EventTriggerDialog
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
      />
    </div>
  );
};
