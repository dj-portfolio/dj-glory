"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  created_at: string;
}

const categories = ["concert", "studio", "bts", "event", "press"];

export function GalleryManager() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newImage, setNewImage] = useState({
    title: "",
    category: "concert",
    url: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();

  const fetchGallery = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGallery(data || []);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      // Clear URL input when file is selected
      setNewImage((prev) => ({ ...prev, url: "" }));
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAddImage = async () => {
    if (!newImage.title) {
      toast({
        title: "Missing title",
        description: "Please provide a title for the image",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile && !newImage.url) {
      toast({
        title: "Missing image",
        description: "Please upload an image or provide a URL",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let imageUrl = newImage.url;

      // Upload file if selected
      if (selectedFile) {
        imageUrl = await handleFileUpload(selectedFile);
      }

      const { error } = await supabase.from("gallery_images").insert({
        title: newImage.title,
        category: newImage.category,
        url: imageUrl,
      });

      if (error) throw error;

      // Reset form
      setNewImage({ title: "", category: "concert", url: "" });
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsAddOpen(false);
      fetchGallery();
      toast({
        title: "Image added",
        description: "The image has been added to your gallery",
      });
    } catch (error) {
      console.error("Add error:", error);
      toast({
        title: "Error",
        description: "Failed to add image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setDeleting(id);
    try {
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Try to delete from storage if it's a Supabase URL
      if (url.includes("supabase") && url.includes("/storage/")) {
        const pathMatch = url.match(/gallery\/[^?]+/);
        if (pathMatch) {
          await supabase.storage.from("images").remove([pathMatch[0]]);
        }
      }

      setGallery((prev) => prev.filter((img) => img.id !== id));
      toast({
        title: "Image deleted",
        description: "The image has been removed from your gallery",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setNewImage({ title: "", category: "concert", url: "" });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gallery Manager</h2>
          <p className="text-muted-foreground">
            Add, remove, and organize your gallery images
          </p>
        </div>
        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
              <DialogDescription>
                Upload a new image to your gallery
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newImage.title}
                  onChange={(e) =>
                    setNewImage((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Sunburn Festival 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newImage.category}
                  onValueChange={(value) =>
                    setNewImage((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                {previewUrl || newImage.url ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={previewUrl || newImage.url || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        setNewImage((prev) => ({ ...prev, url: "" }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, GIF up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Or paste image URL</Label>
                <Input
                  id="url"
                  value={newImage.url}
                  onChange={(e) => {
                    setNewImage((prev) => ({ ...prev, url: e.target.value }));
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  placeholder="https://..."
                  disabled={!!selectedFile}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddImage} disabled={uploading}>
                {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gallery Grid */}
      {gallery.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gallery.map((image) => (
            <Card
              key={image.id}
              className="group bg-card/50 border-border/50 overflow-hidden"
            >
              <div className="relative aspect-video">
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeleteImage(image.id, image.url)}
                    disabled={deleting === image.id}
                  >
                    {deleting === image.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{image.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {image.category}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card/50 border-border/50 border-dashed">
          <CardHeader className="text-center py-12">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-muted-foreground">
              No images yet
            </CardTitle>
            <CardDescription>
              Click &quot;Add Image&quot; to add your first gallery image
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
