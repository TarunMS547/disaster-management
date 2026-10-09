import { SimulationState } from '../types/simulation';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface SavedSimulationSummary {
  id: string;
  name: string;
  scenarioKey: string;
  seed: number;
  status: string;
  currentTick: number;
  criticalDemandPercent: number;
  updatedAt: string;
}

const LOCAL_STORAGE_KEY = 'ares_simulations_v1';

export class StorageService {
  /**
   * Save a simulation state to Supabase or local storage
   */
  public static async saveSimulation(
    state: SimulationState,
    userId: string = 'local-user',
    clerkToken?: string | null
  ): Promise<boolean> {
    const supabase = getSupabaseClient(clerkToken);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: simError } = await supabase.from('simulations').upsert({
          id: state.id,
          name: state.name,
          scenario_key: state.scenarioKey,
          seed: state.seed,
          status: state.status,
          simulated_tick: state.currentTick,
          owner_clerk_user_id: userId,
          config: {
            speed: state.tickSpeedMultiplier,
          },
          updated_at: new Date().toISOString(),
        });

        if (simError) {
          console.error('Failed to save simulation to Supabase:', simError);
          // Fall back to local storage
          this.saveLocally(state);
          return false;
        }

        // Save current snapshot
        await supabase.from('simulation_snapshots').insert({
          simulation_id: state.id,
          tick: state.currentTick,
          state: state,
        });

        return true;
      } catch (err) {
        console.error('Supabase save error:', err);
        this.saveLocally(state);
        return false;
      }
    } else {
      this.saveLocally(state);
      return true;
    }
  }

  /**
   * List all saved simulations
   */
  public static async listSimulations(
    userId: string = 'local-user',
    clerkToken?: string | null
  ): Promise<SavedSimulationSummary[]> {
    const supabase = getSupabaseClient(clerkToken);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('simulations')
          .select('*')
          .eq('owner_clerk_user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            name: item.name,
            scenarioKey: item.scenario_key,
            seed: item.seed,
            status: item.status,
            currentTick: item.simulated_tick,
            criticalDemandPercent: 100,
            updatedAt: item.updated_at,
          }));
        }
      } catch (err) {
        console.error('Supabase list error:', err);
      }
    }

    return this.listLocally();
  }

  /**
   * Load simulation state
   */
  public static async loadSimulation(
    id: string,
    clerkToken?: string | null
  ): Promise<SimulationState | null> {
    const supabase = getSupabaseClient(clerkToken);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('simulation_snapshots')
          .select('state')
          .eq('simulation_id', id)
          .order('tick', { ascending: false })
          .limit(1)
          .single();

        if (!error && data && data.state) {
          return data.state as SimulationState;
        }
      } catch (err) {
        console.error('Supabase load error:', err);
      }
    }

    return this.loadLocally(id);
  }

  private static saveLocally(state: SimulationState): void {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const items: Record<string, SimulationState> = stored ? JSON.parse(stored) : {};
      items[state.id] = state;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Local storage write failed:', e);
    }
  }

  private static listLocally(): SavedSimulationSummary[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return [];
      const items: Record<string, SimulationState> = JSON.parse(stored);
      return Object.values(items).map(s => ({
        id: s.id,
        name: s.name,
        scenarioKey: s.scenarioKey,
        seed: s.seed,
        status: s.status,
        currentTick: s.currentTick,
        criticalDemandPercent: s.metrics?.criticalDemandFulfilledPercent ?? 100,
        updatedAt: s.events[0]?.timestamp || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  private static loadLocally(id: string): SimulationState | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return null;
      const items: Record<string, SimulationState> = JSON.parse(stored);
      return items[id] || null;
    } catch {
      return null;
    }
  }
}
