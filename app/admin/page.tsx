import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Fetch initial data
  const [settingsRes, galleryRes, messagesRes, viewsRes, platformsRes] = await Promise.all([
    supabase.from("site_settings").select("*"),
    supabase
      .from("gallery_images")
      .select("*")
      .order("display_order", { ascending: true }),
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("page_views")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("platforms")
      .select("*")
      .order("display_order", { ascending: true }),
  ]);

  // Convert key-value settings to object
  const settingsArray = settingsRes.data || [];
  const settings = {
    youtube_video_id:
      settingsArray.find((s: { key: string }) => s.key === "youtube_video_id")
        ?.value || "dQw4w9WgXcQ",
  };

  return (
    <AdminDashboard
      user={user}
      initialSettings={settings}
      initialGallery={galleryRes.data || []}
      initialMessages={messagesRes.data || []}
      initialPageViews={viewsRes.data || []}
      initialPlatforms={platformsRes.data || []}
    />
  );
}

