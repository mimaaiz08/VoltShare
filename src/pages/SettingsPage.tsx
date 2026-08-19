import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, Car, Wallet, Bell, Save, RotateCcw } from 'lucide-react';
import { resetDB } from '@/services/db';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [vehicle, setVehicle] = useState(user?.vehicle ?? '');
  const [vehicleNumber, setVehicleNumber] = useState('KA01 MN 4321');
  const [defaultTariff, setDefaultTariff] = useState('9');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notifSession, setNotifSession] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifLowBattery, setNotifLowBattery] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    toast.success('Settings saved');
  };

  const handleReset = () => {
    resetDB();
    toast.success('Demo data reset to defaults');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and charging preferences.</p>
      </div>

      {/* Profile */}
      <Card className="border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Vehicle</Label>
            <Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Vehicle */}
      <Card className="border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Vehicle</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Vehicle Model</Label>
            <Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Vehicle Number</Label>
            <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Charging preferences */}
      <Card className="border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Charging Preferences</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Default Tariff (₹/kWh)</Label>
            <Input type="number" value={defaultTariff} onChange={(e) => setDefaultTariff(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Default Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Wallet">Wallet</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <div className="mt-4 space-y-3">
          <ToggleRow label="Session updates" desc="Notify when a charging session starts or stops" checked={notifSession} onChange={setNotifSession} />
          <ToggleRow label="Payment reminders" desc="Notify about pending payments" checked={notifPayment} onChange={setNotifPayment} />
          <ToggleRow label="Low battery alerts" desc="Notify when battery drops below 20%" checked={notifLowBattery} onChange={setNotifLowBattery} />
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30 bg-card p-5">
        <h2 className="font-semibold text-destructive">Demo Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">Reset all sessions, payments, and chargers to default demo data.</p>
        <Button variant="outline" className="mt-4 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Reset Demo Data
        </Button>
      </Card>

      <div className="flex justify-end">
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
