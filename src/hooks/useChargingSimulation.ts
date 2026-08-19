import { useCallback, useEffect, useRef, useState } from 'react';
import { hardware, TICK_MS } from '@/services/hardware';
import type { LiveMetrics } from '@/types';

const IDLE: LiveMetrics = {
  voltage: 0, current: 0, power: 0, energy: 0, temperature: 0, durationSec: 0, cost: 0,
};

/**
 * Drives the live charging simulation. Only one timer runs at a time.
 */
export function useChargingSimulation(tariff: number, serviceFee: number) {
  const [metrics, setMetrics] = useState<LiveMetrics>(IDLE);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setMetrics(hardware.getLiveMetrics());
  }, []);

  const start = useCallback(() => {
    if (hardware.isRunning()) return;
    hardware.startSession(tariff, serviceFee);
    setRunning(true);
    setMetrics(hardware.getLiveMetrics());
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(tick, TICK_MS);
  }, [tariff, serviceFee, tick]);

  const stop = useCallback((): LiveMetrics => {
    const final = hardware.stopSession();
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setMetrics(final);
    setRunning(false);
    return final;
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return { metrics, running, start, stop };
}
