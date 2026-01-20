"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Upload,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

export interface Platform {
  id: string;
  name: string;
  url: string;
  icon_url: string | null;
  color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlatformsManagerProps {
  initialPlatforms: Platform[];
}

export function PlatformsManager({ initialPlatforms }: PlatformsManagerProps) {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    color: "#00FF00",
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const resetForm = () => {
    setFormData({ name: "", url: "", color: "#00FF00" });
    setIconFile(null);
    setIconPreview(null);
    setEditingPlatform(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (platform: Platform) => {
    setEditingPlatform(platform);
    setFormData({
      name: platform.name,
      url: platform.url,
      color: platform.color,
    });
    setIconPreview(platform.icon_url);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Maximum size is 2MB.");
      return;
    }

    // Validate image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const { width, height } = img;
      
      // Check minimum size
      if (width < 64 || height < 64) {
        alert("Image too small. Minimum size is 64x64 pixels.");
        return;
      }
      
      // Check maximum size
      if (width > 512 || height > 512) {
        alert("Image too large. Maximum size is 512x512 pixels.");
        return;
      }
      
      // Check aspect ratio (should be roughly square - within 20% tolerance)
      const aspectRatio = width / height;
      if (aspectRatio < 0.8 || aspectRatio > 1.2) {
        alert("Image should be square or nearly square (1:1 aspect ratio).");
        return;
      }
      
      // Valid image - set it
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      alert("Failed to load image. Please try another file.");
    };
    
    img.src = objectUrl;
  };

  const uploadIcon = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `icons/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("platform-icons")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from("platform-icons")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      alert("Please fill in name and URL");
      return;
    }

    setIsLoading(true);

    try {
      let iconUrl = editingPlatform?.icon_url || null;

      // Upload new icon if selected
      if (iconFile) {
        iconUrl = await uploadIcon(iconFile);
      }

      if (editingPlatform) {
        // Update existing
        const { error } = await supabase
          .from("platforms")
          .update({
            name: formData.name,
            url: formData.url,
            color: formData.color,
            icon_url: iconUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPlatform.id);

        if (error) throw error;

        setPlatforms(platforms.map(p => 
          p.id === editingPlatform.id 
            ? { ...p, ...formData, icon_url: iconUrl, updated_at: new Date().toISOString() }
            : p
        ));
      } else {
        // Create new
        const maxOrder = Math.max(...platforms.map(p => p.display_order), 0);
        const { data, error } = await supabase
          .from("platforms")
          .insert({
            name: formData.name,
            url: formData.url,
            color: formData.color,
            icon_url: iconUrl,
            display_order: maxOrder + 1,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPlatforms([...platforms, data]);
        }
      }

      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (platform: Platform) => {
    if (!confirm(`Delete "${platform.name}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from("platforms")
        .delete()
        .eq("id", platform.id);

      if (error) throw error;

      setPlatforms(platforms.filter(p => p.id !== platform.id));
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  const handleToggleActive = async (platform: Platform) => {
    try {
      const { error } = await supabase
        .from("platforms")
        .update({ is_active: !platform.is_active })
        .eq("id", platform.id);

      if (error) throw error;

      setPlatforms(platforms.map(p =>
        p.id === platform.id ? { ...p, is_active: !p.is_active } : p
      ));
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platforms</h2>
          <p className="text-muted-foreground">
            Manage your streaming and social media platforms
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Platform
        </Button>
      </div>

      {/* Platforms Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platforms
          .sort((a, b) => a.display_order - b.display_order)
          .map((platform) => (
            <Card 
              key={platform.id} 
              className={`bg-card/50 border-border/50 transition-opacity ${
                !platform.is_active ? "opacity-50" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    {platform.icon_url ? (
                      <img 
                        src={platform.icon_url} 
                        alt={platform.name}
                        className="w-8 h-8 rounded object-contain"
                        style={{ backgroundColor: platform.color + "20" }}
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: platform.color + "30" }}
                      >
                        <ImageIcon className="w-4 h-4" style={{ color: platform.color }} />
                      </div>
                    )}
                    <CardTitle className="text-base">{platform.name}</CardTitle>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full border-2"
                    style={{ backgroundColor: platform.color, borderColor: platform.color }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <a 
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary truncate block"
                  >
                    {platform.url}
                    <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={platform.is_active}
                        onCheckedChange={() => handleToggleActive(platform)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {platform.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => openEditDialog(platform)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDelete(platform)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {platforms.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No platforms added yet. Click "Add Platform" to get started.
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlatform ? "Edit Platform" : "Add Platform"}
            </DialogTitle>
            <DialogDescription>
              {editingPlatform 
                ? "Update the platform details below."
                : "Add a new streaming or social media platform."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Platform Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Platform Name</Label>
              <Input
                id="name"
                placeholder="e.g., Spotify, Apple Music"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">Profile URL</Label>
              <Input
                id="url"
                placeholder="https://open.spotify.com/artist/..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>

            {/* Brand Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#1DB954"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Icon Upload */}
            <div className="space-y-2">
              <Label>Platform Icon (PNG, JPG)</Label>
              <div className="flex items-center gap-4">
                {iconPreview ? (
                  <div className="relative">
                    <img 
                      src={iconPreview} 
                      alt="Icon preview"
                      className="w-16 h-16 rounded object-contain border border-border"
                      style={{ backgroundColor: formData.color + "20" }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIconFile(null);
                        setIconPreview(null);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div 
                    className="w-16 h-16 rounded border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {iconPreview ? "Change Icon" : "Upload Icon"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 128x128px transparent PNG
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingPlatform ? "Update" : "Add"} Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
