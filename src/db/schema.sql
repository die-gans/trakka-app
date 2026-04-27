-- TRAKKA Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIPS
-- ============================================
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  command_name text,
  description text,
  start_date date,
  end_date date,
  basecamp_address text,
  basecamp_lat decimal(10, 8),
  basecamp_lng decimal(11, 8),
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- FAMILIES (units/crews within a trip)
-- ============================================
CREATE TABLE public.families (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  name text NOT NULL,
  short_origin text,
  origin text,
  origin_lat decimal(10, 8),
  origin_lng decimal(11, 8),
  status text DEFAULT 'Transit',
  eta text,
  drive_time text,
  headcount text,
  vehicle text,
  responsibility text,
  readiness int DEFAULT 0 CHECK (readiness >= 0 AND readiness <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- TRIP MEMBERS (links users to trips with roles)
-- ============================================
CREATE TABLE public.trip_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  family_id uuid REFERENCES public.families(id) ON DELETE SET NULL,
  role text DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
  permission text DEFAULT 'editor' CHECK (permission IN ('viewer', 'editor')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- ============================================
-- CHECKLIST ITEMS (per family)
-- ============================================
CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id uuid REFERENCES public.families(id) ON DELETE CASCADE,
  label text NOT NULL,
  done boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- LOCATIONS (POIs, campsites, stops)
-- ============================================
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text CHECK (category IN ('stay', 'meal', 'activity', 'park', 'logistics', 'fuel', 'campsite')),
  day_id text,
  address text,
  lat decimal(10, 8),
  lng decimal(11, 8),
  external_url text,
  summary text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ROUTES
-- ============================================
CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  family_id uuid REFERENCES public.families(id) ON DELETE SET NULL,
  title text,
  focus_day text,
  tone text,
  path jsonb, -- array of {lat, lng} objects
  duration_seconds int,
  distance_meters int,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ITINERARY ITEMS
-- ============================================
CREATE TABLE public.itinerary_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  row_id text, -- 'travel', 'activities', 'support'
  day_id text,
  title text NOT NULL,
  start_slot decimal(4, 2),
  span decimal(4, 2) DEFAULT 1,
  color text,
  status text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ITINERARY ITEM <-> FAMILY LINKS
-- ============================================
CREATE TABLE public.itinerary_item_families (
  itinerary_item_id uuid REFERENCES public.itinerary_items(id) ON DELETE CASCADE,
  family_id uuid REFERENCES public.families(id) ON DELETE CASCADE,
  PRIMARY KEY (itinerary_item_id, family_id)
);

-- ============================================
-- MEALS
-- ============================================
CREATE TABLE public.meals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  day_id text,
  meal text NOT NULL,
  owner text,
  status text DEFAULT 'Pending',
  note text,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- EXPENSES
-- ============================================
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount decimal(10, 2),
  payer_family_id uuid REFERENCES public.families(id) ON DELETE SET NULL,
  allocation_mode text DEFAULT 'equal' CHECK (allocation_mode IN ('equal', 'manual', 'individual')),
  allocations jsonb DEFAULT '{}', -- { family_id: amount }
  settled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  title text NOT NULL,
  day_id text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'done', 'blocked')),
  assigned_family_id uuid REFERENCES public.families(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- CHECKPOINTS (mobile PWA check-ins)
-- ============================================
CREATE TABLE public.checkpoints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  family_id uuid REFERENCES public.families(id) ON DELETE CASCADE,
  type text CHECK (type IN ('departed', 'arrived', 'stopped', 'running_late', 'issue', 'condition')),
  lat decimal(10, 8),
  lng decimal(11, 8),
  note text,
  next_eta timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- MESSAGES (trip group chat)
-- ============================================
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  family_id uuid REFERENCES public.families(id) ON DELETE SET NULL,
  sender_name text,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'location_share', 'alert', 'system')),
  lat decimal(10, 8),
  lng decimal(11, 8),
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Helper: is user a member of this trip?
CREATE OR REPLACE FUNCTION public.is_trip_member(trip_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_id = trip_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: is user an editor of this trip?
CREATE OR REPLACE FUNCTION public.is_trip_editor(trip_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_id = trip_uuid
      AND user_id = auth.uid()
      AND permission = 'editor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trips: read if member, write if organizer
CREATE POLICY "Trips readable by members" ON public.trips
  FOR SELECT USING (public.is_trip_member(id) OR created_by = auth.uid());

CREATE POLICY "Trips insertable by anyone" ON public.trips
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Trips updatable by organizer" ON public.trips
  FOR UPDATE USING (created_by = auth.uid());

-- Families: read if trip member, write if editor
CREATE POLICY "Families readable by trip members" ON public.families
  FOR SELECT USING (public.is_trip_member(trip_id));

CREATE POLICY "Families insertable by editors" ON public.families
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));

CREATE POLICY "Families updatable by editors" ON public.families
  FOR UPDATE USING (public.is_trip_editor(trip_id));

-- Locations: read if member, write if editor
CREATE POLICY "Locations readable by trip members" ON public.locations
  FOR SELECT USING (public.is_trip_member(trip_id));
CREATE POLICY "Locations insertable by editors" ON public.locations
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));

-- Itinerary Items: read if member, write if editor
CREATE POLICY "Itinerary items readable by trip members" ON public.itinerary_items
  FOR SELECT USING (public.is_trip_member(trip_id));
CREATE POLICY "Itinerary items insertable by editors" ON public.itinerary_items
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));
CREATE POLICY "Itinerary items updatable by editors" ON public.itinerary_items
  FOR UPDATE USING (public.is_trip_editor(trip_id));
CREATE POLICY "Itinerary items deletable by editors" ON public.itinerary_items
  FOR DELETE USING (public.is_trip_editor(trip_id));

-- Meals: read if member, write if editor
CREATE POLICY "Meals readable by trip members" ON public.meals
  FOR SELECT USING (public.is_trip_member(trip_id));
CREATE POLICY "Meals insertable by editors" ON public.meals
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));
CREATE POLICY "Meals updatable by editors" ON public.meals
  FOR UPDATE USING (public.is_trip_editor(trip_id));

-- Tasks: read if member, write if editor
CREATE POLICY "Tasks readable by trip members" ON public.tasks
  FOR SELECT USING (public.is_trip_member(trip_id));
CREATE POLICY "Tasks insertable by editors" ON public.tasks
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));
CREATE POLICY "Tasks updatable by editors" ON public.tasks
  FOR UPDATE USING (public.is_trip_editor(trip_id));

-- Expenses: read if member, write if editor
CREATE POLICY "Expenses readable by trip members" ON public.expenses
  FOR SELECT USING (public.is_trip_member(trip_id));
CREATE POLICY "Expenses insertable by editors" ON public.expenses
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));

-- Checkpoints: read if member, write if editor
CREATE POLICY "Checkpoints readable by trip members" ON public.checkpoints
  FOR SELECT USING (public.is_trip_member(trip_id));
CREATE POLICY "Checkpoints insertable by editors" ON public.checkpoints
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));

-- Messages: everyone can read/send (chat is open)
CREATE POLICY "Messages readable by trip members" ON public.messages
  FOR SELECT USING (public.is_trip_member(trip_id));
CREATE POLICY "Messages insertable by trip members" ON public.messages
  FOR INSERT WITH CHECK (public.is_trip_member(trip_id));

-- Checklist items: read if member, write if editor
CREATE POLICY "Checklist items readable by trip members" ON public.checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.families f
      WHERE f.id = family_id AND public.is_trip_member(f.trip_id)
    )
  );

CREATE POLICY "Checklist items updatable by editors" ON public.checklist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.families f
      WHERE f.id = family_id AND public.is_trip_editor(f.trip_id)
    )
  );

-- Trip members: anyone in the trip can see who's joined
CREATE POLICY "Trip members readable by trip members" ON public.trip_members
  FOR SELECT USING (public.is_trip_member(trip_id));

CREATE POLICY "Trip members insertable by organizer" ON public.trip_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips WHERE id = trip_id AND created_by = auth.uid()
    )
  );

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkpoints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.families;
ALTER PUBLICATION supabase_realtime ADD TABLE public.itinerary_items;
