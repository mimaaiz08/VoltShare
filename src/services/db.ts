import type { User, Charger, ChargingSession, Payment } from '@/types';
import { genSessionId, genTransactionId } from '@/utils/format';

const STORAGE_KEY = 'voltshare_db_v1';

export interface DBShape {
  users: User[];
  chargers: Charger[];
  sessions: ChargingSession[];
  payments: Payment[];
}

const OWNER_ID = 'usr_owner_1';
const EV_USER_ID = 'usr_ev_1';

function seed(): DBShape {
  const now = Date.now();
  const day = 86400000;

  const users: User[] = [
    {
      id: EV_USER_ID,
      name: 'Arjun Rao',
      email: 'demo@voltshare.com',
      role: 'ev',
      phone: '+91 98765 43210',
      vehicle: 'Tata Nexon EV',
    },
    {
      id: OWNER_ID,
      name: 'Priya Shenoy',
      email: 'owner@voltshare.com',
      role: 'owner',
      phone: '+91 90080 12345',
      vehicle: 'MG ZS EV',
    },
  ];

  const chargers: Charger[] = [
    {
      id: 'chg_1',
      name: 'VoltShare Home Charger',
      location: 'Kadri, Mangaluru',
      status: 'online',
      powerRating: 7.2,
      tariff: 9,
      totalEnergy: 412.6,
      totalSessions: 48,
      ownerId: OWNER_ID,
    },
    {
      id: 'chg_2',
      name: 'VoltShare Office Charger',
      location: 'Baikampady, Mangaluru',
      status: 'online',
      powerRating: 11,
      tariff: 8.5,
      totalEnergy: 684.2,
      totalSessions: 73,
      ownerId: OWNER_ID,
    },
    {
      id: 'chg_3',
      name: 'VoltShare Campus Charger',
      location: 'MIT, Manipal',
      status: 'offline',
      powerRating: 22,
      tariff: 7.5,
      totalEnergy: 1289.4,
      totalSessions: 156,
      ownerId: OWNER_ID,
    },
  ];

  const mkSession = (
    id: string,
    chargerId: string,
    chargerName: string,
    tariff: number,
    daysAgo: number,
    durationH: number,
    energy: number,
    paid: boolean
  ): ChargingSession => {
    const start = now - daysAgo * day;
    const durationSec = Math.round(durationH * 3600);
    const end = start + durationSec * 1000;
    const energyCost = +(energy * tariff).toFixed(2);
    const serviceFee = 2;
    const totalCost = +(energyCost + serviceFee).toFixed(2);
    return {
      id,
      userId: EV_USER_ID,
      userName: 'Arjun Rao',
      chargerId,
      chargerName,
      startTime: start,
      endTime: end,
      durationSec,
      energyConsumed: energy,
      tariff,
      energyCost,
      serviceFee,
      totalCost,
      status: 'completed',
    };
  };

  const sessions: ChargingSession[] = [
    mkSession(genSessionId(), 'chg_1', 'VoltShare Home Charger', 9, 1, 1.7, 4.82, true),
    mkSession(genSessionId(), 'chg_1', 'VoltShare Home Charger', 9, 2, 2.52, 7.21, true),
    mkSession(genSessionId(), 'chg_2', 'VoltShare Office Charger', 8.5, 3, 1.85, 5.4, false),
    mkSession(genSessionId(), 'chg_1', 'VoltShare Home Charger', 9, 4, 1.15, 3.18, true),
    mkSession(genSessionId(), 'chg_2', 'VoltShare Office Charger', 8.5, 5, 3.1, 9.06, true),
    mkSession(genSessionId(), 'chg_1', 'VoltShare Home Charger', 9, 6, 0.92, 2.64, true),
  ];

  const payments: Payment[] = sessions
    .filter((s) => s.status === 'completed')
    .map((s, i) => ({
      id: `pay_${i}`,
      sessionId: s.id,
      amount: s.totalCost,
      method: i % 3 === 0 ? 'UPI' : i % 3 === 1 ? 'Wallet' : 'UPI',
      transactionId: genTransactionId(i % 3 === 1 ? 'Wallet' : 'UPI'),
      status: (i === 2 ? 'pending' : 'paid') as 'paid' | 'pending',
      timestamp: s.endTime ?? s.startTime,
    }));

  return { users, chargers, sessions, payments };
}

let _db: DBShape | null = null;

function load(): DBShape {
  if (_db) return _db;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      _db = JSON.parse(raw) as DBShape;
      return _db;
    }
  } catch {
    // fall through to seed
  }
  _db = seed();
  persist();
  return _db;
}

function persist() {
  if (_db) localStorage.setItem(STORAGE_KEY, JSON.stringify(_db));
}

export function getDB(): DBShape {
  return load();
}

export function saveDB(db: DBShape) {
  _db = db;
  persist();
}

export function resetDB(): DBShape {
  _db = seed();
  persist();
  return _db;
}

// --- Domain accessors ---
export const getUsers = () => load().users;
export const getChargers = () => load().chargers;
export const getSessions = () => load().sessions;
export const getPayments = () => load().payments;

export function getUser(id: string): User | undefined {
  return load().users.find((u) => u.id === id);
}

export function getCharger(id: string): Charger | undefined {
  return load().chargers.find((c) => c.id === id);
}

export function getSession(sessionId: string): ChargingSession | undefined {
  return load().sessions.find((s) => s.id === sessionId);
}

export function getPaymentForSession(sessionId: string): Payment | undefined {
  return load().payments.find((p) => p.sessionId === sessionId);
}

export function addCharger(c: Charger) {
  const db = load();
  db.chargers.push(c);
  persist();
}

export function updateCharger(id: string, patch: Partial<Charger>) {
  const db = load();
  const idx = db.chargers.findIndex((c) => c.id === id);
  if (idx >= 0) {
    db.chargers[idx] = { ...db.chargers[idx], ...patch };
    persist();
  }
}

export function addSession(s: ChargingSession) {
  const db = load();
  db.sessions.unshift(s);
  persist();
}

export function updateSession(id: string, patch: Partial<ChargingSession>) {
  const db = load();
  const idx = db.sessions.findIndex((s) => s.id === id);
  if (idx >= 0) {
    db.sessions[idx] = { ...db.sessions[idx], ...patch };
    persist();
  }
}

export function addPayment(p: Payment) {
  const db = load();
  db.payments.unshift(p);
  persist();
}

export function updatePayment(id: string, patch: Partial<Payment>) {
  const db = load();
  const idx = db.payments.findIndex((p) => p.id === id);
  if (idx >= 0) {
    db.payments[idx] = { ...db.payments[idx], ...patch };
    persist();
  }
}

export { EV_USER_ID, OWNER_ID };
