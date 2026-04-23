# RideSync 🚗🇮🇳

## Overview
RideSync is a production-grade, responsive web application designed for users to find, create, and share rides. The platform features a unique "Tactical HUD" for riders, high-accuracy GPS tracking, and deep community integration, optimized for the rugged conditions of cross-country travel.

## Tech Stack
- **Framework:** React 19 with Vite, TypeScript
- **Backend:** Node.js Express Server (Local/Hybrid)
- **Database:** PostgreSQL with **Prisma ORM**
- **Auth:** Google OAuth 2.0 & Local Email/Password (JWT)
- **Styling:** Tailwind CSS, Framer Motion
- **State Management:** Zustand
- **Maps:** Leaflet & React-Leaflet
- **GIS Logic:** Turf.js (for high-precision spatial analysis)

## 🛰️ Strategic Features

### 🏁 Tactical Ride Mode (HUD)
- **Handlebar Ready**: Full-screen, landscape-optimized interface designed for horizontal mobile mounting.
- **Real-time Telemetry**: Integrated speedometer and distance remaining metrics.
- **Directional Intel**: Dynamic, high-visibility turn instructions and route progress indicators.

### 📍 Local Database Integration
- **PostgreSQL Core**: Move away from cloud-only lock-in with a robust local PostgreSQL setup.
- **Prisma Powered**: Type-safe database queries and automated migrations.
- **Hybrid Support**: Toggle between Local API and Supabase via environment variables.

### 🛡️ Authentication 2.0
- **Google Login**: One-tap access via Google OAuth.
- **Secure Local Auth**: Traditional login with encrypted passwords stored locally.
- **JWT Protection**: Secure, stateless session management.

## 🛠️ Mission Setup (Local PostgreSQL)

### 1. Requirements
- Node.js & npm
- PostgreSQL installed and running locally
- Google Cloud Project (for OAuth keys)

### 2. Installation
```bash
npm install
```

### 3. Environment Intel (`.env`)
Create a `.env` file with the following:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ridesync?schema=public"

# Auth Secrets
JWT_SECRET="your_random_secret"
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"

# App Toggles
VITE_USE_LOCAL_DB="true"
VITE_API_URL="http://localhost:5000/api"
FRONTEND_URL="http://localhost:5173"
```

### 4. Database Deployment
Initialize the local database and generate the Prisma Client:
```bash
# Push schema to local DB
npx prisma db push

# Generate types
npm run db:generate
```

### 5. Launch Protocol
Start both the Frontend and the Express Backend concurrently:
```bash
npm run dev:all
```

## 📁 Project Structure
- `src/`: React frontend (FSD-inspired architecture)
- `server/`: Express backend API with Passport.js & Prisma
- `prisma/`: Database schema and migration logs

## 📊 Current Status (April 2026)
- **Local DB Integration**: COMPLETED.
- **Auth Transition**: Google OAuth and Local Password auth active.
- **Version 3.5**: Full local-stack readiness.
