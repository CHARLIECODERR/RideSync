# RideSync 🚗🇮🇳

## Overview
RideSync is a modern, responsive web application designed for users to find, create, and share rides. The app strongly emphasizes the idea of community travel ("Syncing with Bharat") and offers seamless location tracking, ride matching, and a vibrant community interface.

## Tech Stack
- **Framework:** React 19 with Vite, TypeScript
- **Styling:** Tailwind CSS, Framer Motion (for animations), PostCSS
- **State Management:** Zustand
- **Routing:** React Router v7
- **Maps:** Leaflet & React-Leaflet
- **Backend as a Service:** Supabase (Auth, Database, Postgres schemas)

## Features
- **User Authentication:** Sign up, log in, and secure auth flows powered by Supabase.
- **Rides & Mapping:** Find rides, view available trips via Leaflet maps, and publish your own rides.
- **Communities:** Discover groups of riders sharing common interests or general travel routes. Join groups and participate.
- **Interactive UI:** Smooth transitions and glassmorphic designs, optimized with a custom Tailwind theme configuration (`indigo-royal`, `saffron-vibrant`, etc).

## Folder Structure & Architecture 

The project follows a **Feature-Sliced Design** architecture for scalability and maintainability.

```text
RideSync/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── components/         # Shared UI and Layout components
│   │   ├── layout/         # Base layout wrapper, Sidebar
│   │   ├── landing/        # Landing page specific components (Navbar)
│   │   └── ui/             # Reusable core UI blocks (e.g. Skeleton loaders)
│   ├── features/           # Distinct domain areas
│   │   ├── auth/           # Login/Signup pages, Auth callbacks, ProtectedRoutes, Supabase services
│   │   ├── community/      # Listing communities, Community Detail view, Store, and Services
│   │   └── rides/          # Ride listing, Ride creation form, map logic, Store, and Services
│   ├── pages/              # High-level route pages (LandingPage, DashboardPage)
│   ├── lib/                # Third-party configuration and generic utilities (Supabase client, mockData.ts)
│   ├── store/              # Global Zustand stores (e.g., ThemeStore)
│   ├── App.tsx             # Main routing hub
│   └── main.tsx            # React application entry point
├── rides_schema.sql        # Database table definitions for Rides Module
├── community_schema.sql    # Database table definitions for Community Module
└── package.json            # Dependencies and scripts
```

## Setup & Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file from the `.env.example` file and populate your Supabase URL and Key:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup:**
   Run the scripts `rides_schema.sql` and `community_schema.sql` in your Supabase SQL Editor to generate the necessary tables.

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The site will be available around `http://localhost:5173`.

## File Index Reference for Agent Assistants
- **Application Entry Point:** `src/main.tsx` & `src/App.tsx` (Contains all routing constraints)
- **Supabase Client / Keys:** `src/lib/supabase.ts` and `.env`
# RideSync 🚗🇮🇳

## Overview
RideSync is a modern, responsive web application designed for users to find, create, and share rides. The app strongly emphasizes the idea of community travel ("Syncing with Bharat") and offers seamless location tracking, ride matching, and a vibrant community interface.

## Tech Stack
- **Framework:** React 19 with Vite, TypeScript
- **Styling:** Tailwind CSS, Framer Motion (for animations), PostCSS
- **State Management:** Zustand
- **Routing:** React Router v7
- **Maps:** Leaflet & React-Leaflet
- **Backend as a Service:** Supabase (Auth, Database, Postgres schemas)

## Features
- **User Authentication:** Sign up, log in, and secure auth flows powered by Supabase.
- **Rides & Mapping:** Find rides, view available trips via Leaflet maps, and publish your own rides.
- **Communities:** Discover groups of riders sharing common interests or general travel routes. Join groups and participate.
- **Interactive UI:** Smooth transitions and glassmorphic designs, optimized with a custom Tailwind theme configuration (`indigo-royal`, `saffron-vibrant`, etc).

## Folder Structure & Architecture 

The project follows a **Feature-Sliced Design** architecture for scalability and maintainability.

```text
RideSync/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── components/         # Shared UI and Layout components
│   │   ├── layout/         # Base layout wrapper, Sidebar
│   │   ├── landing/        # Landing page specific components (Navbar)
│   │   └── ui/             # Reusable core UI blocks (e.g. Skeleton loaders)
│   ├── features/           # Distinct domain areas
│   │   ├── auth/           # Login/Signup pages, Auth callbacks, ProtectedRoutes, Supabase services
│   │   ├── community/      # Listing communities, Community Detail view, Store, and Services
│   │   └── rides/          # Ride listing, Ride creation form, map logic, Store, and Services
│   ├── pages/              # High-level route pages (LandingPage, DashboardPage)
│   ├── lib/                # Third-party configuration and generic utilities (Supabase client, mockData.ts)
│   ├── store/              # Global Zustand stores (e.g., ThemeStore)
│   ├── App.tsx             # Main routing hub
│   └── main.tsx            # React application entry point
├── rides_schema.sql        # Database table definitions for Rides Module
├── community_schema.sql    # Database table definitions for Community Module
└── package.json            # Dependencies and scripts
```

## Setup & Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file from the `.env.example` file and populate your Supabase URL and Key:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup:**
   Run the scripts `rides_schema.sql` and `community_schema.sql` in your Supabase SQL Editor to generate the necessary tables.

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The site will be available around `http://localhost:5173`.

## File Index Reference for Agent Assistants
- **Application Entry Point:** `src/main.tsx` & `src/App.tsx` (Contains all routing constraints)
- **Supabase Client / Keys:** `src/lib/supabase.ts` and `.env`
- **Dashboard / Home:** `src/pages/DashboardPage.tsx`
- **Authentication Pages:** `src/features/auth/pages/AuthPage.tsx`
- **Rides Maps / Logic:** `src/features/rides/pages/RidesPage.tsx` and `src/features/rides/pages/CreateRidePage.tsx`
- **Theme Global States:** `src/store/themeStore.ts`
- **Mock Fallback Data:** `src/lib/mockData.ts` (Used when Supabase calls fail or are uninitialized)

## 🏁 Version 2.5 (Mission Ready)
- **Hardened Security**: Supabase RLS policies implemented for all core tables.
- **Improved Performance**: Debounced searches and memoized map markers to eliminate UI lag.
- **Route Persistence**: Fully functional GeoJSON route saving and restoration.
- **Deployment-Grade UI**: Stabilized CSS build and React Hook ordering.

### ⚠️ Current Status & Known Issues (April 2026)
- **Start/End Markers**: In some legacy rides created during early development, Start and End markers may not appear if the coordinate data was malformed during the transition to the new schema. 
- **Next Steps**: Enhancing the "Join Ride" functionality and implementing real-time GPS tracking for active missions.
