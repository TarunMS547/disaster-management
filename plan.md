# ARES — Autonomous Resilience & Emergency System
## Build Plan and Implementation Specification

> **Mission:** Build a futuristic, interactive disaster-response digital twin where autonomous agents coordinate scarce resources across hospitals, shelters, warehouses, and emergency response centers while disasters and road conditions change over simulated time.

This document is the implementation source of truth. Build a working, demonstrable simulation—not a static mockup. Prioritize correct simulation logic, a polished live 3D interface, transparent agent decisions, and reproducible comparisons.

---

## 1. Product vision

ARES is a browser-based disaster-response simulation and decision-support prototype. A user can start a scenario, observe a simulated city, introduce new incidents (flooding, road closures, demand spikes, or a disabled warehouse), and watch the system re-plan resource allocation and delivery routes.

### Core demo story

1. Start a synthetic flood scenario in a fictional city.
2. The simulation advances; shelters consume food and water, hospitals consume medical supplies, and resource stocks change.
3. A road becomes blocked and a hospital's projected medicine supply becomes critical.
4. The relevant agents raise requests and identify available surplus.
5. The coordinator runs constrained allocation and route optimization.
6. Proposed transfers are checked against inventory, vehicle capacity, road availability, urgency, and travel time.
7. Deliveries animate on the map; arrivals change inventory and unmet-demand metrics.
8. The user compares autonomous coordination with a baseline strategy under the same initial conditions.

**Important:** Clearly label all data as synthetic/simulated. This is a prototype, not a certified emergency-management system. Never present generated forecasts as real-world facts.

---

## 2. Required technology

Use the provided links as the technology references:
- Clerk: https://clerk.com/
- Supabase: https://supabase.com/
- Vite: https://vite.dev/guide/

### Frontend
- Vite
- React
- TypeScript (`strict: true`)
- React Router
- Tailwind CSS
- shadcn/ui where useful, or a consistent accessible component system
- Lucide icons
- Three.js with React Three Fiber and Drei for the custom 3D simulation; keep the scene lightweight and responsive
- Zustand for client-side simulation/view state if needed
- TanStack Query for server state if needed
- Zod for runtime validation
- Recharts for supporting charts
- Vitest and React Testing Library

### Auth
- Clerk using the current React SDK appropriate for Vite (`@clerk/react`; verify the current official docs before implementation).
- Use Clerk for sign-up, sign-in, sessions, and user profile controls.
- Do not introduce Supabase Auth as a second independent sign-in flow.
- Do not expose a Clerk secret key in browser code.

### Data and realtime
- Supabase PostgreSQL
- `@supabase/supabase-js`
- Supabase Realtime for updates to persisted runs/events where appropriate.
- Supabase Row Level Security (RLS) on all user- or organization-scoped tables.
- Connect Clerk as a third-party auth provider in Supabase and pass the Clerk session token to the Supabase client as specified by current official documentation.
- Create and version database schema with Supabase SQL migrations.
- Never expose a Supabase service-role/secret key to the browser.

### Simulation engine
- Prefer a dedicated Python + FastAPI service for the authoritative simulation and optimization engine.
- Use Pydantic for schemas.
- Use Google OR-Tools for vehicle routing/allocation optimization when practical.
- Use deterministic algorithms and seeded randomness for repeatable scenario runs.
- Use WebSockets or a well-defined streaming mechanism for live tick/event updates.
- If the current repository is frontend-only, build a minimal coherent backend in a separate `server/` directory. Do not fake backend behavior in UI components.
- If backend setup would exceed the first vertical slice, first implement the simulation engine as a pure, well-tested TypeScript module, behind a clean interface that can later be moved to Python. Do not maintain two competing authoritative engines.

### Deployment
- Make the app deployable as a Vite static frontend plus the simulation API service.
- Include `.env.example`, setup instructions, migrations, tests, and production build commands.
- Never commit credentials.

---

## 3. Repository-first instructions

Before changing code:

1. Inspect the repository tree, package manager, scripts, current routes, styling system, existing components, environment files by filename only, and any existing backend/database integration.
2. Read existing `README`, package manifests, and project conventions. Do not print or expose secret values from `.env` files.
3. If an app already exists, preserve useful functionality and adapt it; do not replace it blindly.
4. Write a concise implementation checklist and then implement in vertical slices.
5. Keep the app runnable after each phase. Run lint, typecheck, tests, and production build where available.
6. If Clerk/Supabase credentials are absent, implement configuration validation and a clear setup guide. Never invent real credentials or claim external services have been connected.
7. Do not stop after writing a plan, scaffolding files, or creating static mockups. Complete the working implementation to the extent the environment permits, and report anything blocked by credentials or external dashboard configuration.

---

## 4. User roles and access

For the MVP, use a single user-owned workspace and leave room for organizations later.

- **Workspace owner:** can create, configure, run, pause, reset, and delete their own simulations.
- **Viewer (optional MVP+):** can view runs explicitly shared with them.
- Enforce ownership and permissions in database policies and API handlers—not just by hiding buttons.
- Use the authenticated Clerk user ID as the stable external user identifier.
- Add organization/role support only if it can be implemented securely without delaying the core simulation.

Do not store Clerk secrets or Supabase service-role keys in client-side code. Any privileged server operation must validate the user and authorization before accessing data.

---

## 5. Main application routes

Implement a cohesive route structure; adjust names to existing project conventions if needed.

- `/` — landing / product overview
- `/app` — overview dashboard and recent simulation runs
- `/app/simulations/new` — scenario setup
- `/app/simulations/:simulationId` — live 3D command center
- `/app/simulations/:simulationId/events` — event and agent decision timeline
- `/app/simulations/:simulationId/analytics` — outcome metrics and comparisons
- `/app/resources` — resource inventory overview
- `/app/settings` — user/workspace preferences

Protect private routes with Clerk. Signed-out users should be directed to sign-in and returned to their intended destination after authentication.

---

## 6. UX and visual direction

### Design principles
- Futuristic emergency operations center; serious, professional, high contrast.
- Dark interface by default, with restrained cyan/blue for system activity, amber for warnings, red for critical events, green for feasible/successful deliveries.
- Use clear typography, generous spacing, restrained glow, subtle borders, and purposeful motion.
- Avoid a generic admin template, excessive glassmorphism, excessive gradients, meaningless counters, and decorative charts with fake data.
- Accessibility: keyboard navigation, focus states, semantic landmarks, readable contrast, reduced-motion support, and text labels in addition to color.
- Provide loading, empty, error, and disconnected states. Make the layout usable on laptop and tablet; mobile can be a simplified responsive view.

### Live command center layout
1. **Top bar:** ARES brand, scenario name, status (Ready/Running/Paused/Completed), simulated time, play/pause, step, reset, speed selector, user profile.
2. **Left rail/panel:** incident severity, affected population, critical requests, active alerts, resources at risk.
3. **Center:** interactive 3D city and logistics network.
4. **Right panel:** selected facility/vehicle details, inventory, projected shortages, agent reasoning, proposed action, and validation status.
5. **Bottom timeline:** simulation events and delivery progress; expand/collapse for details.

### 3D scene
Use a clear, legible synthetic city rather than requiring real GIS data:
- A ground plane with roads, intersections, blocks, rivers/flood zones, and district labels.
- Facility markers: emergency centers, warehouses, hospitals, shelters.
- Vehicles moving along road paths.
- Routes styled by state: active, proposed, completed, blocked. Add a legend; do not rely on color alone.
- Incident markers and translucent hazard zones.
- Clickable entities with selection/highlighting and a details panel.
- Camera controls: orbit, pan, zoom, reset view, and “focus selected.”
- Add a 2D/list fallback if WebGL is unavailable or reduced motion is enabled.
- Optimize draw calls and avoid unnecessary per-frame React re-renders.

---

## 7. Simulation model

All simulation time is separate from wall-clock time. A simulation tick should be deterministic for a fixed seed and set of inputs.

### Entities

**Facility**
- `id`, `name`, `type` (`response_center`, `warehouse`, `hospital`, `shelter`)
- map coordinates / scene coordinates
- inventory by resource type
- storage capacity (optional)
- priority / criticality
- affected population (where relevant)
- consumption or demand model
- operational status

**Resource type**
- `id`, `name`, `unit`
- category (food, water, medicine, medical oxygen, blankets, fuel, rescue equipment)
- shelf life/perishability only if implemented consistently
- criticality and allowed handling rules

**Vehicle**
- `id`, `type`, `capacity` (use consistent capacity units or multidimensional load constraints)
- speed, current position, availability
- current route and delivery assignment
- operational status

**Road edge**
- `from_node`, `to_node`, distance, travel-time estimate, status (`open`, `slow`, `blocked`)
- optional hazard exposure cost
- ensure blocked roads cannot be used by the route planner

**Request**
- `id`, requesting facility, resource, quantity, urgency, created tick, deadline/need-by tick, status
- requested quantities cannot be silently overfilled
- requests can be partially fulfilled when supply is insufficient

**Transfer / delivery**
- source, destination, resource, quantity, vehicle, route, estimated arrival tick, status
- inventory is reserved or deducted consistently; never duplicate resources during reroutes
- arrival updates destination inventory and request fulfillment exactly once

**Incident**
- type, location/area, start tick, severity, duration or resolution trigger, effects
- examples: flood zone expands, road closure, demand spike, warehouse outage, vehicle breakdown

**Agent decision / event**
- simulation tick, agent type, action, input facts, rationale, proposed plan, validation result, resulting state changes
- persist a concise, auditable record; avoid saving chain-of-thought. Store action summaries and relevant facts, not hidden internal reasoning.

### Resource accounting invariants
- Total available resources must not increase unless an explicit supply-generation/restock event is configured.
- A transfer cannot exceed available, unreserved source inventory.
- A delivery cannot exceed vehicle capacity or permitted resource constraints.
- Blocked roads cannot appear in a feasible route.
- A failed/cancelled transfer must release its reservation correctly.
- Arrival and fulfillment events must be idempotent.
- Demand, consumption, shortage, and wastage must use consistent units.
- Every metric must be calculated from simulation events/state, not hard-coded.
- Validate all agent proposals before applying them.

---

## 8. Agent architecture

Implement transparent, bounded agent roles. The simulation engine—not an LLM—must be authoritative for resource quantities, feasibility, inventory changes, travel time, and scoring.

### Required agents

1. **Disaster Coordinator**
   - Calculates incident/facility priorities.
   - Resolves conflicts between urgent requests.
   - Selects or approves a feasible allocation plan.
   - Prevents lower-priority demand from consuming resources needed for defined critical thresholds where possible.

2. **Hospital Agent**
   - Estimates consumption and time-to-shortage.
   - Creates or updates requests for medical supplies.
   - Reports urgency based on remaining stock and projected demand.

3. **Shelter Agent**
   - Estimates food/water/blanket demand using population and consumption assumptions.
   - Creates requests and identifies surplus only when it is genuinely safe to share.

4. **Logistics Agent**
   - Finds feasible routes on the current road graph.
   - Accounts for closures, slow roads, vehicle availability, load capacity, and estimated travel time.
   - Replans active deliveries after relevant road/incident changes.

5. **Resource Marketplace Agent**
   - Matches eligible surplus with unmet demand.
   - Generates candidate transfers and prioritizes them by urgency, distance/time, shortage risk, resource availability, and transport cost.
   - No real money, cryptocurrency, or real-world purchase flow is needed. “Marketplace” means a simulated exchange/transfer coordination layer.

### Decision pipeline
1. Observe current simulation state.
2. Generate requests and candidate transfers.
3. Calculate facility priority and shortage risk.
4. Optimize candidate allocations/routes subject to constraints.
5. Validate against authoritative state and resource invariants.
6. Commit valid actions atomically.
7. Emit events and update the UI.
8. Re-evaluate when new incidents or material state changes occur.

### AI/LLM usage
- First make rule-based agents and optimization work end-to-end.
- If an LLM is configured later, use it for concise natural-language explanations, scenario suggestions, or proposing candidate actions in a strict schema.
- Validate all model output against typed schemas and the authoritative constraints engine.
- If the model is unavailable, the simulation must continue using deterministic rules.
- Do not make the LLM responsible for inventory arithmetic, shortest-path guarantees, or safety-critical authorization.
- Show “why this action was selected” as a short factual explanation based on computed factors, not fabricated confidence or hidden chain-of-thought.

---

## 9. Allocation and routing rules

Build a documented scoring function that is understandable and tunable. Example dimensions:

- urgency / severity
- time until projected shortage
- number of people affected
- facility criticality
- request age and deadline
- quantity available and source reserve threshold
- travel time / distance
- vehicle capacity and availability
- route risk and closure status
- forecast demand during the delivery window

Normalize score components and expose weights in scenario settings if time allows. Avoid allowing distance alone to override a life-critical shortage.

Use Google OR-Tools if practical for vehicle routing and constrained allocation. If a full optimization model is too large for the MVP, implement a deterministic greedy baseline plus route search and document its limitations. Never label a heuristic as globally optimal.

### Route behavior
- Build a graph of road nodes and edges.
- Use Dijkstra or A* for shortest feasible routes with dynamic edge weights.
- Exclude blocked edges; penalize slow or hazardous edges.
- Recalculate routes after road-state changes.
- Replanning must not duplicate deliveries or reservations.

---

## 10. Required simulation scenarios

Ship at least three seeded scenarios:

### Scenario A — Urban flood
- Multiple shelters, hospitals, warehouses, and response centers.
- Flood expands and closes roads over time.
- Food, water, and medical requests compete for limited inventory.

### Scenario B — Hospital supply shortage
- A hospital's medicine/oxygen stock is low.
- One nearby warehouse has partial stock; a farther center has surplus.
- Demonstrate prioritization, partial fulfillment, and routing trade-offs.

### Scenario C — Compound disruption
- A warehouse becomes unavailable while a key road closes and demand increases.
- Show the system re-planning deliveries and updating risk metrics.

Each scenario must include a description, initial conditions, seed, event schedule, and expected behaviors. Include a “reset to initial state” operation.

### User-triggered events
Allow the user to:
- close/reopen a road
- create a demand spike at a facility
- disable/restore a warehouse
- simulate a vehicle breakdown
- trigger a new incident
- advance one tick or run/pause the simulation
- adjust simulation speed

Validate event parameters and show a confirmation when an action may significantly change a run.

---

## 11. Analytics and fair baseline comparison

Display metrics computed from the simulation:
- critical demand fulfilled (%)
- total unmet demand by resource and facility
- average and critical-request fulfillment time
- number of requests fully/partially/unfulfilled
- successful, active, delayed, and failed deliveries
- resource wastage, if modeled
- vehicles utilized and average route time
- predicted shortages avoided (only when measured against a defined baseline)
- allocation fairness across facilities/populations, with a documented formula

### Baseline comparison
Run the same initial scenario, seed, and event schedule using:
1. **Baseline:** simple nearest-available-source or first-come-first-served policy.
2. **ARES coordination:** priority-aware allocation and dynamic route re-planning.

Show a side-by-side table and charts. Make clear which metrics are better when higher or lower. Never hard-code a claimed improvement percentage. If results do not improve, show the actual result and explain the trade-off.

---

## 12. Database design

Use SQL migrations and RLS. Adapt schema names as needed, but preserve ownership, auditability, and consistency.

Suggested tables:
- `workspaces` — id, name, owner_clerk_user_id, created_at
- `workspace_members` — workspace_id, clerk_user_id, role (only if membership is implemented)
- `simulations` — id, workspace_id, owner_clerk_user_id, name, scenario_key, seed, status, simulated_tick, config JSONB, created_at, updated_at
- `simulation_facilities` — simulation_id, facility_id, state JSONB or normalized inventory relations
- `simulation_events` — id, simulation_id, tick, event_type, payload JSONB, created_at
- `agent_decisions` — id, simulation_id, tick, agent_type, action_type, summary, facts JSONB, proposal JSONB, validation_status, created_at
- `simulation_snapshots` — id, simulation_id, tick, state JSONB, created_at
- `simulation_metrics` — id, simulation_id, tick, metrics JSONB, created_at
- `shared_simulations` — optional, only if sharing is implemented

For a fast MVP, simulation state can be stored in a versioned JSONB snapshot, while important events and decisions are normalized. Avoid premature over-normalization, but add indexes on simulation IDs and tick/time columns.

### RLS/security
- Enable RLS on every user/workspace-scoped table.
- Policies must check that the authenticated Clerk identity owns the row or is an authorized workspace member.
- Configure Clerk as Supabase's third-party auth provider and use Clerk session tokens through the supported Supabase client integration.
- Test cross-user isolation with two separate test accounts.
- Do not assume client-side route guards are database security.
- Server-side simulation endpoints must validate the user's identity and ownership before loading or mutating a run.
- Never use a service-role key in the browser.
- Validate JSON payloads and enforce payload size limits.

### Data persistence strategy
- Persist scenario configuration and seed at run creation.
- Persist event log and periodic snapshots.
- Do not write a database row for every animation frame.
- Use realtime for meaningful events and run status updates; animate vehicles locally between authoritative state updates.
- Add snapshot/version fields so old runs remain interpretable if the simulation schema changes.

---

## 13. Realtime and state synchronization

- The simulation engine owns the authoritative simulation state.
- The frontend sends commands: create run, start, pause, step, reset, trigger event, request snapshot.
- The engine returns validated state snapshots and events.
- Use WebSocket events for live updates if a backend service is present; otherwise use a clearly defined polling/Realtime strategy for the first slice.
- Include sequence numbers or tick IDs to detect out-of-order/duplicate updates.
- Make pause/reset/restart idempotent.
- Reconnecting clients should fetch the latest snapshot and then resume updates.
- UI animation must not be the source of truth for inventory, routes, or metrics.

---

## 14. Error, loading, and empty states

Implement clear handling for:
- missing Clerk publishable key
- missing Supabase URL/publishable key
- unavailable database
- failed sign-in
- expired session
- failed simulation start
- backend disconnected
- stale/reordered realtime event
- invalid user-triggered event
- WebGL unsupported
- empty run history
- failed optimization / no feasible route
- partial resource availability

Never display “success” before the operation has succeeded. Provide retry and recovery paths where reasonable. Never silently substitute mock values in a production-connected view; label demo/synthetic data explicitly.

---

## 15. Environment configuration

Create `.env.example` with placeholders only, based on the actual client/server split. Example names:

```dotenv
# Browser-visible values only
VITE_CLERK_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# Server-side only; never expose these with VITE_ prefix
SUPABASE_SECRET_KEY=
SUPABASE_DB_URL=
ARES_API_URL=http://localhost:8000
```

Use only variables that the implemented code actually needs. Confirm current Supabase key naming in the official docs and use the supported publishable key. Do not place Clerk secret keys or Supabase secret/service-role keys in any `VITE_` variable. Add startup validation with a helpful error message. Add `.env*` secrets to `.gitignore` while keeping `.env.example` tracked.

---

## 16. Testing and acceptance criteria

### Authentication and authorization
- Signed-out users cannot access private app routes.
- Sign-in, sign-up, sign-out, and profile controls work.
- A user can only read/mutate their own simulations.
- RLS prevents cross-user reads/writes even if a request is manually issued.
- No secret keys appear in the built frontend bundle.

### Simulation correctness
- Same seed/config produces the same initial state and event sequence.
- Inventory is never negative.
- Resource conservation holds unless an explicit restock/consumption/wastage event explains the change.
- Transfers cannot exceed available inventory or vehicle capacity.
- Blocked roads are excluded from feasible routes.
- Arrival events apply exactly once.
- Failed/cancelled transfers release reserved resources.
- Reset returns to the exact seeded initial state.
- Pausing stops simulation ticks; stepping advances exactly one tick.
- Metrics are derived from state/events.
- Baseline and ARES comparisons use equivalent initial conditions and event schedules.

### UX
- User can create and run each seeded scenario without editing code.
- The 3D map displays facilities, hazard zones, roads, routes, and moving vehicles.
- Clicking a facility/vehicle shows correct current details.
- User-triggered events update the simulation and trigger re-planning where applicable.
- The event timeline explains each material decision with factual inputs and outcomes.
- Responsive layout, keyboard focus, and error/loading states work.
- Provide a useful non-WebGL fallback.

### Engineering
- TypeScript typecheck passes.
- Lint passes.
- Unit and integration tests pass.
- Production build succeeds.
- Migrations apply cleanly to a fresh Supabase project.
- README explains setup, Clerk/Supabase configuration, migrations, API startup, tests, and deployment.

---

## 17. Implementation phases

### Phase 0 — Inspect and plan
- Inspect repo and dependencies.
- Preserve current project conventions.
- Create a checklist and record architectural decisions.
- Confirm how the current Vite version and Clerk React SDK should be installed using official docs.

### Phase 1 — App shell and visual foundation
- Establish routes, design tokens, navigation, responsive layout, reusable panels, status badges, dialogs, toasts, and skeletons.
- Add Clerk provider and protected routes, with graceful missing-key handling.
- Build overview and scenario setup screens using clearly labeled sample data only where needed.

### Phase 2 — Deterministic simulation core
- Implement typed entities, seeded scenarios, simulation clock, resource consumption, requests, incidents, transfers, deliveries, route graph, and invariants.
- Add unit tests before integrating the visual scene.
- Demonstrate pause, step, reset, and user-triggered events.

### Phase 3 — Allocation and logistics
- Implement baseline policy.
- Implement priority-aware allocation and route re-planning.
- Integrate OR-Tools if feasible; otherwise use a documented deterministic heuristic.
- Validate every proposal before committing state.

### Phase 4 — 3D digital twin
- Render the synthetic city, facilities, roads, incidents, vehicles, and route states.
- Add selection, camera controls, details panels, legend, and fallback.
- Animate from authoritative simulation snapshots without changing simulation truth.

### Phase 5 — Agent decisions and event timeline
- Implement the five bounded agent roles.
- Record concise factual explanations and validation outcomes.
- Display requests, proposals, accepted/rejected actions, deliveries, and replanning events.
- Keep the core functional without an LLM.

### Phase 6 — Supabase persistence and security
- Create SQL migrations, RLS policies, indexes, and typed data access.
- Configure Clerk third-party auth integration and Clerk-token-aware Supabase client.
- Persist simulations, snapshots, events, decisions, and metrics.
- Verify ownership and cross-user isolation.

### Phase 7 — Realtime and analytics
- Stream tick/event updates.
- Add reconnection/snapshot recovery.
- Add analytics and fair baseline comparison.
- Verify metrics against known test scenarios.

### Phase 8 — Hardening and delivery
- Run all checks.
- Fix defects rather than suppressing errors.
- Add README, `.env.example`, migration/setup guide, and deployment instructions.
- Provide a final summary of delivered features, tests run, setup actions still needed in Clerk/Supabase dashboards, and known limitations.

---

## 18. Definition of done

The project is complete only when a user can:

1. Sign in with Clerk.
2. Create or choose a seeded disaster scenario.
3. Start, pause, step, and reset a simulation.
4. See a 3D city with live facilities, roads, hazards, vehicles, and deliveries.
5. Trigger a road closure or demand spike and see a feasible re-plan.
6. Read an event timeline explaining what the agents did and which constraints were checked.
7. See real, computed metrics and compare ARES with the baseline.
8. Save and reopen a run with data isolated to the correct user/workspace.
9. Run the documented tests and production build successfully.

If something is blocked by missing credentials or dashboard configuration, finish the rest of the implementation, document the exact manual step, and do not claim the integration is live.

---

## 19. Agent execution instructions

Work autonomously but in small, verifiable increments.

- Start by inspecting the repo and writing a checklist.
- Do not ask questions for decisions already specified here; choose sensible defaults.
- Do not create a giant monolithic component. Separate simulation domain logic, API/data access, state management, and presentation.
- Use strict types; avoid `any` except at unavoidable external boundaries with validation.
- Avoid placeholder buttons and nonfunctional controls. Every visible action must work or be explicitly disabled with an explanation.
- Avoid fake live data once the real simulation engine is running.
- Do not fabricate API responses, benchmark results, or AI capabilities.
- Add tests for every critical invariant and every bug fixed.
- Keep the app runnable at the end of each phase.
- If you must make a trade-off, prioritize: simulation correctness → end-to-end functionality → security → live visualization → polish.
- At completion, report what works, commands executed, test/build results, environment variables required, manual Clerk/Supabase dashboard steps, and known limitations.
