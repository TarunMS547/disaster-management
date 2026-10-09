import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Play, 
  Layers 
} from 'lucide-react';
import { VariableGraph } from '../components/analytics/VariableGraph';

export const AnalyticsPage: React.FC = () => {
  const { state, comparison, runBaselineComparison } = useSimulation();
  const m = state.metrics;

  // Resource unmet demand chart data
  const unmetByResourceData = Object.entries(m.unmetDemandByResource).map(([resId, qty]) => ({
    resource: resId.replace('res-', '').toUpperCase(),
    quantity: qty,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ares-border pb-4">
        <div>
          <h1 className="text-xl font-bold uppercase text-ares-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-ares-accent" />
            <span>Operational Analytics & Baseline Benchmark</span>
          </h1>
          <p className="text-xs text-ares-subtext mt-1">
            Empirical efficiency measurements derived strictly from authoritative simulation state.
          </p>
        </div>

        <button
          onClick={runBaselineComparison}
          className="px-4 py-2 rounded-lg bg-ares-accent hover:bg-ares-accent/80 text-ares-bg font-bold flex items-center gap-2 shadow-glow-cyan transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>RUN FAIR BASELINE BENCHMARK</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-ares-surface border border-ares-border space-y-1">
          <div className="text-[10px] uppercase text-ares-muted">CRITICAL DEMAND FULFILLED</div>
          <div className="text-2xl font-bold text-ares-accent">
            {m.criticalDemandFulfilledPercent}%
          </div>
          <div className="text-[10px] text-ares-subtext">Higher is better (Target: 100%)</div>
        </div>

        <div className="p-4 rounded-xl bg-ares-surface border border-ares-border space-y-1">
          <div className="text-[10px] uppercase text-ares-muted">TOTAL UNMET DEFICIT</div>
          <div className="text-2xl font-bold text-ares-critical">
            {m.totalUnmetDemand} <span className="text-xs font-normal text-ares-subtext">units</span>
          </div>
          <div className="text-[10px] text-ares-subtext">Lower is better</div>
        </div>

        <div className="p-4 rounded-xl bg-ares-surface border border-ares-border space-y-1">
          <div className="text-[10px] uppercase text-ares-muted">AVG FULFILLMENT TIME</div>
          <div className="text-2xl font-bold text-ares-text">
            {m.averageFulfillmentTimeTicks} <span className="text-xs font-normal text-ares-subtext">ticks</span>
          </div>
          <div className="text-[10px] text-ares-subtext">Lower is better</div>
        </div>

        <div className="p-4 rounded-xl bg-ares-surface border border-ares-border space-y-1">
          <div className="text-[10px] uppercase text-ares-muted">JAIN'S FAIRNESS INDEX</div>
          <div className="text-2xl font-bold text-ares-success">
            {m.fairnessIndex.toFixed(2)}
          </div>
          <div className="text-[10px] text-ares-subtext">Scale: 0.0 to 1.0 (Higher is fairer)</div>
        </div>
      </div>

      {/* Side-by-Side Baseline Comparison Table */}
      {comparison && (
        <div className="p-6 rounded-xl bg-ares-surface border border-ares-accent/40 space-y-4 shadow-glow-cyan">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase text-ares-text flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ares-accent" />
              <span>Comparative Benchmark: ARES vs Baseline FCFS Policy</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-ares-accent/15 text-ares-accent border border-ares-accent/30">
              IDENTICAL SEED {state.seed}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ares-border text-ares-muted uppercase text-[10px]">
                  <th className="py-2.5 px-3">Metric Dimension</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3 text-ares-accent">ARES Multi-Agent Coordination</th>
                  <th className="py-2.5 px-3 text-ares-subtext">Baseline (FCFS / Nearest-First)</th>
                  <th className="py-2.5 px-3">Empirical Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ares-border/60">
                <tr>
                  <td className="py-3 px-3 font-semibold text-ares-text">Critical Demand Fulfilled (%)</td>
                  <td className="py-3 px-3 text-emerald-400">Higher ↑</td>
                  <td className="py-3 px-3 font-bold text-ares-accent">{comparison.aresMetrics.criticalDemandFulfilledPercent}%</td>
                  <td className="py-3 px-3 text-ares-subtext">{comparison.baselineMetrics.criticalDemandFulfilledPercent}%</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    {comparison.aresMetrics.criticalDemandFulfilledPercent >= comparison.baselineMetrics.criticalDemandFulfilledPercent ? '+' : ''}
                    {comparison.aresMetrics.criticalDemandFulfilledPercent - comparison.baselineMetrics.criticalDemandFulfilledPercent}%
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-ares-text">Total Unmet Resource Deficit</td>
                  <td className="py-3 px-3 text-rose-400">Lower ↓</td>
                  <td className="py-3 px-3 font-bold text-ares-text">{comparison.aresMetrics.totalUnmetDemand} units</td>
                  <td className="py-3 px-3 text-ares-subtext">{comparison.baselineMetrics.totalUnmetDemand} units</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    {comparison.aresMetrics.totalUnmetDemand <= comparison.baselineMetrics.totalUnmetDemand ? '-' : '+'}
                    {Math.abs(comparison.aresMetrics.totalUnmetDemand - comparison.baselineMetrics.totalUnmetDemand)} units
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-ares-text">Avg Fulfillment Latency</td>
                  <td className="py-3 px-3 text-rose-400">Lower ↓</td>
                  <td className="py-3 px-3 font-bold text-ares-text">{comparison.aresMetrics.averageFulfillmentTimeTicks} ticks</td>
                  <td className="py-3 px-3 text-ares-subtext">{comparison.baselineMetrics.averageFulfillmentTimeTicks} ticks</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    {(comparison.baselineMetrics.averageFulfillmentTimeTicks - comparison.aresMetrics.averageFulfillmentTimeTicks).toFixed(1)} ticks faster
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-ares-text">Rerouted In-Transit Deliveries</td>
                  <td className="py-3 px-3 text-ares-subtext">Dynamic Avoidance</td>
                  <td className="py-3 px-3 font-bold text-ares-accent">{comparison.aresMetrics.deliveriesRerouted} dynamic reroutes</td>
                  <td className="py-3 px-3 text-ares-subtext">{comparison.baselineMetrics.deliveriesRerouted} (0 reroutes, blocked)</td>
                  <td className="py-3 px-3 font-bold text-ares-accent">Proactive Detour</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-ares-text">Fairness Index (Jain's)</td>
                  <td className="py-3 px-3 text-emerald-400">Higher ↑</td>
                  <td className="py-3 px-3 font-bold text-ares-success">{comparison.aresMetrics.fairnessIndex.toFixed(2)}</td>
                  <td className="py-3 px-3 text-ares-subtext">{comparison.baselineMetrics.fairnessIndex.toFixed(2)}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    +{(comparison.aresMetrics.fairnessIndex - comparison.baselineMetrics.fairnessIndex).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Variable Telemetry Graph */}
      <VariableGraph
        metricsHistory={state.metricsHistory}
        currentTick={state.currentTick}
        height={380}
      />

      {/* Secondary Resource Deficit Distribution Breakdown */}
      <div className="p-5 rounded-xl bg-ares-surface border border-ares-border space-y-4">
        <h3 className="font-bold uppercase text-black text-sm font-mono flex items-center justify-between">
          <span>Unmet Resource Deficit Distribution by Category</span>
          <span className="text-xs text-black/70">Authoritative Real-Time Inventory Gaps</span>
        </h3>
        <div className="h-64">
          {unmetByResourceData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-black font-semibold">
              No active unmet resource deficits in this simulation horizon. All allocations optimal.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unmetByResourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="resource" 
                  stroke="#000000" 
                  tick={{ fill: '#000000', fontSize: 12, fontWeight: 600 }}
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
                    color: '#000000',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)'
                  }} 
                  itemStyle={{ color: '#000000' }}
                  labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                />
                <Bar dataKey="quantity" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
