"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  MailOpen,
  Trash2,
  Clock,
  User,
  MessageSquare,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = getSupabaseBrowserClient();

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkAsRead = async (id: string) => {
    setMarkingRead(id);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, is_read: true } : null
        );
      }
    } catch (error) {
      console.error("Mark read error:", error);
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      });
    } finally {
      setMarkingRead(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      toast({
        title: "Message deleted",
        description: "The message has been removed",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = messages.filter((m) => !m.is_read).map((m) => m.id);
    if (unreadIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (error) throw error;

      setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      toast({
        title: "All read",
        description: "All messages marked as read",
      });
    } catch (error) {
      console.error("Mark all read error:", error);
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  const openMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await handleMarkAsRead(message.id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Messages</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All messages read"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`bg-card/50 border-border/50 cursor-pointer transition-colors hover:bg-card/80 ${
              !message.is_read ? "border-l-4 border-l-primary" : ""
            }`}
            onClick={() => openMessage(message)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 ${message.is_read ? "text-muted-foreground" : "text-primary"}`}
                >
                  {message.is_read ? (
                    <MailOpen className="w-5 h-5" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`font-medium truncate ${!message.is_read ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {message.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                  <p
                    className={`text-sm truncate ${!message.is_read ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {message.subject}
                  </p>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {message.message}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!message.is_read && (
                    <Badge variant="default" className="text-xs">
                      New
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(message.id);
                    }}
                    disabled={deleting === message.id}
                  >
                    {deleting === message.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length === 0 && (
        <Card className="bg-card/50 border-border/50 border-dashed">
          <CardHeader className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-muted-foreground">
              No messages yet
            </CardTitle>
            <CardDescription>
              Messages from your contact form will appear here
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
                <DialogDescription>
                  <span className="flex items-center gap-2 mt-2">
                    <User className="w-4 h-4" />
                    {selectedMessage.name}
                  </span>
                  <span className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </span>
                  <span className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedMessage.id)}
                  disabled={deleting === selectedMessage.id}
                >
                  {deleting === selectedMessage.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
                <Button asChild>
                  <a href={`mailto:${selectedMessage.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Reply
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
