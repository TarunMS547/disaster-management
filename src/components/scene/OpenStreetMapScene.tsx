import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useSimulation } from '../../context/SimulationContext';
import { simPosToLatLng, METRO_CENTER_LAT, METRO_CENTER_LNG } from '../../simulation/geo';
import { 
  Layers, 
  Crosshair, 
  ShieldAlert, 
  AlertTriangle, 
  Building2, 
  Truck, 
  MapPin 
} from 'lucide-react';

type TileProvider = 'dark' | 'standard' | 'humanitarian';

const TILE_PROVIDERS: Record<TileProvider, { url: string; attribution: string; name: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'OpenStreetMap (Cyber Dark)',
  },
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: 'OpenStreetMap (Standard)',
  },
  humanitarian: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team',
    name: 'OpenStreetMap (Humanitarian / Disaster)',
  },
};

export const OpenStreetMapScene: React.FC = () => {
  const { state, selectedEntity, selectEntity } = useSimulation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hazardsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeProvider, setActiveProvider] = useState<TileProvider>('dark');

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [METRO_CENTER_LAT, METRO_CENTER_LNG],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      const provider = TILE_PROVIDERS[activeProvider];
      const tileLayer = L.tileLayer(provider.url, {
        attribution: provider.attribution,
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Layer groups for dynamic simulation updates
      hazardsLayerGroupRef.current = L.layerGroup().addTo(map);
      routesLayerGroupRef.current = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;

      // Invalidate size on mount after layout finishes
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Change Tile Provider (Standard OSM vs Dark OSM vs Humanitarian OSM)
  useEffect(() => {
    if (!mapRef.current) return;
    const provider = TILE_PROVIDERS[activeProvider];

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapRef.current);

    tileLayerRef.current = newTileLayer;
  }, [activeProvider]);

  // 3. Render and update Simulation Entities on OpenStreetMap
  useEffect(() => {
    if (!mapRef.current || !markersLayerGroupRef.current || !routesLayerGroupRef.current || !hazardsLayerGroupRef.current) return;

    const markersGroup = markersLayerGroupRef.current;
    const routesGroup = routesLayerGroupRef.current;
    const hazardsGroup = hazardsLayerGroupRef.current;

    markersGroup.clearLayers();
    routesGroup.clearLayers();
    hazardsGroup.clearLayers();

    // Map road node IDs to LatLng
    const nodeLatLngMap = new Map<string, [number, number]>();
    for (const node of state.roadNodes) {
      nodeLatLngMap.set(node.id, simPosToLatLng(node.position));
    }

    // A. Draw Road Network Edges
    for (const edge of state.roadEdges) {
      const p1 = nodeLatLngMap.get(edge.fromNode);
      const p2 = nodeLatLngMap.get(edge.toNode);
      if (!p1 || !p2) continue;

      const isBlocked = edge.status === 'blocked';
      const isSlow = edge.status === 'slow';
      const isSelected = selectedEntity.type === 'edge' && selectedEntity.id === edge.id;

      const polyline = L.polyline([p1, p2], {
        color: isBlocked ? '#ef4444' : isSlow ? '#f59e0b' : '#0284c7',
        weight: isSelected ? 7 : isBlocked ? 5 : 3.5,
        opacity: isBlocked ? 0.9 : 0.75,
        dashArray: isBlocked ? '8, 8' : undefined,
      });

      polyline.on('click', () => {
        selectEntity('edge', edge.id);
      });

      polyline.bindPopup(`
        <div style="font-family: monospace;">
          <strong style="color: ${isBlocked ? '#ef4444' : '#00e5ff'}; font-size: 12px;">ROAD CORRIDOR: ${edge.id.toUpperCase()}</strong><br/>
          <span>Nodes: ${edge.fromNode} ↔ ${edge.toNode}</span><br/>
          <span>Status: <strong style="color: ${isBlocked ? '#ef4444' : isSlow ? '#f59e0b' : '#10b981'};">${edge.status.toUpperCase()}</strong></span><br/>
          <span>Travel Ticks: ${edge.travelTimeTicks} | Hazard Risk: ${edge.hazardExposureCost}</span>
        </div>
      `);

      routesGroup.addLayer(polyline);

      // Blocked barrier marker icon on midpoint
      if (isBlocked) {
        const midLat = (p1[0] + p2[0]) / 2;
        const midLng = (p1[1] + p2[1]) / 2;
        const barrierIcon = L.divIcon({
          className: 'custom-barrier-icon',
          html: `
            <div style="
              background: #ef4444; 
              color: white; 
              border: 2px solid #fff; 
              border-radius: 50%; 
              width: 22px; 
              height: 22px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              font-size: 11px;
              box-shadow: 0 0 10px rgba(239,68,68,0.8);
            ">✕</div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const barrierMarker = L.marker([midLat, midLng], { icon: barrierIcon });
        routesGroup.addLayer(barrierMarker);
      }
    }

    // B. Draw Active Delivery Flow Corridors
    for (const del of state.deliveries) {
      if (del.status !== 'in_transit' && del.status !== 'rerouted') continue;
      if (!del.routeNodeIds || del.routeNodeIds.length < 2) continue;

      const latlngs = del.routeNodeIds
        .map(id => nodeLatLngMap.get(id))
        .filter((ll): ll is [number, number] => ll !== undefined);

      if (latlngs.length >= 2) {
        const activeFlow = L.polyline(latlngs, {
          color: '#00e5ff',
          weight: 5,
          opacity: 0.85,
          dashArray: '10, 8',
        });
        routesGroup.addLayer(activeFlow);
      }
    }

    // C. Draw Hazard / Flood Zones
    for (const inc of state.incidents) {
      const center = simPosToLatLng(inc.position);
      const isFlood = inc.type === 'flood_expansion';
      const color = isFlood ? '#0284c7' : '#ef4444';
      const radiusMeters = Math.max(300, (inc.radius || 8) * 120);

      const circle = L.circle(center, {
        radius: radiusMeters,
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 2,
        dashArray: '6, 6',
      });

      circle.bindPopup(`
        <div>
          <strong style="color: ${color}; font-size: 12px;">HAZARD: ${inc.name.toUpperCase()}</strong><br/>
          <span>Type: ${inc.type.replace('_', ' ')}</span><br/>
          <span>Severity: <strong style="color: #f43f5e;">${inc.severity.toUpperCase()}</strong></span><br/>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px;">${inc.description}</p>
        </div>
      `);

      hazardsGroup.addLayer(circle);
    }

    // D. Draw Facility Markers
    for (const fac of state.facilities) {
      const latlng = simPosToLatLng(fac.position);
      const isSelected = selectedEntity.type === 'facility' && selectedEntity.id === fac.id;
      const isHospital = fac.type === 'hospital';
      const isShelter = fac.type === 'shelter';
      const isWarehouse = fac.type === 'warehouse';
      const isOffline = fac.operationalStatus === 'offline';

      const badgeColor = isHospital ? '#f43f5e' : isShelter ? '#10b981' : isWarehouse ? '#38bdf8' : '#00e5ff';
      const badgeLetter = isHospital ? 'H' : isShelter ? 'S' : isWarehouse ? 'W' : 'HQ';

      const customIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            background: #0d131f;
            border: 2px solid ${badgeColor};
            border-radius: 8px;
            color: ${badgeColor};
            font-weight: 800;
            font-family: monospace;
            font-size: 13px;
            box-shadow: ${isSelected ? `0 0 20px ${badgeColor}` : `0 4px 10px rgba(0,0,0,0.6)`};
            transition: all 0.2s ease;
          ">
            ${badgeLetter}
            <span style="
              position: absolute;
              bottom: -18px;
              white-space: nowrap;
              font-size: 10px;
              font-weight: bold;
              color: #f1f5f9;
              background: rgba(13,19,31,0.85);
              padding: 1px 4px;
              border-radius: 4px;
              border: 1px solid rgba(255,255,255,0.1);
            ">${fac.name}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(latlng, { icon: customIcon });

      marker.on('click', () => {
        selectEntity('facility', fac.id);
      });

      // Popup
      const medStock = fac.inventory['res-med'] || 0;
      const waterStock = fac.inventory['res-water'] || 0;
      const foodStock = fac.inventory['res-food'] || 0;

      marker.bindPopup(`
        <div style="min-width: 170px;">
          <div style="font-weight: 800; font-size: 12px; color: ${badgeColor}; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 4px;">
            ${fac.name.toUpperCase()}
          </div>
          <div>Type: <strong>${fac.type.toUpperCase()}</strong></div>
          <div>Status: <strong style="color: ${isOffline ? '#ef4444' : '#10b981'};">${fac.operationalStatus.toUpperCase()}</strong></div>
          <div>Pop: <strong>${fac.population}</strong> | Priority: <strong>${fac.priority}/10</strong></div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #334155;">
            <div>Medicine: <strong>${medStock}</strong></div>
            <div>Water: <strong>${waterStock}</strong></div>
            <div>Food: <strong>${foodStock}</strong></div>
          </div>
        </div>
      `);

      markersGroup.addLayer(marker);
    }

    // E. Draw Moving Vehicle Markers
    for (const veh of state.vehicles) {
      const latlng = simPosToLatLng(veh.position);
      const isSelected = selectedEntity.type === 'vehicle' && selectedEntity.id === veh.id;
      const isInTransit = veh.status === 'in_transit';

      const vehIcon = L.divIcon({
        className: 'custom-veh-marker',
        html: `
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            background: #0284c7;
            border: 2px solid ${isInTransit ? '#00e5ff' : '#94a3b8'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 12px;
            box-shadow: ${isInTransit ? '0 0 15px rgba(0,229,255,0.9)' : '0 2px 6px rgba(0,0,0,0.5)'};
            transition: all 0.3s ease;
          ">
            🚚
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const vehMarker = L.marker(latlng, { icon: vehIcon });

      vehMarker.on('click', () => {
        selectEntity('vehicle', veh.id);
      });

      vehMarker.bindPopup(`
        <div>
          <strong style="color: #00e5ff; font-size: 12px;">${veh.name}</strong><br/>
          <span>Type: ${veh.type.replace('_', ' ').toUpperCase()}</span><br/>
          <span>Status: <strong style="color: ${isInTransit ? '#00e5ff' : '#94a3b8'};">${veh.status.toUpperCase()}</strong></span><br/>
          <span>Load: <strong>${veh.currentLoad} / ${veh.capacity}</strong> units</span><br/>
          <span>Speed: ${veh.speed}x</span>
        </div>
      `);

      markersGroup.addLayer(vehMarker);
    }
  }, [state, selectedEntity, selectEntity]);

  const handleResetCenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([METRO_CENTER_LAT, METRO_CENTER_LNG], 13, { animate: true });
    }
  };

  return (
    <div className="w-full h-full relative select-none bg-ares-bg">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Map Layer & Provider Controls */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2">
        <div className="bg-ares-card/90 backdrop-blur-md p-1.5 rounded-lg border border-ares-border flex items-center gap-1 text-xs font-mono shadow-xl">
          <Layers className="w-3.5 h-3.5 text-ares-accent ml-1 mr-1" />
          {(['dark', 'standard', 'humanitarian'] as const).map(providerKey => (
            <button
              key={providerKey}
              onClick={() => setActiveProvider(providerKey)}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeProvider === providerKey
                  ? 'bg-ares-accent text-ares-bg font-bold'
                  : 'text-ares-subtext hover:text-ares-text'
              }`}
            >
              {providerKey === 'dark' ? 'OSM Dark' : providerKey === 'standard' ? 'OSM Standard' : 'OSM Disaster'}
            </button>
          ))}
        </div>

        <button
          onClick={handleResetCenter}
          className="bg-ares-card/90 backdrop-blur-md p-2 rounded-lg border border-ares-border text-ares-subtext hover:text-ares-accent transition-colors shadow-xl"
          title="Recenter Map on Command HQ"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Map Legend */}
      <div className="absolute bottom-6 left-4 z-[400] bg-ares-card/90 backdrop-blur-md px-3 py-2.5 rounded-lg border border-ares-border font-mono text-[11px] space-y-1 shadow-2xl hidden sm:block">
        <div className="text-[10px] text-ares-muted uppercase font-bold tracking-wider mb-1">
          OpenStreetMap Dynamic Legend
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
            <span>Hospital [H]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span>Shelter [S]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
            <span>Depot [W]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
            <span>Command HQ</span>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-1 border-t border-ares-border/60">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 inline-block" />
            <span>Open Road</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500 inline-block border-t border-dashed border-red-500" />
            <span>Hazard Blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block border-t border-dashed border-cyan-400" />
            <span>Active Dispatch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
