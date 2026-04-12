# RideSync 🚗🇮🇳

## Overview
RideSync is a production-grade, responsive web application designed for users to find, create, and share rides. The platform features a unique "Tactical HUD" for riders, high-accuracy GPS tracking, and deep community integration, optimized for the rugged conditions of cross-country travel.

## Tech Stack
- **Framework:** React 19 with Vite, TypeScript
- **Styling:** Tailwind CSS, Framer Motion (for animations)
- **State Management:** Zustand
- **Maps:** Leaflet & React-Leaflet
- **Backend:** Supabase (Auth, Database, Realtime)
- **GIS Logic:** Turf.js (for high-precision spatial analysis)

## 🛰️ Strategic Features

### 🏁 Tactical Ride Mode (HUD)
- **Handlebar Ready**: Full-screen, landscape-optimized interface designed for horizontal mobile mounting.
- **Real-time Telemetry**: Integrated speedometer and distance remaining metrics.
- **Directional Intel**: Dynamic, high-visibility turn instructions and route progress indicators.
- **Off-Course Alerts**: Visual pulsing warnings if the rider deviates more than 100 meters from the planned route.

### 📍 Precision Mapping
- **High-Accuracy GPS**: 1Hz telemetry broadcasts for real-time tracking of active missions.
- **Multi-Route Engine**: Alternative paths with distance/time calculation via Mapbox/OSRM.
- **Dynamic Waypoints**: Intelligent markers for fuel stops, food breaks, and rest sectors.

### 🛡️ Mission Intel & Community
- **Vanguard Core**: Community-driven ride sharing with participation management.
- **Intel Channel**: Real-time GPS coordinate logging and satellite lock status.
- **Rugged Aesthetic**: Brutalist dark-mode UI designed for maximum contrast and field visibility.

## 📁 Folder Structure (FSD inspired)
```text
src/
├── features/
│   ├── auth/           # Identity management & security
│   ├── community/      # Vanguard groups & social intel
│   └── rides/          # Mapping, tracking, HUD & logistics
├── components/         # Shared UI & design system
├── store/              # Global state (Theme, Tracking)
└── lib/                # Config (Supabase, Utils)
```

## 🛠️ Setup & Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file with:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_MAPBOX_TOKEN=your_mapbox_token  # For advanced routing
   ```

3. **Database Migration:**
   Apply `supabase_full_schema.sql` (or module schemas) in your Supabase SQL Editor.

4. **Launch Interface:**
   ```bash
   npm run dev -- --host
   ```

## 🧪 Testing Protocol
A dedicated testing suite is integrated to ensure mission reliability:
- **Unit/Component**: `npm run test` (Vitest + RTL)
- **E2E**: `npm run test:e2e` (Playwright)
- **Coverage**: `npm run test:coverage`

## 📊 Current Status (April 2026)
- **Version 3.0 (Field Prepared)**: Fully stabilized GPS tracking and Tactical HUD deployment.
- **Known Note**: Ensure "High Accuracy" is enabled in browser permissions for optimal tracking.
