# VoltShare
## Check the Live demo
https://voltshare-ev-chargin-g9yt.bolt.host

**Smart EV charging measurement and payment platform.**

> Charge Smart. Pay Fair.

VoltShare solves a simple problem: when an EV owner charges using electricity supplied by another person or location, it's hard to accurately measure energy consumed and calculate a fair payment. VoltShare acts as a smart charging and payment layer — recording every charging session, measuring energy in kWh, computing cost from the agreed tariff, and settling payment transparently.

---

## Problem

EV owners who charge at shared or third-party outlets have no reliable way to pay only for the electricity they actually consumed. Charger owners have no easy way to bill for the energy they provide. Guesswork and flat-rate pricing lead to unfairness on both sides.

## Solution

VoltShare sits between the electricity source and the EV charger as a smart adapter that:

1. **Measures** live voltage, current, power, and accumulated energy (kWh).
2. **Calculates** cost automatically from `energy × tariff + service fee`.
3. **Bills** the EV owner with a clean digital invoice.
4. **Settles** payment via UPI, wallet, or cash (simulated).

## Features

### EV User
- Dashboard with live status, today's energy/cost, and session count
- Start a charging session by selecting a charger and tariff
- **Live charging screen** with real-time voltage, current, power, energy, duration, temperature, and cost (updates every 2s)
- Stop charging → automatic bill generation
- Pay via simulated UPI / Wallet / Cash flow with transaction ID
- Download, share, and print bills
- Charging history with All / Paid / Pending filters and search
- Analytics: 7-day energy and cost charts (Recharts)

### Charger Owner
- Owner dashboard: active chargers, active sessions, energy delivered, revenue
- Charger status cards (online / charging / offline)
- Active session monitoring
- Manage Chargers: add, enable/disable, view stats
- Owner analytics: monthly revenue, weekly energy, daily usage charts

### Platform
- Role switcher (EV User ↔ Charger Owner) from the sidebar
- **Presentation Mode** — full-screen live charging dashboard optimized for demos
- Demo Mode indicator
- Responsive: sidebar on desktop, bottom nav on mobile
- Realistic Indian sample data (₹ currency, ₹8–12/kWh tariffs, real charger names)

## Architecture

```
Electricity Source → VoltShare Smart Adapter → EV Charger → EV
```

The smart adapter measures energy flow. Today it's a **software simulation**; the same interface is designed to connect to a real ESP32 / smart energy meter over MQTT or REST in Version 2.

```
src/
  components/     Reusable UI (MetricCard, StatusBadge, Logo, AppLayout, ThemeProvider)
  pages/          Route screens (Landing, Login, Dashboard, LiveCharging, Bill, ...)
  hooks/          useAuth, useRouter, useChargingSimulation
  services/       db.ts (localStorage-backed store), hardware.ts (simulation)
  types/          Domain models
  utils/          Formatting helpers
```

### Hardware Abstraction

`src/services/hardware.ts` exposes a `HardwareService` interface with `getLiveMetrics()`, `startSession()`, `stopSession()`, and `isRunning()`. The current implementation simulates realistic readings with noise; replacing it with a real ESP32/MQTT client requires no UI changes.

### Data Layer

`src/services/db.ts` is a localStorage-backed store seeded with realistic demo data (3 chargers, 6 sessions, payments, 2 users). It persists across reloads and can be reset from Settings.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** build tool
- **Tailwind CSS** + **shadcn/ui** components
- **Lucide React** icons
- **Recharts** for analytics
- **Sonner** for toast notifications
- **next-themes** for theming

## How It Works

1. **Connect** — plug into a VoltShare-enabled charger.
2. **Charge** — start a session from the dashboard.
3. **Measure** — the smart adapter streams live voltage, current, power, and energy.
4. **Calculate** — cost = `energy (kWh) × tariff (₹/kWh) + service fee`.
5. **Pay** — settle instantly via UPI, wallet, or cash.

## Demo Flow

1. Open VoltShare → click **Try Demo**
2. Select **EV User**
3. Dashboard opens → click **Start Charging**
4. Select **VoltShare Home Charger** (tariff ₹9/kWh) → **Start Charging**
5. Live charging screen opens → values update every 2s
6. Click **Stop Charging** → session saved, bill generated
7. Click **Pay Now** → simulated UPI payment succeeds
8. Return to dashboard → history shows the completed session
9. Switch to **Charger Owner** → view analytics and revenue

## Demo Credentials

No password needed — just pick a role on the login screen:

| Role | Email |
|------|-------|
| EV User | demo@voltshare.com |
| Charger Owner | owner@voltshare.com |

## Installation

```bash
npm install
```

## Running Locally

```bash
npm run dev
```

Then open the printed localhost URL.

```bash
npm run build     # production build
npm run preview   # preview the build
```

## What Is Simulated

- Smart adapter hardware readings (voltage, current, power, energy, temperature)
- Payment gateway (UPI / Wallet / Cash settlement)
- Authentication (role-based demo login, no real credentials)
- Data persistence via localStorage (no external database required for the demo)

## Future Hardware Integration (Version 2)

- **ESP32 / ESP8266 / Raspberry Pi** smart energy meter measuring real voltage, current, power, and energy
- **MQTT or REST API** streaming live readings to the VoltShare backend
- **Supabase** backend for multi-user sessions, real auth, and cloud billing
- **Real payment gateway** (Stripe / Razorpay / UPI Deep Link)
- **Mobile app** with push notifications and remote start/stop
- **Dynamic tariff** pricing based on time-of-day and grid load
- **Multi-charger fleet** management with live maps

## Future Scope

- Carbon offset tracking (kWh → CO₂ saved)
- Solar integration and net-metering credits
- Charger discovery map for public VoltShare points
- Subscription and wallet auto-recharge
- Admin analytics dashboard for grid operators
