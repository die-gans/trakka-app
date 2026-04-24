-- Migration: Add viewer/editor permissions to trip_members
-- Run this in Supabase SQL Editor if you already have the schema deployed

-- 1. Add permission column to trip_members
ALTER TABLE public.trip_members
  ADD COLUMN IF NOT EXISTS permission text DEFAULT 'editor'
  CHECK (permission IN ('viewer', 'editor'));

-- 2. Backfill: all existing members become editors
UPDATE public.trip_members SET permission = 'editor' WHERE permission IS NULL;

-- 3. Update is_trip_member to also check permission
-- We keep the existing is_trip_member for read access
-- Add is_trip_editor for write access

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

-- 4. Update RLS policies to respect viewer/editor

-- Families: viewers can read, editors can write
DROP POLICY IF EXISTS "Families insertable by trip members" ON public.families;
DROP POLICY IF EXISTS "Families updatable by trip members" ON public.families;

CREATE POLICY "Families insertable by editors" ON public.families
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));

CREATE POLICY "Families updatable by editors" ON public.families
  FOR UPDATE USING (public.is_trip_editor(trip_id));

-- Locations
DROP POLICY IF EXISTS "Locations insertable by trip members" ON public.locations;
CREATE POLICY "Locations insertable by editors" ON public.locations
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));

-- Meals
DROP POLICY IF EXISTS "Meals insertable by trip members" ON public.meals;
DROP POLICY IF EXISTS "Meals updatable by trip members" ON public.meals;
CREATE POLICY "Meals insertable by editors" ON public.meals
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));
CREATE POLICY "Meals updatable by editors" ON public.meals
  FOR UPDATE USING (public.is_trip_editor(trip_id));

-- Tasks
DROP POLICY IF EXISTS "Tasks insertable by trip members" ON public.tasks;
DROP POLICY IF EXISTS "Tasks updatable by trip members" ON public.tasks;
CREATE POLICY "Tasks insertable by editors" ON public.tasks
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));
CREATE POLICY "Tasks updatable by editors" ON public.tasks
  FOR UPDATE USING (public.is_trip_editor(trip_id));

-- Expenses
DROP POLICY IF EXISTS "Expenses insertable by trip members" ON public.expenses;
CREATE POLICY "Expenses insertable by editors" ON public.expenses
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));

-- Checkpoints
DROP POLICY IF EXISTS "Checkpoints insertable by trip members" ON public.checkpoints;
CREATE POLICY "Checkpoints insertable by editors" ON public.checkpoints
  FOR INSERT WITH CHECK (public.is_trip_editor(trip_id));

-- Messages: everyone can send messages (chat is open)
-- Keep existing message policies

-- Checklist items: editors only
DROP POLICY IF EXISTS "Checklist items readable by trip members" ON public.checklist_items;
DROP POLICY IF EXISTS "Checklist items insertable by trip members" ON public.checklist_items;
DROP POLICY IF EXISTS "Checklist items updatable by trip members" ON public.checklist_items;

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
