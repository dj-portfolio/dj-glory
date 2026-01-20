"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  ImageIcon,
  Link2,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { DashboardOverview } from "./dashboard-overview";
import { GalleryManager } from "./gallery-manager";
import { PlatformsManager, Platform } from "./platforms-manager";
import { MessagesManager } from "./messages-manager";
import { SettingsManager } from "./settings-manager";

interface AdminDashboardProps {
  user: User;
  initialSettings: {
    youtube_video_id: string;
  } | null;
  initialGallery: Array<{
    id: string;
    url: string;
    title: string;
    category: string;
    display_order: number;
  }>;
  initialMessages: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>;
  initialPageViews: Array<{
    id: string;
    page: string;
    created_at: string;
  }>;
  initialPlatforms: Platform[];
}

export function AdminDashboard({
  user,
  initialSettings,
  initialGallery,
  initialMessages,
  initialPageViews,
  initialPlatforms,
}: AdminDashboardProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const unreadMessages = initialMessages.filter((m) => !m.is_read).length;

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "platforms", label: "Platforms", icon: Link2 },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      badge: unreadMessages,
    },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            <h1 className="text-xl font-bold">
              <span className="text-primary">DJ</span> Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-57px)] bg-card/50 border-r border-border p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.badge ? (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-[57px] bottom-0 w-64 bg-card border-r border-border p-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.badge ? (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="hidden"
          >
            <TabsList>
              {navItems.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {activeTab === "overview" && (
            <DashboardOverview
              pageViews={initialPageViews}
              messagesCount={initialMessages.length}
              unreadCount={unreadMessages}
              galleryCount={initialGallery.length}
            />
          )}
          {activeTab === "gallery" && <GalleryManager />}
          {activeTab === "platforms" && (
            <PlatformsManager initialPlatforms={initialPlatforms} />
          )}
          {activeTab === "messages" && (
            <MessagesManager initialMessages={initialMessages} />
          )}
          {activeTab === "settings" && (
            <SettingsManager initialSettings={initialSettings} />
          )}
        </main>
      </div>
    </div>
  );
}
