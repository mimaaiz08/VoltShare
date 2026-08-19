import { useState } from 'react';
import { useRouter } from '@/hooks/useRouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Download, Share2, Wallet, CheckCircle2, ArrowLeft, Loader2,
  Zap, Clock, Gauge, Receipt, Printer,
} from 'lucide-react';
import { getSession, getPaymentForSession, addPayment, updatePayment } from '@/services/db';
import { formatCurrency, formatEnergy, formatDuration, formatDate, formatTime, genTransactionId } from '@/utils/format';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/types';

export function BillPage() {
  const { params, navigate } = useRouter();
  const session = params.sessionId ? getSession(params.sessionId) : undefined;
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('UPI');

  if (!session) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <div>
          <p className="text-lg font-semibold">Bill not found</p>
          <Button className="mt-4" onClick={() => navigate('history')}>View History</Button>
        </div>
      </div>
    );
  }

  const existingPayment = getPaymentForSession(session.id);
  const isPaid = paid || existingPayment?.status === 'paid';

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      const txnId = existingPayment?.transactionId ?? genTransactionId(method);
      if (!existingPayment) {
        addPayment({
          id: `pay_${Date.now()}`,
          sessionId: session.id,
          amount: session.totalCost,
          method,
          transactionId: txnId,
          status: 'paid',
          timestamp: Date.now(),
        });
      } else {
        updatePayment(existingPayment.id, { status: 'paid', method, transactionId: txnId, timestamp: Date.now() });
      }
      setPaying(false);
      setPaid(true);
      toast.success('Payment successful');
    }, 1800);
  };

  const handleDownload = () => {
    const text = `VoltShare Charging Bill\n\nSession: ${session.id}\nCharger: ${session.chargerName}\nDate: ${formatDate(session.startTime)}\nDuration: ${formatDuration(session.durationSec)}\nEnergy: ${formatEnergy(session.energyConsumed)}\nTariff: ₹${session.tariff}/kWh\nEnergy Cost: ${formatCurrency(session.energyCost)}\nService Fee: ${formatCurrency(session.serviceFee)}\nTotal: ${formatCurrency(session.totalCost)}\nStatus: ${isPaid ? 'PAID' : 'PENDING'}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoltShare-Bill-${session.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Bill downloaded');
  };

  const handleShare = async () => {
    const shareText = `VoltShare Bill: ${session.id} — ${formatEnergy(session.energyConsumed)} · ${formatCurrency(session.totalCost)} · ${isPaid ? 'Paid' : 'Pending'}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'VoltShare Bill', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Bill details copied');
      }
    } catch {
      // user cancelled share
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button onClick={() => navigate('history')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> History
      </button>

      {/* Bill card */}
      <Card className="overflow-hidden border-border bg-card">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-r from-primary/10 to-card p-6">
          <div className="flex items-center justify-between">
            <Logo />
            <StatusBadge status={isPaid ? 'success' : 'warning'}>
              {isPaid ? <><CheckCircle2 className="h-3 w-3" /> Paid</> : 'Pending'}
            </StatusBadge>
          </div>
          <h1 className="mt-4 text-xl font-bold">Charging Bill</h1>
          <p className="text-xs text-muted-foreground">Session ID: {session.id}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow icon={Zap} label="Charger" value={session.chargerName} />
            <InfoRow icon={Receipt} label="Date" value={`${formatDate(session.startTime)} · ${formatTime(session.startTime)}`} />
            <InfoRow icon={Clock} label="Duration" value={formatDuration(session.durationSec)} />
            <InfoRow icon={Gauge} label="Energy Consumed" value={formatEnergy(session.energyConsumed)} />
          </div>

          {/* Cost breakdown */}
          <div className="mt-6 rounded-xl border border-border bg-background/50 p-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Cost Breakdown</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tariff</span>
                <span className="font-medium">₹{session.tariff}/kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Energy Cost ({formatEnergy(session.energyConsumed)})</span>
                <span className="font-medium">{formatCurrency(session.energyCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium">{formatCurrency(session.serviceFee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-3">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(session.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Payment status / actions */}
          {isPaid ? (
            <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
              <p className="mt-2 font-semibold text-accent">Payment Successful</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Transaction ID: {existingPayment?.transactionId ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                Paid via {existingPayment?.method ?? method}
              </p>
            </div>
          ) : paying ? (
            <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <p className="mt-3 font-semibold">Processing Payment...</p>
              <p className="mt-1 text-xs text-muted-foreground">Simulated {method} transaction</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Wallet', 'Cash'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                        method === m ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <Button size="lg" className="w-full gap-2" onClick={handlePay}>
                <Wallet className="h-4 w-4" /> Pay {formatCurrency(session.totalCost)}
              </Button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap gap-2 border-t border-border bg-background/30 p-4">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="ghost" onClick={() => navigate('history')}>View History</Button>
        <Button variant="ghost" onClick={() => navigate('dashboard')}>Dashboard</Button>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
