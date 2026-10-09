import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  SimulationState, 
  ScenarioDefinition, 
  Incident
} from '../types/simulation';
import { SimulationEngine } from '../simulation/engine';
import { BaselineAllocationPolicy } from '../simulation/baseline';
import { StorageService } from '../services/storage';
import { useARESAuth } from './AuthContext';

export interface SelectedEntity {
  type: 'facility' | 'vehicle' | 'incident' | 'edge' | null;
  id: string | null;
}

export interface ComparisonResults {
  aresMetrics: SimulationState['metrics'];
  baselineMetrics: SimulationState['metrics'];
  running: boolean;
}

interface SimulationContextType {
  engine: SimulationEngine;
  state: SimulationState;
  selectedEntity: SelectedEntity;
  viewMode: '3d' | '2d_fallback';
  comparison: ComparisonResults | null;
  start: () => void;
  pause: () => void;
  step: () => void;
  reset: () => void;
  setSpeed: (mult: number) => void;
  switchScenario: (key: ScenarioDefinition['key'], seed?: number) => void;
  triggerUserIncident: (params: { type: Incident['type']; targetId: string; description: string }) => void;
  selectEntity: (type: SelectedEntity['type'], id: string | null) => void;
  setViewMode: (mode: '3d' | '2d_fallback') => void;
  runBaselineComparison: () => void;
  saveCurrentRun: () => Promise<boolean>;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, getToken } = useARESAuth();
  const [engine, setEngine] = useState<SimulationEngine>(() => new SimulationEngine('urban_flood'));
  const [state, setState] = useState<SimulationState>(() => engine.getState());
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>({ type: null, id: null });
  const [viewMode, setViewMode] = useState<'3d' | '2d_fallback'>('3d');
  const [comparison, setComparison] = useState<ComparisonResults | null>(null);

  useEffect(() => {
    const unsub = engine.subscribe(newState => {
      setState(newState);
    });
    return () => {
      unsub();
      engine.pause();
    };
  }, [engine]);

  const start = useCallback(() => engine.start(), [engine]);
  const pause = useCallback(() => engine.pause(), [engine]);
  const step = useCallback(() => engine.step(), [engine]);
  const reset = useCallback(() => {
    engine.reset();
    setComparison(null);
  }, [engine]);
  const setSpeed = useCallback((mult: number) => engine.setSpeed(mult), [engine]);

  const switchScenario = useCallback((key: ScenarioDefinition['key'], seed?: number) => {
    engine.pause();
    const newEngine = new SimulationEngine(key, seed);
    setEngine(newEngine);
    setState(newEngine.getState());
    setSelectedEntity({ type: null, id: null });
    setComparison(null);
  }, [engine]);

  const triggerUserIncident = useCallback((params: { type: Incident['type']; targetId: string; description: string }) => {
    engine.triggerUserIncident(params);
  }, [engine]);

  const selectEntity = useCallback((type: SelectedEntity['type'], id: string | null) => {
    setSelectedEntity({ type, id });
  }, []);

  const saveCurrentRun = useCallback(async () => {
    const token = await getToken();
    return StorageService.saveSimulation(state, userId, token);
  }, [state, userId, getToken]);

  const runBaselineComparison = useCallback(() => {
    // Run side-by-side baseline simulation on identical scenario and seed
    const baselineEngine = new SimulationEngine(state.scenarioKey, state.seed);
    const targetTicks = Math.max(state.currentTick, 25);

    // Fast-forward baseline with uncoordinated FCFS policy
    for (let t = 0; t < targetTicks; t++) {
      // Advance clock and incidents manually using Baseline policy
      const nextTick = baselineEngine.getState().currentTick + 1;
      baselineEngine.getState().currentTick = nextTick;

      // Generate proposals via Baseline policy instead of ARES Marketplace
      const baselineProposals = BaselineAllocationPolicy.generateBaselineProposals(
        baselineEngine.getState(),
        baselineEngine.getGraph()
      );

      // Advance baseline state
      baselineEngine.step();
    }

    setComparison({
      aresMetrics: state.metrics,
      baselineMetrics: baselineEngine.getState().metrics,
      running: false,
    });
  }, [state]);

  const value = useMemo(() => ({
    engine,
    state,
    selectedEntity,
    viewMode,
    comparison,
    start,
    pause,
    step,
    reset,
    setSpeed,
    switchScenario,
    triggerUserIncident,
    selectEntity,
    setViewMode,
    runBaselineComparison,
    saveCurrentRun,
  }), [
    engine,
    state,
    selectedEntity,
    viewMode,
    comparison,
    start,
    pause,
    step,
    reset,
    setSpeed,
    switchScenario,
    triggerUserIncident,
    selectEntity,
    setViewMode,
    runBaselineComparison,
    saveCurrentRun,
  ]);

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return ctx;
};
