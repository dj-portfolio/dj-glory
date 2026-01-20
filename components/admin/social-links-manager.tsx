"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Instagram,
  Youtube,
  Facebook,
  Music,
  Headphones,
  Disc,
  Loader2,
  Save,
  ExternalLink,
} from "lucide-react";

interface SocialLinksManagerProps {
  initialSettings: {
    youtube_video_id: string;
    social_links: Record<string, string>;
  } | null;
}

const socialPlatforms = [
  { key: "spotify", label: "Spotify", icon: Music, placeholder: "https://open.spotify.com/artist/..." },
  { key: "apple_music", label: "Apple Music", icon: Headphones, placeholder: "https://music.apple.com/artist/..." },
  { key: "soundcloud", label: "SoundCloud", icon: Disc, placeholder: "https://soundcloud.com/..." },
  { key: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@..." },
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/..." },
  { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/..." },
  { key: "beatport", label: "Beatport", icon: Disc, placeholder: "https://beatport.com/artist/..." },
  { key: "twitter", label: "X (Twitter)", icon: ExternalLink, placeholder: "https://x.com/..." },
];

export function SocialLinksManager({ initialSettings }: SocialLinksManagerProps) {
  const [links, setLinks] = useState<Record<string, string>>(
    initialSettings?.social_links || {}
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      // First check if the social_links key exists
      const { data: existing } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "social_links")
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("site_settings")
          .update({ value: JSON.stringify(links), updated_at: new Date().toISOString() })
          .eq("key", "social_links");

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "social_links", value: JSON.stringify(links) });

        if (error) throw error;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (key: string, value: string) => {
    setLinks((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Links</h2>
          <p className="text-muted-foreground">
            Manage your social media and streaming platform links
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {socialPlatforms.map((platform) => (
          <Card key={platform.key} className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <platform.icon className="w-4 h-4 text-primary" />
                {platform.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={links[platform.key] || ""}
                  onChange={(e) => updateLink(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="flex-1"
                />
                {links[platform.key] && (
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a
                      href={links[platform.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Tips</CardTitle>
          <CardDescription>
            Best practices for your social links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- Use the full URL including https://</p>
          <p>- For Spotify, use your artist profile link, not a playlist</p>
          <p>- Keep your Instagram handle consistent with @vibe_composer_</p>
          <p>- Links will appear as icons in the footer and hero section</p>
        </CardContent>
      </Card>
    </div>
  );
}
