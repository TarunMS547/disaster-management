import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Construction, 
  TrendingUp, 
  PowerOff, 
  Wrench 
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { Incident } from '../../types/simulation';

interface EventTriggerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventTriggerDialog: React.FC<EventTriggerDialogProps> = ({ isOpen, onClose }) => {
  const { state, triggerUserIncident } = useSimulation();

  const [eventType, setEventType] = useState<Incident['type']>('road_closure');
  const [targetId, setTargetId] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Update targetId default when eventType changes
  React.useEffect(() => {
    if (eventType === 'road_closure' && state.roadEdges[0]) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-ares-surface border border-ares-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl font-mono text-xs">
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Incident Type Selector */}
          <div>
            <label className="text-ares-subtext uppercase text-[10px] block mb-1.5">Intervention Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEventType('road_closure')}
                className={`p-2.5 rounded-lg border flex items-center gap-2 text-left transition-all ${
                  eventType === 'road_closure'
                    ? 'border-ares-accent bg-ares-accentMuted text-ares-text'
                    : 'border-ares-border bg-ares-card text-ares-subtext hover:border-ares-muted'
                }`}
              >
                <Construction className="w-4 h-4 text-ares-amber" />
                <span>Road Closure</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType('demand_spike')}
                className={`p-2.5 rounded-lg border flex items-center gap-2 text-left transition-all ${
                  eventType === 'demand_spike'
                    ? 'border-ares-accent bg-ares-accentMuted text-ares-text'
                    : 'border-ares-border bg-ares-card text-ares-subtext hover:border-ares-muted'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-ares-critical" />
                <span>Demand Surge</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType('warehouse_outage')}
                className={`p-2.5 rounded-lg border flex items-center gap-2 text-left transition-all ${
                  eventType === 'warehouse_outage'
                    ? 'border-ares-accent bg-ares-accentMuted text-ares-text'
                    : 'border-ares-border bg-ares-card text-ares-subtext hover:border-ares-muted'
                }`}
              >
                <PowerOff className="w-4 h-4 text-ares-amber" />
                <span>Depot Outage</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType('vehicle_breakdown')}
                className={`p-2.5 rounded-lg border flex items-center gap-2 text-left transition-all ${
                  eventType === 'vehicle_breakdown'
                    ? 'border-ares-accent bg-ares-accentMuted text-ares-text'
                    : 'border-ares-border bg-ares-card text-ares-subtext hover:border-ares-muted'
                }`}
              >
                <Wrench className="w-4 h-4 text-ares-blue" />
                <span>Vehicle Failure</span>
              </button>
            </div>
          </div>

          {/* Target Entity Selector */}
          <div>
            <label className="text-ares-subtext uppercase text-[10px] block mb-1.5">Target Entity</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-ares-card border border-ares-border rounded-lg p-2.5 text-ares-text focus:outline-none focus:border-ares-accent"
            >
              {eventType === 'road_closure' && (
                state.roadEdges.map(edge => (
                  <option key={edge.id} value={edge.id}>
                    {edge.id}: {edge.fromNode} ↔ {edge.toNode} ({edge.status.toUpperCase()})
                  </option>
                ))
              )}

              {(eventType === 'demand_spike' || eventType === 'warehouse_outage') && (
                state.facilities.map(fac => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} [{fac.type.toUpperCase()}] ({fac.operationalStatus.toUpperCase()})
                  </option>
                ))
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
