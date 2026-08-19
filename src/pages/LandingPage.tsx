import { useRouter } from '@/hooks/useRouter';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Zap, Plug, Car, ArrowRight, Gauge, Receipt, Wallet, PlugZap, CircuitBoard, Cpu, Wifi } from 'lucide-react';

export function LandingPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              How It Works
            </Button>
            <Button size="sm" onClick={() => navigate('login')} className="gap-1.5">
              Try Demo <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-glow absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" /> Smart EV Charging & Payment Platform
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Charge Smart. <span className="text-gradient">Pay Fair.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            VoltShare makes EV charging measurable, transparent, and easy to pay for —
            tracking every kWh and billing fairly between EV owners and charger providers.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate('login')} className="w-full gap-2 sm:w-auto">
              Try Demo <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto">
              How It Works
            </Button>
          </div>

          {/* Architecture visual */}
          <div className="mx-auto mt-14 max-w-4xl">
            <ChargingFlow />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border bg-card/50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-5 md:grid-cols-3">
            <Benefit icon={Gauge} title="Accurate Energy Measurement" desc="Know exactly how much electricity was consumed — voltage, current, power and kWh tracked in real time." />
            <Benefit icon={Receipt} title="Transparent Billing" desc="Automatically calculate charging cost from actual energy usage and the agreed tariff. No guesswork." />
            <Benefit icon={Wallet} title="Simple Payments" desc="Make charging payments easy and traceable with UPI, wallet, or cash settlement." />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-3xl font-bold tracking-tight">How VoltShare Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Five steps from plugging in to settling the bill.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {[
              { icon: Plug, title: 'Connect', desc: 'Plug into a VoltShare-enabled charger.' },
              { icon: Zap, title: 'Charge', desc: 'Start a session from the dashboard.' },
              { icon: Gauge, title: 'Measure', desc: 'The smart adapter measures live energy.' },
              { icon: CircuitBoard, title: 'Calculate', desc: 'Cost is computed from kWh × tariff.' },
              { icon: Wallet, title: 'Pay', desc: 'Settle instantly via UPI or wallet.' },
            ].map((step, i) => (
              <div key={step.title} className="relative rounded-xl border border-border bg-card p-5">
                <span className="absolute -top-3 left-5 grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <step.icon className="h-7 w-7 text-primary" />
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Architecture diagram */}
          <div className="mt-14 rounded-2xl border border-border bg-card p-6 md:p-10">
            <h3 className="text-center text-lg font-semibold">Architecture</h3>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 md:flex-row md:gap-2">
              <ArchBox icon={PlugZap} label="Electricity Source" />
              <ArchArrow />
              <ArchBox icon={CircuitBoard} label="VoltShare Smart Adapter" highlight />
              <ArchArrow />
              <ArchBox icon={Zap} label="EV Charger" />
              <ArchArrow />
              <ArchBox icon={Car} label="EV" />
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              The smart adapter sits between the power source and the charger, measuring energy flow in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Technology / Future */}
      <section className="border-t border-border bg-card/50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Built for real hardware</h2>
              <p className="mt-3 text-muted-foreground">
                Today VoltShare runs on a software simulation. Tomorrow the same interface connects to a real ESP32 smart energy meter.
              </p>
              <div className="mt-6 space-y-3">
                <TechRow icon={Cpu} label="ESP32 / Smart Energy Meter" desc="Measures voltage, current, power and energy at the source." />
                <TechRow icon={Wifi} label="MQTT / REST API" desc="Streams live readings to the VoltShare backend." />
                <TechRow icon={Gauge} label="VoltShare Dashboard" desc="Live session, billing and payment — same UX as today." />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="flex flex-col items-center gap-3">
                <ArchBox icon={Cpu} label="ESP32 Meter" />
                <ArchArrow vertical />
                <ArchBox icon={Wifi} label="MQTT / REST" />
                <ArchArrow vertical />
                <ArchBox icon={Gauge} label="VoltShare Backend" highlight />
                <ArchArrow vertical />
                <ArchBox icon={CircuitBoard} label="Dashboard" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-10 text-center">
            <h2 className="text-3xl font-bold">Experience the VoltShare demo</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Walk through a full charging session — start, live monitoring, bill, and payment — in under two minutes.
            </p>
            <Button size="lg" className="mt-6 gap-2" onClick={() => navigate('login')}>
              Launch Demo <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">© 2026 VoltShare · Charge Smart. Pay Fair.</p>
        </div>
      </footer>
    </div>
  );
}

function Benefit({ icon: Icon, title, desc }: { icon: typeof Zap; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-6 transition-colors hover:border-primary/40">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function TechRow({ icon: Icon, label, desc }: { icon: typeof Zap; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function ArchBox({ icon: Icon, label, highlight }: { icon: typeof Zap; label: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-center ${highlight ? 'border-primary/50 bg-primary/10' : 'border-border bg-background'}`}>
      <Icon className={`h-6 w-6 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function ArchArrow({ vertical }: { vertical?: boolean }) {
  return (
    <svg className={vertical ? 'h-6 w-6' : 'h-6 w-8'} viewBox="0 0 32 24" fill="none">
      <line x1="0" y1="12" x2="28" y2="12" stroke="hsl(189 94% 50% / 0.6)" strokeWidth="2" className="energy-flow" />
      <path d="M26 8 L30 12 L26 16" stroke="hsl(189 94% 50%)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChargingFlow() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8">
      <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:gap-2">
        <ArchBox icon={PlugZap} label="Electricity Source" />
        <ArchArrow />
        <ArchBox icon={CircuitBoard} label="VoltShare Adapter" highlight />
        <ArchArrow />
        <ArchBox icon={Zap} label="EV Charger" />
        <ArchArrow />
        <ArchBox icon={Car} label="EV" />
      </div>
    </div>
  );
}
