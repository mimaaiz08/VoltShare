import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/hooks/useRouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge, Dot } from '@/components/StatusBadge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plug, Plus, MapPin, Power, Zap, Trash2, ArrowLeft } from 'lucide-react';
import { getChargers, addCharger, updateCharger } from '@/services/db';
import { formatEnergy, formatPower } from '@/utils/format';
import { toast } from 'sonner';
import type { Charger } from '@/types';

export function ManageChargersPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [chargers, setChargers] = useState(getChargers());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', powerRating: '7.2', tariff: '9' });

  if (!user) return null;

  const myChargers = chargers.filter((c) => c.ownerId === user.id);

  const handleAdd = () => {
    if (!form.name || !form.location) {
      toast.error('Please fill in name and location');
      return;
    }
    const c: Charger = {
      id: `chg_${Date.now()}`,
      name: form.name,
      location: form.location,
      status: 'online',
      powerRating: Number(form.powerRating) || 7.2,
      tariff: Number(form.tariff) || 9,
      totalEnergy: 0,
      totalSessions: 0,
      ownerId: user.id,
    };
    addCharger(c);
    setChargers(getChargers());
    setForm({ name: '', location: '', powerRating: '7.2', tariff: '9' });
    setOpen(false);
    toast.success('Charger added');
  };

  const toggleStatus = (c: Charger) => {
    const newStatus = c.status === 'offline' ? 'online' : 'offline';
    updateCharger(c.id, { status: newStatus });
    setChargers(getChargers());
    toast.success(`${c.name} is now ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('owner-dashboard')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Overview
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Chargers</h1>
          <p className="text-sm text-muted-foreground">{myChargers.length} charger{myChargers.length !== 1 ? 's' : ''} registered.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add Charger
        </Button>
      </div>

      {myChargers.length === 0 ? (
        <Card className="border-dashed border-border bg-card p-12 text-center">
          <Plug className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No chargers yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first charger to get started.</p>
          <Button className="mt-4 gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add Charger
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myChargers.map((c) => (
            <Card key={c.id} className="border-border bg-card p-5 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Plug className="h-5 w-5" />
                </div>
                <StatusBadge status={c.status === 'offline' ? 'destructive' : 'success'}>
                  <Dot className={c.status === 'offline' ? 'bg-destructive' : 'bg-accent'} />
                  {c.status === 'offline' ? 'Offline' : c.status === 'charging' ? 'Charging' : 'Online'}
                </StatusBadge>
              </div>
              <h3 className="mt-3 font-semibold">{c.name}</h3>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {c.location}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border bg-background/50 p-2.5">
                  <p className="text-muted-foreground">Power</p>
                  <p className="font-semibold">{formatPower(c.powerRating)}</p>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-2.5">
                  <p className="text-muted-foreground">Tariff</p>
                  <p className="font-semibold">₹{c.tariff}/kWh</p>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-2.5">
                  <p className="text-muted-foreground">Energy</p>
                  <p className="font-semibold">{formatEnergy(c.totalEnergy)}</p>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-2.5">
                  <p className="text-muted-foreground">Sessions</p>
                  <p className="font-semibold">{c.totalSessions}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => toggleStatus(c)}>
                  <Power className="h-3.5 w-3.5" /> {c.status === 'offline' ? 'Enable' : 'Disable'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add charger dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Charger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Charger Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VoltShare Home Charger" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mangaluru" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Power Rating (kW)</Label>
                <Input type="number" value={form.powerRating} onChange={(e) => setForm({ ...form, powerRating: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Tariff (₹/kWh)</Label>
                <Input type="number" value={form.tariff} onChange={(e) => setForm({ ...form, tariff: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="gap-2" onClick={handleAdd}>
              <Zap className="h-4 w-4" /> Add Charger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
