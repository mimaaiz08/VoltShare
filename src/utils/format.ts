export const formatCurrency = (n: number): string =>
  `₹${n.toFixed(2)}`;

export const formatEnergy = (n: number): string =>
  `${n.toFixed(2)} kWh`;

export const formatPower = (n: number): string =>
  `${n.toFixed(2)} kW`;

export const formatDuration = (sec: number): string => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const formatDurationShort = (sec: number): string => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const formatDate = (epoch: number): string =>
  new Date(epoch).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateShort = (epoch: number): string =>
  new Date(epoch).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

export const formatTime = (epoch: number): string =>
  new Date(epoch).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export const genId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const genSessionId = (): string => {
  const num = Math.floor(10000 + Math.random() * 89999);
  return `VS-2026-${num}`;
};

export const genTransactionId = (method: string): string => {
  const base = method === 'UPI' ? 'VSUPI' : method === 'Wallet' ? 'VSWLT' : 'VSCSH';
  return `${base}${Math.floor(100000 + Math.random() * 899999)}`;
};
