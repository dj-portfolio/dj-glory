-- Seed gallery images with existing public images
INSERT INTO gallery_images (title, url, category, sort_order)
VALUES 
  ('Festival Performance', '/gallery/concert-1.jpg', 'concert', 1),
  ('Studio Session', '/gallery/studio-1.jpg', 'studio', 2),
  ('Club Night', '/gallery/concert-2.jpg', 'concert', 3),
  ('Backstage Moments', '/gallery/bts-1.jpg', 'bts', 4),
  ('Main Stage', '/gallery/concert-3.jpg', 'concert', 5),
  ('Production Setup', '/gallery/studio-2.jpg', 'studio', 6)
ON CONFLICT DO NOTHING;

-- Seed initial site settings
INSERT INTO site_settings (key, value)
VALUES 
  ('youtube_video_id', 'dQw4w9WgXcQ'),
  ('site_title', 'DJ ARJUN'),
  ('tagline', 'Electronic Music Producer & Performer')
ON CONFLICT (key) DO NOTHING;

-- Seed social links
INSERT INTO site_settings (key, value)
VALUES 
  ('social_spotify', 'https://open.spotify.com/artist/example'),
  ('social_apple_music', 'https://music.apple.com/artist/example'),
  ('social_soundcloud', 'https://soundcloud.com/vibecomposer'),
  ('social_youtube', 'https://youtube.com/@vibecomposer'),
  ('social_instagram', 'https://instagram.com/vibe_composer_'),
  ('social_facebook', 'https://facebook.com/vibecomposer'),
  ('social_twitter', 'https://twitter.com/vibecomposer'),
  ('social_beatport', 'https://beatport.com/artist/vibecomposer')
ON CONFLICT (key) DO NOTHING;
