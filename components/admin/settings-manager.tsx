"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Youtube, Loader2, Save, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SettingsManager() {
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("key", "youtube_video_id")
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        setYoutubeVideoId(data.value);
        setYoutubeUrl(`https://www.youtube.com/watch?v=${data.value}`);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractVideoId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url);
    const videoId = extractVideoId(url);
    if (videoId) {
      setYoutubeVideoId(videoId);
    }
  };

  const handleSave = async () => {
    if (!youtubeVideoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video ID or URL",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Use upsert with key-value structure
      const { error } = await supabase.from("site_settings").upsert(
        {
          key: "youtube_video_id",
          value: youtubeVideoId,
        },
        {
          onConflict: "key",
        }
      );

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "YouTube video has been updated successfully",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">
            Configure your portfolio settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* YouTube Video Settings */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Featured YouTube Video
          </CardTitle>
          <CardDescription>
            This video will be displayed in the Music section of your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL or Video ID</Label>
            <div className="flex gap-2">
              <Input
                id="youtube-url"
                value={youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or video ID"
                className="flex-1"
              />
              {youtubeVideoId && (
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://youtube.com/watch?v=${youtubeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {youtubeVideoId && (
            <div className="space-y-2">
              <Label>Extracted Video ID</Label>
              <Input value={youtubeVideoId} readOnly className="font-mono" />
            </div>
          )}

          {/* Video Preview */}
          {youtubeVideoId && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title="YouTube video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="text-muted-foreground">
              <p>Supported URL formats:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>https://youtube.com/watch?v=VIDEO_ID</li>
                <li>https://youtu.be/VIDEO_ID</li>
                <li>https://youtube.com/embed/VIDEO_ID</li>
                <li>Just the video ID (11 characters)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
