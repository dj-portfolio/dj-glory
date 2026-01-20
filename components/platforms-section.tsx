"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

gsap.registerPlugin(ScrollTrigger);

interface Platform {
  id: string;
  name: string;
  url: string;
  icon_url: string | null;
  color: string;
  display_order: number;
  is_active: boolean;
}

export function PlatformsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch platforms from database
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    async function fetchPlatforms() {
      try {
        const { data, error } = await supabase
          .from("platforms")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!error && data) {
          setPlatforms(data);
        }
      } catch (err) {
        console.error("Error fetching platforms:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlatforms();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("platforms-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "platforms" },
        () => {
          fetchPlatforms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // GSAP animations - run after platforms load
  useEffect(() => {
    if (isLoading || platforms.length === 0) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Title animation
        gsap.fromTo(
          ".platforms-title",
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".platforms-title",
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Cards animation
        gsap.fromTo(
          ".platform-card",
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".platforms-grid",
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, platforms.length]);

  if (isLoading) {
    return (
      <section id="platforms" className="relative py-24 md:py-32 overflow-hidden">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (platforms.length === 0) {
    return null;
  }

  return (
    <section
      id="platforms"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="platforms-title inline-block text-primary font-mono text-sm tracking-widest uppercase mb-4">
            Streaming Platforms
          </span>
          <h2 className="platforms-title text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Available Everywhere
          </h2>
          <p className="platforms-title text-muted-foreground text-lg max-w-2xl mx-auto">
            Stream my music on your favorite platform or follow me on social media
          </p>
        </div>

        {/* Platforms Grid - Fixed alignment */}
        <div className="platforms-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="platform-card group relative p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex flex-col items-center text-center"
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                style={{ 
                  background: `radial-gradient(circle at center, ${platform.color}40 0%, transparent 70%)` 
                }}
              />

              {/* Icon */}
              <div className="relative z-10 mb-4">
                {platform.icon_url ? (
                  <img 
                    src={platform.icon_url} 
                    alt={platform.name}
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: platform.color }}
                  >
                    <span className="text-xl font-bold text-white">
                      {platform.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="relative z-10 font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300">
                {platform.name}
              </h3>

              {/* Arrow on hover */}
              <div className="relative z-10 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>

              {/* Border glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: `0 0 20px ${platform.color}50`,
                }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
