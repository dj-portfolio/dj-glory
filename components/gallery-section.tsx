"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

gsap.registerPlugin(ScrollTrigger);

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

// Fallback images if database is empty or unavailable
const fallbackImages: GalleryImage[] = [
  { id: "1", url: "/gallery/concert-1.jpg", title: "Live performance at Sunburn Festival", category: "Live Shows" },
  { id: "2", url: "/gallery/studio-1.jpg", title: "Studio session", category: "Studio" },
  { id: "3", url: "/gallery/concert-2.jpg", title: "Club night at Kitty Su", category: "Live Shows" },
  { id: "4", url: "/gallery/bts-1.jpg", title: "Behind the scenes", category: "BTS" },
  { id: "5", url: "/gallery/concert-3.jpg", title: "Festival performance", category: "Live Shows" },
  { id: "6", url: "/gallery/studio-2.jpg", title: "Music production", category: "Studio" },
];

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(fallbackImages);
  const [loading, setLoading] = useState(true);

  // Fetch gallery images from database
  useEffect(() => {
    async function fetchGallery() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("gallery_images")
          .select("id, url, title, category")
          .order("display_order", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setGalleryImages(data);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
        // Keep fallback images on error
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.from(".gallery-title", {
        scrollTrigger: {
          trigger: ".gallery-title",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".gallery-item", {
        scrollTrigger: {
          trigger: ".gallery-grid",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, galleryImages]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="gallery-title inline-block text-primary font-mono text-sm tracking-widest uppercase mb-4">
            Gallery
          </span>
          <h2 className="gallery-title text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Captured Moments
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "bg-secondary/50 animate-pulse rounded-xl",
                  i === 0 ? "md:col-span-2 md:row-span-2 aspect-square" : "aspect-video"
                )}
              />
            ))}
          </div>
        ) : (
          /* Gallery Grid */
          <div className="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <button
                type="button"
                key={image.id}
                className={cn(
                  "gallery-item relative overflow-hidden rounded-xl group cursor-pointer",
                  index === 0 && "md:col-span-2 md:row-span-2",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                )}
                onClick={() => setSelectedImage(image)}
              >
                <div className={cn("relative w-full", index === 0 ? "aspect-square" : "aspect-video")}>
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-primary font-mono text-xs uppercase tracking-wider mb-2">
                      {image.category}
                    </span>
                    <p className="text-foreground font-medium">{image.title}</p>
                  </div>

                  {/* Border glow */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-xl transition-colors duration-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute top-6 right-6 w-12 h-12 rounded-full border border-border/50 flex items-center justify-center hover:bg-card transition-colors"
            onClick={() => setSelectedImage(null)}
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-5xl max-h-[80vh] w-full aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage.url || "/placeholder.svg"}
              alt={selectedImage.title}
              fill
              className="object-contain rounded-xl"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
        </div>
      )}
    </section>
  );
}
