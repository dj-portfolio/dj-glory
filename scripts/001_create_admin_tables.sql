-- Admin Panel Database Schema for DJ Portfolio

-- Site Settings Table (for YouTube link, social links, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Images Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  title TEXT,
  category TEXT DEFAULT 'concert',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Views / Analytics Table
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table (for admin access control)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings (admin only for write, public read)
CREATE POLICY "site_settings_select_public" ON public.site_settings 
  FOR SELECT USING (true);

CREATE POLICY "site_settings_insert_admin" ON public.site_settings 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "site_settings_update_admin" ON public.site_settings 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "site_settings_delete_admin" ON public.site_settings 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- RLS Policies for gallery_images (admin only for write, public read)
CREATE POLICY "gallery_images_select_public" ON public.gallery_images 
  FOR SELECT USING (true);

CREATE POLICY "gallery_images_insert_admin" ON public.gallery_images 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "gallery_images_update_admin" ON public.gallery_images 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "gallery_images_delete_admin" ON public.gallery_images 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- RLS Policies for contact_messages (public insert, admin read/update/delete)
CREATE POLICY "contact_messages_insert_public" ON public.contact_messages 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_select_admin" ON public.contact_messages 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "contact_messages_update_admin" ON public.contact_messages 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "contact_messages_delete_admin" ON public.contact_messages 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- RLS Policies for page_views (public insert, admin read)
CREATE POLICY "page_views_insert_public" ON public.page_views 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "page_views_select_admin" ON public.page_views 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- RLS Policies for admin_users (admin only)
CREATE POLICY "admin_users_select_admin" ON public.admin_users 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('youtube_video_id', 'dQw4w9WgXcQ'),
  ('spotify_url', 'https://open.spotify.com/artist/'),
  ('apple_music_url', 'https://music.apple.com/artist/'),
  ('soundcloud_url', 'https://soundcloud.com/vibe_composer_'),
  ('youtube_url', 'https://youtube.com/@vibe_composer_'),
  ('instagram_url', 'https://instagram.com/vibe_composer_'),
  ('twitter_url', 'https://x.com/vibe_composer_'),
  ('facebook_url', 'https://facebook.com/'),
  ('beatport_url', 'https://beatport.com/'),
  ('artist_name', 'DJ ARJUN'),
  ('artist_tagline', 'Electronic Music Producer & Performer'),
  ('artist_bio', 'Based in India, crafting sonic experiences that transcend boundaries.')
ON CONFLICT (key) DO NOTHING;
