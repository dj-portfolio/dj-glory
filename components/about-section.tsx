"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "500+", label: "Live Shows" },
  { value: "1M+", label: "Streams" },
  { value: "50+", label: "Releases" },
  { value: "10+", label: "Years Experience" },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-title", {
        scrollTrigger: {
          trigger: ".about-title",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".about-text", {
        scrollTrigger: {
          trigger: ".about-text",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: ".stats-container",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div ref={contentRef}>
            <span className="about-title inline-block text-primary font-mono text-sm tracking-widest uppercase mb-4">
              About Me
            </span>
            <h2 className="about-title text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8">
              Crafting
              <span className="text-primary block">Sonic Experiences</span>
            </h2>
            <div className="about-text space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Born and raised in the vibrant streets of Mumbai, I discovered my passion
                for electronic music at the age of 15. What started as bedroom productions
                has evolved into a journey spanning continents and connecting souls through
                the universal language of beats.
              </p>
              <p>
                My sound is a fusion of deep house, techno, and progressive elements,
                infused with the rich textures of Indian classical music. Each set is
                crafted to take you on an emotional journey - from the depths of bass to
                the heights of euphoria.
              </p>
              <p>
                Having performed at some of India&apos;s most iconic venues and festivals,
                I continue to push boundaries and explore new sonic territories. Music
                isn&apos;t just what I do - it&apos;s who I am.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-container grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="stat-item p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors duration-300 group"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary group-hover:text-glow-green transition-all">
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-2 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
