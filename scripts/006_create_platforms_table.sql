-- Create platforms table for streaming/social platforms
-- Run this in Supabase SQL Editor

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS public.platforms CASCADE;

-- Create the platforms table
CREATE TABLE public.platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    icon_url TEXT, -- URL to uploaded image in Supabase storage
    color VARCHAR(20) DEFAULT '#00FF00', -- Brand color hex
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read active platforms
CREATE POLICY "platforms_select_public" ON public.platforms 
    FOR SELECT USING (true);

-- Only authenticated users can insert
CREATE POLICY "platforms_insert_admin" ON public.platforms 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "platforms_update_admin" ON public.platforms 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "platforms_delete_admin" ON public.platforms 
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Create storage bucket for platform icons (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-icons', 'platform-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for platform icons
CREATE POLICY "Platform icons are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-icons');

CREATE POLICY "Authenticated users can upload platform icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'platform-icons' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update platform icons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'platform-icons' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete platform icons"
ON storage.objects FOR DELETE
USING (bucket_id = 'platform-icons' AND auth.role() = 'authenticated');

-- Seed common platforms with default icons
INSERT INTO public.platforms (name, url, color, display_order, is_active) VALUES
    ('Spotify', 'https://open.spotify.com/artist/YOUR_ID', '#1DB954', 1, true),
    ('Apple Music', 'https://music.apple.com/artist/YOUR_ID', '#FA2D48', 2, true),
    ('YouTube', 'https://youtube.com/@YOUR_CHANNEL', '#FF0000', 3, true),
    ('SoundCloud', 'https://soundcloud.com/YOUR_PROFILE', '#FF5500', 4, true),
    ('Instagram', 'https://instagram.com/YOUR_HANDLE', '#E4405F', 5, true),
    ('Facebook', 'https://facebook.com/YOUR_PAGE', '#1877F2', 6, true);

-- Add comment
COMMENT ON TABLE public.platforms IS 'Streaming and social media platforms with admin CRUD';
