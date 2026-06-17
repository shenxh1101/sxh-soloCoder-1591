import { useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { SIMULATION_CONFIG } from '../utils/constants';

export function useSimulationLoop() {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const simulationTick = useSimulationStore((state) => state.simulationTick);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        simulationTick();
      }, SIMULATION_CONFIG.tickInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, simulationTick]);

  return { isRunning };
}
