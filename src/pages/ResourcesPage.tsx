import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Package, ShieldAlert, TrendingDown, Layers, Building2 } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { state } = useSimulation();

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none font-mono text-xs">
      <div className="border-b border-ares-border pb-4">
        <h1 className="text-xl font-bold uppercase text-ares-text flex items-center gap-2">
          <Package className="w-5 h-5 text-ares-accent" />
          <span>City-Wide Resource Inventory Matrix</span>
        </h1>
        <p className="text-xs text-ares-subtext mt-1">
          Real-time stockpile distribution across warehouses, hospitals, and emergency distribution hubs.
        </p>
      </div>

      {/* Aggregate Stockpiles by Resource Category */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {state.resources.map(res => {
          const totalInCity = state.facilities.reduce((sum, f) => sum + (f.inventory[res.id] || 0), 0);
          const totalReserved = state.facilities.reduce((sum, f) => sum + (f.reservedInventory[res.id] || 0), 0);

          return (
            <div key={res.id} className="p-3.5 rounded-xl bg-ares-surface border border-ares-border space-y-1">
              <div className="text-[10px] uppercase text-ares-muted truncate font-bold">{res.name}</div>
              <div className="text-xl font-bold text-ares-text">
                {totalInCity} <span className="text-[10px] font-normal text-ares-muted">{res.unit}</span>
              </div>
              <div className="text-[10px] text-ares-subtext">
                Reserved: <span className="text-ares-accent">{totalReserved}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Facility Matrix Table */}
      <div className="p-5 rounded-xl bg-ares-surface border border-ares-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase text-ares-text">
            Facility Inventory Telemetry Grid
          </h2>
          <span className="text-[11px] text-ares-muted">{state.facilities.length} FACILITIES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ares-border text-ares-muted uppercase text-[10px]">
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                {state.resources.map(r => (
                  <th key={r.id} className="py-2.5 px-3">{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ares-border/60">
              {state.facilities.map(fac => {
                const isOffline = fac.operationalStatus === 'offline';

                return (
                  <tr key={fac.id} className="hover:bg-ares-card/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-ares-text">
                      {fac.name}
                    </td>
                    <td className="py-3 px-3 uppercase text-ares-subtext text-[11px]">
                      {fac.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isOffline ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {fac.operationalStatus.toUpperCase()}
                      </span>
                    </td>
                    {state.resources.map(r => {
                      const stock = fac.inventory[r.id] || 0;
                      const burn = fac.consumptionRates[r.id] || 0;
                      const isZero = stock === 0 && burn > 0;

                      return (
                        <td key={r.id} className="py-3 px-3 font-mono">
                          <span className={`font-bold ${isZero ? 'text-ares-critical' : stock < 20 ? 'text-ares-amber' : 'text-ares-text'}`}>
                            {stock}
                          </span>
                          {burn > 0 && (
                            <span className="text-[10px] text-ares-muted block">
                              -{burn}/tick
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
