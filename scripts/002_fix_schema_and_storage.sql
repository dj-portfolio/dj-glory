-- Fix page_views table schema
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 1;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

-- Drop the problematic RLS policies and recreate them properly
DROP POLICY IF EXISTS "Admin users can view all admins" ON admin_users;
DROP POLICY IF EXISTS "Admin users can manage gallery" ON gallery_images;
DROP POLICY IF EXISTS "Admin users can view all messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin users can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin users can delete messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin users can manage settings" ON site_settings;
DROP POLICY IF EXISTS "Admin users can view page views" ON page_views;

-- Recreate admin_users policy without recursion (use auth.uid() directly)
CREATE POLICY "Admin users can view all admins" ON admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Gallery policies - authenticated users can manage
CREATE POLICY "Admin users can manage gallery" ON gallery_images
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Contact messages policies
CREATE POLICY "Admin users can view all messages" ON contact_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin users can update messages" ON contact_messages
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin users can delete messages" ON contact_messages
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Site settings policies
CREATE POLICY "Admin users can manage settings" ON site_settings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Page views policies
CREATE POLICY "Admin users can view page views" ON page_views
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the images bucket
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

-- Seed some initial gallery images from static files
INSERT INTO gallery_images (title, image_url, category, display_order) VALUES
  ('Sunburn Festival 2024', '/gallery/concert-1.jpg', 'concert', 0),
  ('Studio Session', '/gallery/studio-1.jpg', 'studio', 1),
  ('Club Night at Kitty Su', '/gallery/concert-2.jpg', 'concert', 2),
  ('Behind The Scenes', '/gallery/bts-1.jpg', 'bts', 3),
  ('Festival Performance', '/gallery/concert-3.jpg', 'concert', 4),
  ('Music Production', '/gallery/studio-2.jpg', 'studio', 5)
ON CONFLICT DO NOTHING;
