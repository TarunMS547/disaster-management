import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Construction, 
  TrendingUp, 
  PowerOff, 
  Wrench,
  Waves,
  Activity,
  Mountain,
  CloudLightning,
  CloudRain,
  Satellite
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { Incident } from '../../types/simulation';

interface EventTriggerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventTriggerDialog: React.FC<EventTriggerDialogProps> = ({ isOpen, onClose }) => {
  const { state, triggerUserIncident } = useSimulation();

  const [eventType, setEventType] = useState<Incident['type']>('flood_expansion');
  const [targetId, setTargetId] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Update targetId default when eventType changes
  React.useEffect(() => {
    if (eventType === 'flood_expansion') {
      if (state.roadEdges[0]) {
        setTargetId(state.roadEdges[0].id);
        setDescription('Flash flood surge inundating arterial corridors and bridge crossings');
      }
    } else if (eventType === 'earthquake') {
      const fac = state.facilities.find(f => f.type === 'hospital') || state.facilities[0];
      if (fac) {
        setTargetId(fac.id);
        setDescription(`Magnitude 7.2 Richter seismic epicenter near ${fac.name}`);
      }
    } else if (eventType === 'landslide') {
      if (state.roadEdges[0]) {
        setTargetId(state.roadEdges[0].id);
        setDescription('Mountain slope destabilization and mudslide burying transit route');
      }
    } else if (eventType === 'weather_change') {
      const fac = state.facilities.find(f => f.type === 'shelter') || state.facilities[0];
      if (fac) {
        setTargetId(fac.id);
        setDescription('Severe blizzard & sub-zero gale storm reducing fleet speed and spiking heating demand');
      }
    } else if (eventType === 'acid_rain') {
      const wh = state.facilities.find(f => f.type === 'warehouse') || state.facilities[0];
      if (wh) {
        setTargetId(wh.id);
        setDescription(`Industrial chemical smog producing corrosive acid precipitation near ${wh.name}`);
      }
    } else if (eventType === 'satellite_fall') {
      const fac = state.facilities[0];
      if (fac) {
        setTargetId(fac.id);
        setDescription(`De-orbited defunct satellite kinetic crash and high-energy EMP shockwave`);
      }
    } else if (eventType === 'road_closure' && state.roadEdges[0]) {
      setTargetId(state.roadEdges[0].id);
      setDescription(`Manual incident: Road corridor toggle`);
    } else if (eventType === 'warehouse_outage') {
      const wh = state.facilities.find(f => f.type === 'warehouse') || state.facilities[0];
      if (wh) {
        setTargetId(wh.id);
        setDescription(`Manual grid failure at ${wh.name}`);
      }
    } else if (eventType === 'demand_spike') {
      const hosp = state.facilities.find(f => f.type === 'hospital') || state.facilities[0];
      if (hosp) {
        setTargetId(hosp.id);
        setDescription(`Sudden mass influx at ${hosp.name}`);
      }
    } else if (eventType === 'vehicle_breakdown') {
      if (state.vehicles[0]) {
        setTargetId(state.vehicles[0].id);
        setDescription(`Vehicle mechanical breakdown: ${state.vehicles[0].name}`);
      }
    }
  }, [eventType, state.facilities, state.roadEdges, state.vehicles]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    triggerUserIncident({
      type: eventType,
      targetId,
      description: description || `User injected ${eventType}`,
    });

    onClose();
  };

  const disasterOptions = [
    { type: 'flood_expansion', label: 'Flash Flood', icon: Waves, color: 'text-sky-400', border: 'hover:border-sky-500' },
    { type: 'earthquake', label: 'Earthquake', icon: Activity, color: 'text-orange-500', border: 'hover:border-orange-500' },
    { type: 'landslide', label: 'Landslide', icon: Mountain, color: 'text-amber-600', border: 'hover:border-amber-600' },
    { type: 'weather_change', label: 'Extreme Storm', icon: CloudLightning, color: 'text-purple-400', border: 'hover:border-purple-500' },
    { type: 'acid_rain', label: 'Acid Rain', icon: CloudRain, color: 'text-lime-400', border: 'hover:border-lime-500' },
    { type: 'satellite_fall', label: 'Satellite Crash', icon: Satellite, color: 'text-rose-500', border: 'hover:border-rose-500' },
    { type: 'road_closure', label: 'Road Block', icon: Construction, color: 'text-yellow-400', border: 'hover:border-yellow-500' },
    { type: 'warehouse_outage', label: 'Depot Outage', icon: PowerOff, color: 'text-amber-400', border: 'hover:border-amber-500' },
    { type: 'demand_spike', label: 'Surge Influx', icon: TrendingUp, color: 'text-red-400', border: 'hover:border-red-500' },
    { type: 'vehicle_breakdown', label: 'Fleet Failure', icon: Wrench, color: 'text-blue-400', border: 'hover:border-blue-500' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-ares-surface border border-ares-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl font-mono text-xs max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-ares-border flex items-center justify-between bg-ares-card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-ares-critical" />
            <h3 className="font-bold text-ares-text text-sm uppercase">Inject Disaster Event</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-ares-border text-ares-subtext">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* Incident Type Selector */}
          <div>
            <label className="text-ares-subtext uppercase text-[10px] block mb-1.5 font-bold">Select Disaster / Hazard Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {disasterOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = eventType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setEventType(opt.type as Incident['type'])}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 text-left transition-all ${
                      isSelected
                        ? 'border-ares-accent bg-ares-accentMuted text-ares-text shadow-sm'
                        : `border-ares-border bg-ares-card text-ares-subtext ${opt.border}`
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${opt.color}`} />
                    <span className="truncate font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Entity Selector */}
          <div>
            <label className="text-ares-subtext uppercase text-[10px] block mb-1.5 font-bold">Target Zone / Epicenter Entity</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-ares-card border border-ares-border rounded-lg p-2.5 text-ares-text focus:outline-none focus:border-ares-accent"
            >
              {(eventType === 'road_closure' || eventType === 'landslide' || eventType === 'flood_expansion') && (
                <optgroup label="Road Corridors & Highways">
                  {state.roadEdges.map(edge => (
                    <option key={edge.id} value={edge.id}>
                      {edge.id}: {edge.fromNode} ↔ {edge.toNode} ({edge.status.toUpperCase()})
                    </option>
                  ))}
                </optgroup>
              )}

              {(eventType === 'earthquake' || eventType === 'satellite_fall' || eventType === 'acid_rain' || eventType === 'weather_change' || eventType === 'demand_spike' || eventType === 'warehouse_outage' || eventType === 'flood_expansion') && (
                <optgroup label="Civilian & Critical Facilities">
                  {state.facilities.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} [{fac.type.toUpperCase()}] ({fac.operationalStatus.toUpperCase()})
                    </option>
                  ))}
                </optgroup>
              )}

              {eventType === 'vehicle_breakdown' && (
                state.vehicles.map(veh => (
                  <option key={veh.id} value={veh.id}>
                    {veh.name} [{veh.type}] ({veh.status.toUpperCase()})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-ares-subtext uppercase text-[10px] block mb-1.5">Incident Rationale / Notes</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-ares-card border border-ares-border rounded-lg p-2.5 text-ares-text focus:outline-none focus:border-ares-accent"
            />
          </div>

          {/* Confirmation Alert */}
          <div className="p-3 rounded-lg bg-ares-amber/10 border border-ares-amber/30 text-[11px] text-ares-amber leading-relaxed">
            Injecting this disruption will force the Logistics and Marketplace agents to recalculate feasible routes and re-evaluate candidate resource allocations on the next simulation tick.
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-ares-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-ares-card hover:bg-ares-border text-ares-subtext transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-ares-critical hover:bg-ares-critical/80 text-white font-bold transition-colors"
            >
              Execute Disruption
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
