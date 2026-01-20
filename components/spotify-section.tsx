"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Get Spotify URL from environment variable
const SPOTIFY_URL = process.env.NEXT_PUBLIC_SPOTIFY_URL || "https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02";

// Extract artist ID from Spotify URL for embed
function getSpotifyEmbedUrl(url: string): string {
  // Handle both artist and playlist URLs
  const artistMatch = url.match(/artist\/([a-zA-Z0-9]+)/);
  const playlistMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
  const albumMatch = url.match(/album\/([a-zA-Z0-9]+)/);
  
  if (artistMatch) {
    return `https://open.spotify.com/embed/artist/${artistMatch[1]}?utm_source=generator&theme=0`;
  } else if (playlistMatch) {
    return `https://open.spotify.com/embed/playlist/${playlistMatch[1]}?utm_source=generator&theme=0`;
  } else if (albumMatch) {
    return `https://open.spotify.com/embed/album/${albumMatch[1]}?utm_source=generator&theme=0`;
  }
  
  // Fallback: assume it's an artist ID
  return `https://open.spotify.com/embed/artist/06HL4z0CvFAxyc27GXpf02?utm_source=generator&theme=0`;
}

export function SpotifySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".spotify-title", {
        scrollTrigger: {
          trigger: ".spotify-title",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".spotify-embed", {
        scrollTrigger: {
          trigger: ".spotify-embed",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    hasAnimated.current = true;
    return () => ctx.revert();
  }, []);

  const embedUrl = getSpotifyEmbedUrl(SPOTIFY_URL);

  return (
    <section
      id="spotify"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Header with Visit Spotify button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="spotify-title inline-block text-primary font-mono text-sm tracking-widest uppercase mb-2">
              FEATURED SET
            </span>
            <h2 className="spotify-title text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Listen inside the site
            </h2>
          </div>
          <a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="spotify-title hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-border/50 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary transition-all duration-300"
          >
            Visit Spotify
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Spotify Embed */}
        <div className="spotify-embed rounded-2xl overflow-hidden bg-card/30 border border-border/30 shadow-2xl">
          <iframe
            style={{ borderRadius: "12px" }}
            src={embedUrl}
            width="100%"
            height="552"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Player"
            className="w-full"
          />
        </div>

        {/* Mobile Visit Spotify button */}
        <div className="mt-8 text-center sm:hidden">
          <a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] text-white font-semibold rounded-full hover:scale-105 transition-transform duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Open in Spotify
          </a>
        </div>
      </div>
    </section>
  );
}
