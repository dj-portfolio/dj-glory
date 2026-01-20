"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith("/admin")) return;

    const trackPageView = async () => {
      const supabase = getSupabaseBrowserClient();

      try {
        // Simply insert a new page view record
        // Each row represents one view
        await supabase.from("page_views").insert({
          page: pathname,
        });
      } catch (error) {
        // Silently fail - don't break the site for analytics
        console.error("Page view tracking error:", error);
      }
    };

    trackPageView();
  }, [pathname]);

  return null;
}
