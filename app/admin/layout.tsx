import React from "react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | DJ ARJUN",
  description: "Manage your portfolio, gallery, and settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
