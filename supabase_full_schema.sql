-- ==========================================
-- RideSync Complete Project Schema (Idempotent / Full Reset)
-- ==========================================

-- 0. Clean Up (Drop existing tables and functions to ensure a fresh setup)
-- Note: CASCADE ensures that dependent objects like policies and foreign keys are also removed.
DROP TABLE IF EXISTS public.ride_join_requests CASCADE;
DROP TABLE IF EXISTS public.ride_participants CASCADE;
DROP TABLE IF EXISTS public.ride_stops CASCADE;
DROP TABLE IF EXISTS public.ride_routes CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.community_members CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Rider'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Communities Table
CREATE TABLE public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  join_code TEXT UNIQUE,
  created_by UUID REFERENCES public.profiles ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to automatically add creator as Admin
CREATE OR REPLACE FUNCTION public.handle_new_community()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'Admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new community
DROP TRIGGER IF EXISTS on_community_created ON public.communities;
CREATE TRIGGER on_community_created
  AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_community();

-- 4. Community Members / Roles
CREATE TABLE public.community_members (
  community_id UUID REFERENCES public.communities ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  role TEXT DEFAULT 'Rider' CHECK (role IN ('Admin', 'Arranger', 'Rider')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (community_id, user_id)
);

-- 5. Rides Table (Metadata)
CREATE TABLE public.rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 15,
  status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'Active', 'Completed', 'Cancelled', 'Draft')),
  ride_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Ride Routes (Path Data)
CREATE TABLE public.ride_routes (
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE PRIMARY KEY,
  start_location JSONB NOT NULL, -- { lat, lng, name }
  end_location JSONB NOT NULL,   -- { lat, lng, name }
  distance_km NUMERIC,
  duration_mins INTEGER,
  geometry JSONB,                -- Full GeoJSON geometry for the route
  waypoints JSONB DEFAULT '[]'   -- Array of lat/lng defining the calculated route
);

-- 7. Ride Stops (Waypoints)
CREATE TABLE public.ride_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fuel', 'food', 'break', 'landmark', 'other', 'start', 'end')),
  location JSONB NOT NULL,       -- { lat, lng }
  "order" INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Ride Participants (The Pack)
CREATE TABLE public.ride_participants (
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Rider' CHECK (role IN ('Lead', 'Sweep', 'Rider')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (ride_id, user_id)
);

-- 9. Ride Join Requests
CREATE TABLE public.ride_join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ride_id, user_id)
);

-- 10. Enable RLS for all tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_join_requests ENABLE ROW LEVEL SECURITY;

-- 11. Consolidated Policies

-- Communities
CREATE POLICY "Anyone can view communities" 
  ON public.communities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" 
  ON public.communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can manage communities" 
  ON public.communities FOR ALL USING (auth.uid() = created_by);

-- Community Members
CREATE POLICY "Anyone can view community memberships" 
  ON public.community_members FOR SELECT USING (true);

CREATE POLICY "Users can join communities" 
  ON public.community_members FOR INSERT WITH CHECK (
    (auth.uid() = user_id AND role = 'Rider') OR
    (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND created_by = auth.uid()))
  );

CREATE POLICY "Admins can update membership roles" 
  ON public.community_members FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_members.community_id 
      AND cm.user_id = auth.uid() AND cm.role = 'Admin'
    )
  );

CREATE POLICY "Admins can remove members" 
  ON public.community_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_members.community_id 
      AND cm.user_id = auth.uid() AND cm.role = 'Admin'
    )
  );

-- Rides
CREATE POLICY "Anyone can view rides" 
  ON public.rides FOR SELECT USING (true);

CREATE POLICY "Creators can manage rides" 
  ON public.rides FOR ALL USING (auth.uid() = created_by);

-- Ride Routes
CREATE POLICY "Anyone can view routes" 
  ON public.ride_routes FOR SELECT USING (true);

CREATE POLICY "Creators can manage routes" 
  ON public.ride_routes FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND created_by = auth.uid()));

-- Ride Stops
CREATE POLICY "Anyone can view stops" 
  ON public.ride_stops FOR SELECT USING (true);

CREATE POLICY "Creators can manage stops" 
  ON public.ride_stops FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND created_by = auth.uid()));

-- Ride Participants
CREATE POLICY "Participants can view each other" 
  ON public.ride_participants FOR SELECT USING (true);

CREATE POLICY "Ride insertion rules" 
  ON public.ride_participants FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND created_by = auth.uid())
  );

CREATE POLICY "Ride admins can remove participants" 
  ON public.ride_participants FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND created_by = auth.uid()));

-- Ride Join Requests
CREATE POLICY "Users can view their own join requests" 
  ON public.ride_join_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit join requests" 
  ON public.ride_join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ride creators can view requests for their rides" 
  ON public.ride_join_requests FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND created_by = auth.uid()));

CREATE POLICY "Ride creators can update requests for their rides" 
  ON public.ride_join_requests FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND created_by = auth.uid()));
