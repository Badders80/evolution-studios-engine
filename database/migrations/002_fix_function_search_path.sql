-- =====================================================
-- Fix: Set search_path for calculate_processing_time function
-- =====================================================
-- This resolves the Supabase warning about mutable search_path
-- Run this in Supabase SQL Editor
-- =====================================================

ALTER FUNCTION public.calculate_processing_time() SET search_path = public;

-- =====================================================
-- Verification
-- =====================================================
-- After running, the warning should disappear from Supabase dashboard
-- =====================================================
