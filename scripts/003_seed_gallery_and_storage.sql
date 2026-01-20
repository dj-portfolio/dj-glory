-- Seed initial gallery images from existing static images
INSERT INTO gallery_images (url, title, category, display_order)
VALUES 
  ('/gallery/concert-1.jpg', 'Festival Headliner', 'concert', 1),
  ('/gallery/studio-1.jpg', 'Studio Session', 'studio', 2),
  ('/gallery/concert-2.jpg', 'Club Night', 'concert', 3),
  ('/gallery/bts-1.jpg', 'Behind The Scenes', 'bts', 4),
  ('/gallery/concert-3.jpg', 'Outdoor Festival', 'concert', 5),
  ('/gallery/studio-2.jpg', 'Production Setup', 'studio', 6)
ON CONFLICT DO NOTHING;

-- Insert default site settings if not exist
INSERT INTO site_settings (key, value)
VALUES 
  ('youtube_video_id', 'dQw4w9WgXcQ'),
  ('spotify_url', 'https://open.spotify.com/artist/example'),
  ('apple_music_url', 'https://music.apple.com/artist/example'),
  ('soundcloud_url', 'https://soundcloud.com/example'),
  ('youtube_url', 'https://youtube.com/@example'),
  ('instagram_url', 'https://instagram.com/vibe_composer_'),
  ('facebook_url', 'https://facebook.com/example'),
  ('beatport_url', 'https://beatport.com/artist/example'),
  ('twitter_url', 'https://x.com/example')
ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to images bucket
CREATE POLICY IF NOT EXISTS "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete their images
CREATE POLICY IF NOT EXISTS "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');
