# ARES — Autonomous Resilience & Emergency Operations Digital Twin

> **Mission:** A futuristic, interactive disaster-response digital twin where autonomous agents coordinate scarce resources across hospitals, shelters, warehouses, and emergency response centers while disasters and road conditions change over simulated time.

---

## 1. System Overview

ARES is an operations-room digital twin designed to manage disaster logistics in real-time. Built with **React 18**, **Three.js / React Three Fiber**, **Tailwind CSS**, and **TypeScript** (strict mode), the application coordinates medical supplies, drinking water, and rations across a synthetic city under dynamic disaster disruptions.

### Core Capabilities
1. **Multi-Agent Decision Pipeline**: Five bounded autonomous agents (Disaster Coordinator, Hospital Agent, Shelter Agent, Logistics Agent, Resource Marketplace Agent) arbitrate competing requests, calculate burn rates, and dynamically reroute delivery convoys around hazards.
2. **3D Digital Twin & 2D Accessible Fallback**: Interactive WebGL city canvas featuring terrain elevation, arterial highways, facility beacon spires, moving logistics units, and translucent hazard flood domes. Includes an accessible 2D Canvas/SVG schematic fallback.
3. **Deterministic Simulation Engine**: Seeded PRNG (`Mulberry32`) ensures reproducible scenario trajectories. Strict invariant guards guarantee conservation of resources, non-negative inventories, vehicle capacity enforcement, and route feasibility.
4. **Disaster Interventions**: Live injection of road closures, sudden demand surges, warehouse power grid outages, and vehicle mechanical breakdowns.
5. **Fair Baseline Benchmark**: Empirical side-by-side comparison against First-Come-First-Served (FCFS) policies on identical seeds, calculating critical demand fulfilled %, unmet deficits, fulfillment latency, and Jain's fairness index.
6. **Enterprise Auth & Database Architecture**: Direct integration with **Clerk Auth** and **Supabase PostgreSQL** with Row Level Security (RLS) policies, paired with zero-crash offline local storage fallback.

---

## 2. Technology Stack

- **Frontend Core**: Vite 6, React 18, TypeScript (`strict: true`), React Router v6
- **Styling**: Tailwind CSS with custom cyber operations palette (`ares-bg`, `ares-surface`, `ares-accent`, `ares-critical`)
- **3D Visualization**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Analytics & Charts**: Recharts, Lucide Icons
- **Authentication**: `@clerk/clerk-react` / `@clerk/react` (with local mock session fallback)
- **Database & RLS**: `@supabase/supabase-js`, PostgreSQL migrations
- **Testing**: Vitest unit test suite

---

## 3. Project Structure

```
disaster-management/
├── src/
│   ├── components/
│   │   ├── layout/            # TopBar, SideRail
│   │   ├── panels/            # IncidentPanel, EntityDetailPanel, AgentReasoningPanel, TimelinePanel, EventTriggerDialog
│   │   └── scene/             # DigitalTwinScene, CityGround, RoadNetwork, FacilityMarker, VehicleMarker, HazardZone, Fallback2DMap
│   ├── context/               # AuthContext (Clerk + Mock), SimulationContext
│   ├── pages/                 # LandingPage, DashboardPage, NewSimulationPage, CommandCenterPage, EventsTimelinePage, AnalyticsPage, ResourcesPage, SettingsPage
│   ├── services/              # supabase.ts (RLS + JWT bridge), storage.ts (hybrid local/cloud persistence)
│   ├── simulation/
│   │   ├── agents/            # coordinator.ts, hospital.ts, shelter.ts, logistics.ts, marketplace.ts
│   │   ├── baseline.ts        # FCFS / Nearest-First baseline policy
│   │   ├── engine.ts          # Deterministic SimulationEngine & invariant verifier
│   │   ├── graph.ts           # Dijkstra road network graph & interpolation
│   │   └── scenarios.ts       # Seeded scenarios A (Flood), B (Shortage), C (Cascading)
│   ├── types/                 # simulation.ts (Strict domain types)
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── supabase/
│   └── migrations/
│       └── 20261009000000_ares_schema.sql  # Complete SQL migration with RLS policies
├── tests/
│   └── simulation.test.ts     # Invariant test suite
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Setup & Getting Started

### Prerequisites
- Node.js LTS (v18+)
- npm (v9+)

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
The operations center will be accessible at `http://localhost:5173/`.

### Running Invariant Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## 5. Cloud Integration Setup (Clerk & Supabase)

The application includes zero-crash fallback mode for offline/local development. To link live cloud credentials:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. **Clerk Configuration**:
   - Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
   - Set `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`.
3. **Supabase Configuration**:
   - Create a project at [supabase.com](https://supabase.com).
   - Set `VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co`.
   - Set `VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...`.
   - Run the migration in the Supabase SQL Editor:
     Apply the contents of `supabase/migrations/20261009000000_ares_schema.sql`.
   - In Supabase Auth -> Third-Party Auth, enable Clerk and configure the Clerk JWT template.

---

## 6. Seeded Disaster Scenarios

- **Scenario A: Urban Flash Flood (Seed: 42001)**: Catastrophic river cresting submerges the Central-South arterial crossing. Water & ration reserves rapidly deplete at civilian shelters while hospital medicine demand peaks.
- **Scenario B: Severe Hospital Supply Shortage (Seed: 53102)**: Intensive Care Unit oxygen stock drops to critical levels. The nearest annex has only partial stock, requiring multi-tier coordinated dispatch from the distant strategic reserve.
- **Scenario C: Compound Cascading Disruption (Seed: 69420)**: Power grid failure takes the primary distribution hub offline while key bridge corridors collapse simultaneously.
