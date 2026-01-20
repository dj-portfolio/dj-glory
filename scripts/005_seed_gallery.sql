-- Seed gallery images (using correct column names: id, url, title, category, created_at)
INSERT INTO gallery_images (url, title, category)
VALUES 
  ('/gallery/concert-1.jpg', 'Live at Sunburn Festival', 'concert'),
  ('/gallery/studio-1.jpg', 'Studio Session', 'studio'),
  ('/gallery/concert-2.jpg', 'Club Performance', 'concert'),
  ('/gallery/bts-1.jpg', 'Backstage Moments', 'bts'),
  ('/gallery/concert-3.jpg', 'Festival Headlining', 'concert'),
  ('/gallery/studio-2.jpg', 'Creating New Tracks', 'studio')
ON CONFLICT DO NOTHING;

-- Seed default site settings
INSERT INTO site_settings (key, value)
VALUES 
  ('youtube_video_id', 'dQw4w9WgXcQ'),
  ('social_spotify', 'https://open.spotify.com/artist/example'),
  ('social_apple_music', 'https://music.apple.com/artist/example'),
  ('social_soundcloud', 'https://soundcloud.com/vibecomposer'),
  ('social_youtube', 'https://youtube.com/@vibecomposer'),
  ('social_instagram', 'https://instagram.com/vibe_composer_'),
  ('social_facebook', 'https://facebook.com/vibecomposer'),
  ('social_twitter', 'https://twitter.com/vibecomposer'),
  ('social_beatport', 'https://beatport.com/artist/vibecomposer')
ON CONFLICT (key) DO NOTHING;
