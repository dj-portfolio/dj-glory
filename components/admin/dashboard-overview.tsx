"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  MessageSquare,
  ImageIcon,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface DashboardOverviewProps {
  pageViews: Array<{
    id: string;
    page: string;
    created_at: string;
  }>;
  messagesCount: number;
  unreadCount: number;
  galleryCount: number;
}

export function DashboardOverview({
  pageViews,
  messagesCount,
  unreadCount,
  galleryCount,
}: DashboardOverviewProps) {
  // Aggregate views by date from created_at
  const viewsByDate = pageViews.reduce(
    (acc, view) => {
      const date = new Date(view.created_at).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(viewsByDate)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 14)
    .reverse()
    .map(([date, views]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      views,
    }));

  // Calculate total views
  const totalViews = pageViews.length;
  const today = new Date().toISOString().split("T")[0];
  const todayViews = viewsByDate[today] || 0;

  // Views by page
  const viewsByPage = pageViews.reduce(
    (acc, view) => {
      if (!acc[view.page]) {
        acc[view.page] = 0;
      }
      acc[view.page] += 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pageChartData = Object.entries(viewsByPage)
    .map(([page, views]) => ({
      page:
        page === "/"
          ? "Home"
          : page.replace("/", "").charAt(0).toUpperCase() + page.slice(2),
      views,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const stats = [
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      description: "All time page views",
      icon: Eye,
      color: "text-neon-cyan",
    },
    {
      title: "Today's Views",
      value: todayViews.toLocaleString(),
      description: "Visits today",
      icon: TrendingUp,
      color: "text-neon-green",
    },
    {
      title: "Messages",
      value: messagesCount.toString(),
      description: `${unreadCount} unread`,
      icon: MessageSquare,
      color: "text-primary",
    },
    {
      title: "Gallery Images",
      value: galleryCount.toString(),
      description: "Total images",
      icon: ImageIcon,
      color: "text-neon-lime",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your portfolio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Chart */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Traffic Overview
            </CardTitle>
            <CardDescription>Page views over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No traffic data yet. Views will appear as visitors browse your
                  site.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pages Chart */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Popular Pages
            </CardTitle>
            <CardDescription>
              Most visited sections of your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {pageChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageChartData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      type="category"
                      dataKey="page"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="views"
                      fill="hsl(var(--accent))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No page data yet. Views will appear as visitors browse your
                  site.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
