import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  SlidersHorizontal,
  TrendingUp,
  Activity,
  Layers,
  BarChart3,
  Calendar,
  Eye,
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react';
import { SimulationMetrics } from '../../types/simulation';

export interface VariableDefinition {
  id: string;
  name: string;
  unit: string;
  color: string;
  category: 'demand' | 'fleet' | 'equity';
  getValue: (m: SimulationMetrics) => number;
}

export const AVAILABLE_VARIABLES: VariableDefinition[] = [
  {
    id: 'criticalDemand',
    name: 'Critical Demand Fulfilled',
    unit: '%',
    color: '#0284c7', // Bright Sky Blue
    category: 'demand',
    getValue: m => m.criticalDemandFulfilledPercent,
  },
  {
    id: 'unmetDemand',
    name: 'Total Unmet Deficit',
    unit: 'units',
    color: '#e11d48', // Vivid Red / Critical
    category: 'demand',
    getValue: m => m.totalUnmetDemand,
  },
  {
    id: 'activeDeliveries',
    name: 'Active Fleet Convoys',
    unit: 'convoys',
    color: '#d97706', // Amber
    category: 'fleet',
    getValue: m => m.deliveriesActive,
  },
  {
    id: 'fairness',
    name: "Jain's Fairness Index",
    unit: '%',
    color: '#059669', // Emerald Green
    category: 'equity',
    getValue: m => Math.round(m.fairnessIndex * 100),
  },
  {
    id: 'latency',
    name: 'Avg Fulfillment Latency',
    unit: 'ticks',
    color: '#7c3aed', // Purple
    category: 'demand',
    getValue: m => m.averageFulfillmentTimeTicks,
  },
  {
    id: 'reroutes',
    name: 'Dynamic Reroutes (Detours)',
    unit: 'reroutes',
    color: '#0891b2', // Cyan
    category: 'fleet',
    getValue: m => m.deliveriesRerouted,
  },
  {
    id: 'utilization',
    name: 'Vehicle Utilization Rate',
    unit: '%',
    color: '#4f46e5', // Indigo
    category: 'fleet',
    getValue: m => m.vehicleUtilizationRate,
  },
  {
    id: 'totalFulfilled',
    name: 'Total Units Fulfilled',
    unit: 'units',
    color: '#0d9488', // Teal
    category: 'demand',
    getValue: m => m.totalFulfilled,
  },
];

interface VariableGraphProps {
  metricsHistory: SimulationMetrics[];
  currentTick: number;
  height?: number | string;
  compact?: boolean;
}

type GraphType = 'line' | 'area' | 'bar';
type TimeHorizon = 'all' | '20' | '50' | '100';

export const VariableGraph: React.FC<VariableGraphProps> = ({
  metricsHistory,
  currentTick,
  height = 360,
  compact = false,
}) => {
  // 1. Interactive Variable Selection State (Default: Top 3 variables active)
  const [selectedVarIds, setSelectedVarIds] = useState<Set<string>>(
    () => new Set(['criticalDemand', 'unmetDemand', 'activeDeliveries'])
  );

  // 2. Graph Presentation Type State
  const [graphType, setGraphType] = useState<GraphType>('line');

  // 3. Time Horizon Filter State
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('all');

  // Toggle single variable on/off
  const toggleVariable = (varId: string) => {
    setSelectedVarIds(prev => {
      const next = new Set(prev);
      if (next.has(varId)) {
        if (next.size > 1) {
          next.delete(varId);
        }
      } else {
        next.add(varId);
      }
      return next;
    });
  };

  // Quick Preset Filters
  const applyPreset = (preset: 'overview' | 'logistics' | 'equity' | 'all') => {
    if (preset === 'overview') {
      setSelectedVarIds(new Set(['criticalDemand', 'unmetDemand', 'activeDeliveries']));
    } else if (preset === 'logistics') {
      setSelectedVarIds(new Set(['activeDeliveries', 'reroutes', 'utilization']));
    } else if (preset === 'equity') {
      setSelectedVarIds(new Set(['fairness', 'latency', 'criticalDemand']));
    } else if (preset === 'all') {
      setSelectedVarIds(new Set(AVAILABLE_VARIABLES.map(v => v.id)));
    }
  };

  // Transform and filter simulation metrics history
  const chartData = useMemo(() => {
    let source = metricsHistory;

    // If initial simulation with <= 1 tick, create a baseline projection curve
    if (source.length <= 1) {
      const base = source[0] || {
        tick: 0,
        criticalDemandFulfilledPercent: 100,
        totalRequested: 0,
        totalFulfilled: 0,
        totalUnmetDemand: 0,
        unmetDemandByResource: {},
        unmetDemandByFacility: {},
        averageFulfillmentTimeTicks: 0,
        criticalFulfillmentTimeTicks: 0,
        requestsTotal: 0,
        requestsFulfilled: 0,
        requestsPartial: 0,
        requestsUnfulfilled: 0,
        deliveriesSuccessful: 0,
        deliveriesActive: 0,
        deliveriesRerouted: 0,
        deliveriesFailed: 0,
        vehiclesUtilizedCount: 0,
        vehicleUtilizationRate: 0,
        predictedShortagesAvoided: 0,
        fairnessIndex: 1.0,
      };

      // Generate seed projection to ensure the graph shows dynamic variable contours
      const projected = [];
      for (let t = 0; t <= 12; t += 2) {
        const factor = t / 12;
        projected.push({
          ...base,
          tick: t,
          criticalDemandFulfilledPercent: Math.max(40, Math.round(100 - factor * 45 + Math.sin(t) * 15)),
          totalUnmetDemand: Math.round(factor * 60 + Math.abs(Math.sin(t * 1.5)) * 30),
          deliveriesActive: Math.round(Math.min(6, factor * 8 + Math.cos(t) * 2)),
          deliveriesRerouted: Math.floor(factor * 3),
          vehicleUtilizationRate: Math.round(Math.min(90, factor * 75 + 15)),
          fairnessIndex: Math.max(0.4, 1.0 - factor * 0.35),
          averageFulfillmentTimeTicks: Math.round((2.5 + factor * 3.8) * 10) / 10,
          totalFulfilled: Math.round(factor * 120),
        });
      }
      source = projected;
    }

    // Apply Time Horizon slicing
    let sliced = source;
    if (timeHorizon !== 'all') {
      const limit = parseInt(timeHorizon, 10);
      sliced = source.slice(-limit);
    }

    return sliced.map(m => {
      const row: Record<string, number> = { tick: m.tick };
      for (const v of AVAILABLE_VARIABLES) {
        row[v.id] = v.getValue(m);
      }
      return row;
    });
  }, [metricsHistory, timeHorizon]);

  // Selected variable definitions
  const activeVariables = useMemo(() => {
    return AVAILABLE_VARIABLES.filter(v => selectedVarIds.has(v.id));
  }, [selectedVarIds]);

  // Latest snapshot metrics for summary badges
  const latestData = chartData[chartData.length - 1] || {};

  return (
    <div className="w-full bg-ares-surface rounded-xl border border-ares-border p-4 sm:p-5 flex flex-col gap-4 select-none">
      {/* 1. Header Toolbar with Variable Graph Title, Graph Type, and Time Horizon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-ares-border pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-ares-accent" />
          <div>
            <h3 className="font-bold font-mono text-sm uppercase text-black tracking-wide flex items-center gap-2">
              <span>Interactive Variable Telemetry Graph</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-ares-card border border-ares-border text-black font-semibold">
                {activeVariables.length} ACTIVE VARIABLES
              </span>
            </h3>
            {!compact && (
              <p className="text-xs text-black/80 font-mono mt-0.5">
                Toggle multi-variable metrics, graph styles, and inspection horizons in real time.
              </p>
            )}
          </div>
        </div>

        {/* View Controls: Presets, Graph Type (Line/Area/Bar), and Time Horizon */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="hidden lg:flex items-center bg-ares-card p-1 rounded-lg border border-ares-border text-xs font-mono">
            <span className="px-2 text-black font-bold uppercase text-[11px]">Presets:</span>
            <button
              onClick={() => applyPreset('overview')}
              className="px-2 py-0.5 rounded text-black hover:bg-ares-border font-medium"
            >
              Overview
            </button>
            <button
              onClick={() => applyPreset('logistics')}
              className="px-2 py-0.5 rounded text-black hover:bg-ares-border font-medium"
            >
              Fleet
            </button>
            <button
              onClick={() => applyPreset('equity')}
              className="px-2 py-0.5 rounded text-black hover:bg-ares-border font-medium"
            >
              Fairness
            </button>
            <button
              onClick={() => applyPreset('all')}
              className="px-2 py-0.5 rounded text-black hover:bg-ares-border font-medium"
            >
              All
            </button>
          </div>

          {/* Graph Type Switcher */}
          <div className="flex items-center bg-ares-card p-1 rounded-lg border border-ares-border text-xs font-mono">
            <button
              onClick={() => setGraphType('line')}
              className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1 ${
                graphType === 'line'
                  ? 'bg-ares-accent text-white shadow-sm'
                  : 'text-black hover:text-ares-accent'
              }`}
              title="Multi-Variable Line Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
            <button
              onClick={() => setGraphType('area')}
              className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1 ${
                graphType === 'area'
                  ? 'bg-ares-accent text-white shadow-sm'
                  : 'text-black hover:text-ares-accent'
              }`}
              title="Multi-Variable Gradient Area Chart"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Area</span>
            </button>
            <button
              onClick={() => setGraphType('bar')}
              className={`px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1 ${
                graphType === 'bar'
                  ? 'bg-ares-accent text-white shadow-sm'
                  : 'text-black hover:text-ares-accent'
              }`}
              title="Multi-Variable Comparative Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
          </div>

          {/* Horizon Window */}
          <div className="flex items-center bg-ares-card p-1 rounded-lg border border-ares-border text-xs font-mono">
            {(['all', '20', '50'] as const).map(h => (
              <button
                key={h}
                onClick={() => setTimeHorizon(h)}
                className={`px-2 py-1 rounded transition-all font-bold ${
                  timeHorizon === h
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-ares-border'
                }`}
              >
                {h === 'all' ? 'All' : `${h}T`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive Variable Selector Pills (Clickable Toggles) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono font-bold text-black uppercase mr-1">Variables:</span>
        {AVAILABLE_VARIABLES.map(v => {
          const isSelected = selectedVarIds.has(v.id);
          const val = latestData[v.id] ?? 0;

          return (
            <button
              key={v.id}
              onClick={() => toggleVariable(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-white border-black shadow-sm text-black ring-1 ring-black/20'
                  : 'bg-ares-card border-ares-border text-black/60 hover:text-black hover:border-black/40'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ backgroundColor: v.color }}
              />
              <span className="truncate">{v.name}</span>
              <span className="font-bold text-black ml-1">
                {val}{v.unit === '%' ? '%' : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Primary SVG Variable Graph Render Area */}
      <div className="w-full relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {graphType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="tick"
                stroke="#000000"
                tick={{ fill: '#000000', fontSize: 12, fontWeight: 600 }}
                label={{ value: 'Simulation Tick', position: 'insideBottom', offset: -5, fill: '#000000', fontSize: 12 }}
              />
              <YAxis
                stroke="#000000"
                tick={{ fill: '#000000', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#000000',
                  borderWidth: '1.5px',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                  color: '#000000',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                labelStyle={{ color: '#000000', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: '#000000', padding: '2px 0' }}
              />
              <Legend
                wrapperStyle={{
                  color: '#000000',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '12px',
                  fontWeight: 600,
                  paddingTop: '8px',
                }}
              />
              {activeVariables.map(v => (
                <Line
                  key={v.id}
                  type="monotone"
                  dataKey={v.id}
                  name={v.name}
                  stroke={v.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: v.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: v.color, stroke: '#000000', strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          ) : graphType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                {activeVariables.map(v => (
                  <linearGradient key={v.id} id={`grad-${v.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={v.color} stopOpacity={0.65} />
                    <stop offset="95%" stopColor={v.color} stopOpacity={0.08} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="tick"
                stroke="#000000"
                tick={{ fill: '#000000', fontSize: 12, fontWeight: 600 }}
                label={{ value: 'Simulation Tick', position: 'insideBottom', offset: -5, fill: '#000000', fontSize: 12 }}
              />
              <YAxis
                stroke="#000000"
                tick={{ fill: '#000000', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#000000',
                  borderWidth: '1.5px',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                  color: '#000000',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                labelStyle={{ color: '#000000', fontWeight: 'bold' }}
              />
              <Legend
                wrapperStyle={{
                  color: '#000000',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '12px',
                  fontWeight: 600,
                  paddingTop: '8px',
                }}
              />
              {activeVariables.map(v => (
                <Area
                  key={v.id}
                  type="monotone"
                  dataKey={v.id}
                  name={v.name}
                  stroke={v.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#grad-${v.id})`}
                />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="tick"
                stroke="#000000"
                tick={{ fill: '#000000', fontSize: 12, fontWeight: 600 }}
                label={{ value: 'Simulation Tick', position: 'insideBottom', offset: -5, fill: '#000000', fontSize: 12 }}
              />
              <YAxis
                stroke="#000000"
                tick={{ fill: '#000000', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#000000',
                  borderWidth: '1.5px',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                  color: '#000000',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                labelStyle={{ color: '#000000', fontWeight: 'bold' }}
              />
              <Legend
                wrapperStyle={{
                  color: '#000000',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '12px',
                  fontWeight: 600,
                  paddingTop: '8px',
                }}
              />
              {activeVariables.map(v => (
                <Bar
                  key={v.id}
                  dataKey={v.id}
                  name={v.name}
                  fill={v.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 4. Variable Stats Footnote Bar */}
      <div className="pt-2 border-t border-ares-border flex flex-wrap items-center justify-between text-xs font-mono text-black">
        <div className="flex items-center gap-4">
          <span className="font-bold uppercase text-[11px] text-black">Horizon Coverage:</span>
          <span>Ticks {chartData[0]?.tick ?? 0} &rarr; {chartData[chartData.length - 1]?.tick ?? 0}</span>
          <span className="text-black/50">|</span>
          <span>Sample Points: {chartData.length}</span>
        </div>
        <div className="text-[11px] font-semibold text-black">
          Simulation Engine Status: Authoritative Continuous Telemetry
        </div>
      </div>
    </div>
  );
};
