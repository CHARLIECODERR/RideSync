-- 1. Rides Table (Mission Meta)
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 15,
  status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'Active', 'Completed', 'Cancelled', 'Draft')),
  ride_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ride Routes (The Mission Path)
CREATE TABLE IF NOT EXISTS public.ride_routes (
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE PRIMARY KEY,
  start_location JSONB NOT NULL, -- { lat, lng, name }
  end_location JSONB NOT NULL,   -- { lat, lng, name }
  distance_km NUMERIC,
  duration_mins INTEGER,
  geometry JSONB,                -- Full GeoJSON geometry for the route
  waypoints JSONB DEFAULT '[]'   -- Array of lat/lng defining the calculated route
);

-- 3. Ride Stops (Waypoints)
CREATE TABLE IF NOT EXISTS public.ride_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fuel', 'food', 'break', 'landmark', 'other')),
  location JSONB NOT NULL,       -- { lat, lng }
  "order" INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ride Participants (The Pack)
CREATE TABLE IF NOT EXISTS public.ride_participants (
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Rider' CHECK (role IN ('Lead', 'Sweep', 'Rider')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (ride_id, user_id)
);

-- 5. Enable RLS
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_participants ENABLE ROW LEVEL SECURITY;

-- 6. Policies (The Brotherhood Rules)
CREATE POLICY "Anyone can view rides" ON public.rides FOR SELECT USING (true);
CREATE POLICY "Creators can manage rides" ON public.rides FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view routes" ON public.ride_routes FOR SELECT USING (true);
CREATE POLICY "Creators can manage routes" ON public.ride_routes FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND created_by = auth.uid()));

CREATE POLICY "Anyone can view stops" ON public.ride_stops FOR SELECT USING (true);
CREATE POLICY "Creators can manage stops" ON public.ride_stops FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND created_by = auth.uid()));

CREATE POLICY "Participants can view each other" ON public.ride_participants FOR SELECT USING (true);
CREATE POLICY "Users can join rides" ON public.ride_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
