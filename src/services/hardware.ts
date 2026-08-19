import type { LiveMetrics } from '@/types';

/**
 * HardwareService — abstraction over the smart charging adapter.
 *
 * Current implementation: software simulation with realistic noise.
 * Future: replace getLiveMetrics()/startSession()/stopSession() with
 * calls to an ESP32 / smart energy meter over MQTT or REST.
 */
export interface HardwareService {
  getLiveMetrics(): LiveMetrics;
  startSession(tariff: number, serviceFee: number): void;
  stopSession(): LiveMetrics;
  isRunning(): boolean;
}

const TICK_MS = 2000;

class SimulatedHardwareService implements HardwareService {
  private voltage = 230;
  private current = 12.35;
  private energy = 0;
  private startTime = 0;
  private tariff = 9;
  private serviceFee = 2;
  private running = false;
  private temperature = 34.2;

  startSession(tariff: number, serviceFee: number) {
    this.tariff = tariff;
    this.serviceFee = serviceFee;
    this.energy = 0;
    this.startTime = Date.now();
    this.running = true;
    this.current = 12 + Math.random() * 2;
  }

  stopSession(): LiveMetrics {
    const m = this.getLiveMetrics();
    this.running = false;
    return m;
  }

  isRunning() {
    return this.running;
  }

  getLiveMetrics(): LiveMetrics {
    if (this.running) {
      // Add small realistic fluctuation
      this.voltage = 228 + Math.random() * 4;
      this.current = 11.8 + Math.random() * 2.2;
      this.temperature = 33 + Math.random() * 3;

      const elapsedSec = (Date.now() - this.startTime) / 1000;
      // Increment energy by power * tick interval (hours)
      const powerKW = (this.voltage * this.current) / 1000;
      const tickHours = TICK_MS / 3600000;
      this.energy += powerKW * tickHours;
      const cost = this.energy * this.tariff + this.serviceFee;

      return {
        voltage: +this.voltage.toFixed(1),
        current: +this.current.toFixed(2),
        power: +powerKW.toFixed(2),
        energy: +this.energy.toFixed(3),
        temperature: +this.temperature.toFixed(1),
        durationSec: Math.floor(elapsedSec),
        cost: +cost.toFixed(2),
      };
    }

    const powerKW = (this.voltage * this.current) / 1000;
    return {
      voltage: +this.voltage.toFixed(1),
      current: +this.current.toFixed(2),
      power: +powerKW.toFixed(2),
      energy: +this.energy.toFixed(3),
      temperature: +this.temperature.toFixed(1),
      durationSec: Math.floor((Date.now() - this.startTime) / 1000),
      cost: +(this.energy * this.tariff + this.serviceFee).toFixed(2),
    };
  }
}

export const hardware: HardwareService = new SimulatedHardwareService();
export { TICK_MS };
