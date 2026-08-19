export type Role = 'ev' | 'owner';

export type ChargerStatus = 'online' | 'offline' | 'charging';
export type SessionStatus = 'charging' | 'completed' | 'idle';
export type PaymentStatus = 'paid' | 'pending';
export type PaymentMethod = 'UPI' | 'Wallet' | 'Cash';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  vehicle: string;
}

export interface Charger {
  id: string;
  name: string;
  location: string;
  status: ChargerStatus;
  powerRating: number; // kW
  tariff: number; // ₹/kWh
  totalEnergy: number; // kWh lifetime
  totalSessions: number;
  ownerId: string;
}

export interface ChargingSession {
  id: string;
  userId: string;
  userName: string;
  chargerId: string;
  chargerName: string;
  startTime: number; // epoch ms
  endTime: number | null;
  durationSec: number;
  energyConsumed: number; // kWh
  tariff: number; // ₹/kWh
  energyCost: number;
  serviceFee: number;
  totalCost: number;
  status: SessionStatus;
}

export interface Payment {
  id: string;
  sessionId: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  status: PaymentStatus;
  timestamp: number;
}

export interface LiveMetrics {
  voltage: number;   // V
  current: number;   // A
  power: number;     // kW
  energy: number;    // kWh accumulated
  temperature: number; // °C
  durationSec: number;
  cost: number;
}
