import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/hooks/useRouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Gauge, Wallet, ArrowRight, MapPin } from 'lucide-react';
import { getChargers, addSession } from '@/services/db';
import { genSessionId } from '@/utils/format';
import type { PaymentMethod, ChargingSession } from '@/types';
import { toast } from 'sonner';

export function StartChargingPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const chargers = getChargers().filter((c) => c.status !== 'offline');

  const [chargerId, setChargerId] = useState(chargers[0]?.id ?? '');
  const [tariff, setTariff] = useState(String(chargers[0]?.tariff ?? 9));
  const [maxSession, setMaxSession] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [starting, setStarting] = useState(false);

  if (!user) return null;

  const selected = chargers.find((c) => c.id === chargerId);

  const onChargerChange = (id: string) => {
    setChargerId(id);
    const c = chargers.find((x) => x.id === id);
    if (c) setTariff(String(c.tariff));
  };

  const handleStart = () => {
    const t = Number(tariff);
    if (!chargerId || !selected) {
      toast.error('Please select a charger');
      return;
    }
    if (!t || t <= 0) {
      toast.error('Please enter a valid tariff');
      return;
    }

    setStarting(true);
    const sessionId = genSessionId();
    const session: ChargingSession = {
      id: sessionId,
      userId: user.id,
      userName: user.name,
      chargerId: selected.id,
      chargerName: selected.name,
      startTime: Date.now(),
      endTime: null,
      durationSec: 0,
      energyConsumed: 0,
      tariff: t,
      energyCost: 0,
      serviceFee: 2,
      totalCost: 0,
      status: 'charging',
    };
    addSession(session);

    setTimeout(() => {
      setStarting(false);
      toast.success('Charging started');
      navigate('live-charging', { sessionId });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Start Charging</h1>
        <p className="text-sm text-muted-foreground">Configure your session and plug in.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Charger selection */}
          <Card className="border-border bg-card p-5">
            <h2 className="font-semibold">Select Charger</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {chargers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onChargerChange(c.id)}
                  className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                    chargerId === c.id ? 'border-primary bg-primary/10' : 'border-border bg-background/50 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Zap className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xs font-medium text-primary">₹{c.tariff}/kWh</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {c.location}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.powerRating} kW · {c.totalSessions} sessions</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Session config */}
          <Card className="border-border bg-card p-5">
            <h2 className="font-semibold">Session Settings</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Charger</Label>
                  <Select value={chargerId} onValueChange={onChargerChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {chargers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tariff (₹/kWh)</Label>
                  <Input type="number" value={tariff} onChange={(e) => setTariff(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Maximum Session Duration (optional)</Label>
                <Input placeholder="e.g. 2 hours" value={maxSession} onChange={(e) => setMaxSession(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="flex gap-3">
                  {(['UPI', 'Wallet', 'Cash'] as PaymentMethod[]).map((m) => (
                    <div key={m} className="flex items-center gap-2">
                      <RadioGroupItem value={m} id={m} />
                      <Label htmlFor={m} className="cursor-pointer font-normal">{m}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-5">
          <Card className="border-border bg-gradient-to-br from-primary/10 to-card p-5">
            <h3 className="font-semibold">Session Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Charger" value={selected?.name ?? '—'} />
              <Row label="Location" value={selected?.location ?? '—'} />
              <Row label="Power Rating" value={selected ? `${selected.powerRating} kW` : '—'} />
              <Row label="Tariff" value={`₹${tariff}/kWh`} highlight />
              <Row label="Service Fee" value="₹2.00" />
              <Row label="Payment Method" value={method} />
            </div>
            <Button className="mt-5 w-full gap-2" onClick={handleStart} disabled={starting}>
              {starting ? (
                <><Gauge className="h-4 w-4 animate-spin" /> Starting...</>
              ) : (
                <><Zap className="h-4 w-4" /> Start Charging <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </Card>

          <Card className="border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">How billing works</h3>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Cost = Energy (kWh) × Tariff (₹/kWh) + Service Fee. You only pay for what you consume, measured live by the VoltShare smart adapter.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}
