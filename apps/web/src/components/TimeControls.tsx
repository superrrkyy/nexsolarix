import { useMemo } from 'react';
import { CalendarClock, FastForward, Pause, Play, RotateCcw } from 'lucide-react';
import { TIME_SPEEDS, useExplorerStore } from '../stores/useExplorerStore';

function formatSimulationDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(timestamp));
}

export function TimeControls({ compact = false, showGraphics = false }: { compact?: boolean; showGraphics?: boolean }) {
  const simulationTime = useExplorerStore((state) => state.simulationTime);
  const timeSpeed = useExplorerStore((state) => state.timeSpeed);
  const reverseTime = useExplorerStore((state) => state.reverseTime);
  const graphicsMode = useExplorerStore((state) => state.graphicsMode);
  const setSimulationTime = useExplorerStore((state) => state.setSimulationTime);
  const setTimeSpeed = useExplorerStore((state) => state.setTimeSpeed);
  const toggleReverseTime = useExplorerStore((state) => state.toggleReverseTime);
  const setGraphicsMode = useExplorerStore((state) => state.setGraphicsMode);
  const formatted = useMemo(() => formatSimulationDate(simulationTime), [simulationTime]);
  const dateValue = useMemo(() => new Date(simulationTime).toISOString().slice(0, 10), [simulationTime]);

  const togglePlayback = () => setTimeSpeed(timeSpeed === 'paused' ? 'day' : 'paused');
  const chooseDate = (value: string) => {
    if (!value) return;
    const timestamp = Date.parse(`${value}T12:00:00.000Z`);
    if (Number.isFinite(timestamp)) setSimulationTime(timestamp);
  };

  return (
    <div className={`time-controls${compact ? ' time-controls--compact' : ''}`} role="group" aria-label="Simulation time controls">
      <div className="time-readout">
        <span className="time-readout-icon"><CalendarClock size={16} /></span>
        <span className="time-readout-copy"><small>SIMULATION DATE</small><strong>{formatted}</strong></span>
      </div>
      <div className="time-divider" />
      <button className={`time-play${timeSpeed !== 'paused' ? ' is-playing' : ''}`} type="button" onClick={togglePlayback} aria-label={timeSpeed === 'paused' ? 'Start simulation time' : 'Pause simulation time'}>
        {timeSpeed === 'paused' ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
      </button>
      <button className={`time-direction${reverseTime ? ' is-active' : ''}`} type="button" onClick={toggleReverseTime} aria-pressed={reverseTime} aria-label={reverseTime ? 'Switch to forward time' : 'Reverse simulation time'} title={reverseTime ? 'Reverse time is on' : 'Reverse time'}>
        <FastForward size={15} className={reverseTime ? 'reverse-icon' : ''} />
      </button>
      <label className="time-speed-label">
        <span className="sr-only">Simulation speed</span>
        <select value={timeSpeed} onChange={(event) => setTimeSpeed(event.target.value as typeof timeSpeed)} aria-label="Simulation speed">
          {TIME_SPEEDS.map((speed) => <option key={speed.id} value={speed.id}>{speed.id === 'paused' ? 'Paused' : speed.label}</option>)}
        </select>
      </label>
      <label className="date-picker-label" title="Choose a simulation date">
        <span className="sr-only">Choose a simulation date</span>
        <input type="date" value={dateValue} onChange={(event) => chooseDate(event.target.value)} aria-label="Choose a simulation date" />
      </label>
      <button className="time-now" type="button" onClick={() => { setSimulationTime(Date.now()); setTimeSpeed('paused'); }}>Now</button>
      {showGraphics && (
        <label className="graphics-select-label">
          <span className="sr-only">Graphics quality</span>
          <select value={graphicsMode} onChange={(event) => setGraphicsMode(event.target.value as typeof graphicsMode)} aria-label="Graphics quality">
            <option value="auto">Auto graphics</option><option value="low">Low graphics</option><option value="medium">Medium graphics</option><option value="high">High graphics</option><option value="ultra">Ultra graphics</option>
          </select>
        </label>
      )}
      <button className="reset-view" type="button" onClick={() => useExplorerStore.getState().resetCamera()} aria-label="Reset camera view" title="Reset camera view">
        <RotateCcw size={15} /><span>Reset view</span>
      </button>
    </div>
  );
}
