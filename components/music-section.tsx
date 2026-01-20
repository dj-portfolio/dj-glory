"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

gsap.registerPlugin(ScrollTrigger);

// Default YouTube video ID if none configured
const DEFAULT_VIDEO_ID = "dQw4w9WgXcQ";

export function MusicSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [videoId, setVideoId] = useState<string>(DEFAULT_VIDEO_ID);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch YouTube video ID from database
  useEffect(() => {
    async function fetchVideoId() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "youtube_video_id")
          .single();

        if (!error && data?.value) {
          setVideoId(data.value);
        }
      } catch (err) {
        console.error("Error fetching video ID:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideoId();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".music-title", {
        scrollTrigger: {
          trigger: ".music-title",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".video-container", {
        scrollTrigger: {
          trigger: ".video-container",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="music"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="music-title inline-block text-primary font-mono text-sm tracking-widest uppercase mb-4">
            Latest Release
          </span>
          <h2 className="music-title text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Watch & Listen
          </h2>
        </div>

        {/* YouTube Video Embed */}
        <div className="video-container max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-border/50 glow-green group">
            <div className="aspect-video">
              {isLoading ? (
                <div className="w-full h-full bg-card/50 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="DJ Glory - Latest Release"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </div>
            {/* Glow effect on hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
