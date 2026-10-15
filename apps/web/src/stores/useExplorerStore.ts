import { create } from 'zustand';

export const TIME_SPEEDS = [
  { id: 'paused', label: 'Paused', multiplier: 0 },
  { id: 'realtime', label: 'Real time', multiplier: 1 },
  { id: 'hour', label: '1 hour / sec', multiplier: 3_600 },
  { id: 'day', label: '1 day / sec', multiplier: 86_400 },
  { id: 'month', label: '1 month / sec', multiplier: 2_592_000 },
  { id: 'year', label: '1 year / sec', multiplier: 31_557_600 }
] as const;

export type TimeSpeedId = (typeof TIME_SPEEDS)[number]['id'];
export type GraphicsMode = 'auto' | 'low' | 'medium' | 'high' | 'ultra';

interface ExplorerState {
  selectedObjectId: string;
  simulationTime: number;
  timeSpeed: TimeSpeedId;
  graphicsMode: GraphicsMode;
  accessibleMode: boolean;
  reverseTime: boolean;
  cameraResetVersion: number;
  focusVersion: number;
  selectObject: (id: string) => void;
  setSimulationTime: (time: number) => void;
  setTimeSpeed: (speed: TimeSpeedId) => void;
  advanceTime: (seconds: number) => void;
  setGraphicsMode: (mode: GraphicsMode) => void;
  toggleAccessibleMode: () => void;
  toggleReverseTime: () => void;
  resetCamera: () => void;
}

const storedGraphicsMode = (() => {
  try {
    const stored = localStorage.getItem('nexsolarix.graphics-mode');
    if (stored === 'low' || stored === 'medium' || stored === 'high' || stored === 'ultra' || stored === 'auto') return stored;
  } catch {
    // Storage may be unavailable in private browsing; use the automatic default.
  }
  return 'auto' as GraphicsMode;
})();

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  selectedObjectId: 'earth',
  simulationTime: Date.now(),
  timeSpeed: 'paused',
  graphicsMode: storedGraphicsMode,
  accessibleMode: false,
  reverseTime: false,
  cameraResetVersion: 0,
  focusVersion: 0,
  selectObject: (id) => set((state) => ({ selectedObjectId: id, focusVersion: state.focusVersion + 1 })),
  setSimulationTime: (time) => set({ simulationTime: time }),
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  advanceTime: (seconds) => {
    const speed = TIME_SPEEDS.find((option) => option.id === get().timeSpeed)?.multiplier ?? 0;
    if (speed !== 0 && Number.isFinite(seconds)) set((state) => ({ simulationTime: state.simulationTime + seconds * speed * 1000 * (state.reverseTime ? -1 : 1) }));
  },
  setGraphicsMode: (mode) => {
    try {
      localStorage.setItem('nexsolarix.graphics-mode', mode);
    } catch {
      // The setting is still applied for the current session if storage is unavailable.
    }
    set({ graphicsMode: mode });
  },
  toggleAccessibleMode: () => set((state) => ({ accessibleMode: !state.accessibleMode })),
  toggleReverseTime: () => set((state) => ({ reverseTime: !state.reverseTime })),
  resetCamera: () => set((state) => ({ cameraResetVersion: state.cameraResetVersion + 1 }))
}));
