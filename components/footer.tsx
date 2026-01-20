"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-12 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="text-2xl font-bold tracking-tighter">
            <span className="text-foreground">DJ</span>
            <span className="text-primary">.</span>
            <span className="text-primary">GLORY</span>
          </div>

          {/* Copyright */}
          <p className="text-muted-foreground text-sm text-center">
            &copy; {currentYear} DJ Glory. All rights reserved.
          </p>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Press Kit
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
