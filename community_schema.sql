-- 1. Communities Table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Community Members / Roles
CREATE TABLE IF NOT EXISTS public.community_members (
  community_id UUID REFERENCES public.communities ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  role TEXT DEFAULT 'Rider' CHECK (role IN ('Admin', 'Arranger', 'Rider')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (community_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Communities
CREATE POLICY "Anyone can view communities" 
  ON public.communities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" 
  ON public.communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Policies for Community Members
CREATE POLICY "Anyone can view community memberships" 
  ON public.community_members FOR SELECT USING (true);

CREATE POLICY "Users can join communities as Riders" 
  ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id AND role = 'Rider');

CREATE POLICY "Admins can update membership roles" 
  ON public.community_members FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_members.community_id 
      AND user_id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can remove members" 
  ON public.community_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_members.community_id 
      AND user_id = auth.uid() AND role = 'Admin'
    )
  );
