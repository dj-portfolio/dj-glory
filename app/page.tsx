"use client";

import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { SpotifySection } from "@/components/spotify-section";
import { MusicSection } from "@/components/music-section";
import { GallerySection } from "@/components/gallery-section";
import { PlatformsSection } from "@/components/platforms-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { PageViewTracker } from "@/components/page-view-tracker";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Page View Tracker */}
      <PageViewTracker />
      
      {/* Noise overlay for texture */}
      <div className="noise-overlay" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <section id="home">
        <HeroSection />
      </section>
      
      {/* About Section */}
      <AboutSection />
      
      {/* Spotify Section - Featured Set */}
      <SpotifySection />
      
      {/* Music Section - YouTube Video */}
      <MusicSection />
      
      {/* Gallery Section */}
      <GallerySection />
      
      {/* Platforms Section - All Streaming & Social */}
      <PlatformsSection />
      
      {/* Contact Section */}
      <ContactSection />
      
      {/* Footer */}
      <Footer />
    </main>
  );
}

