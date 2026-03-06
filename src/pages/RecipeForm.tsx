import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";
import { ImageIcon, LinkIcon, Upload } from "lucide-react";

export default function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageTab, setImageTab] = useState("url");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (isEdit && id) loadRecipe();
  }, [id, user]);

  async function loadRecipe() {
    const { data, error } = await (supabase as any).from("recipes").select("*").eq("id", id!).single();
    if (error || !data) {
      toast({ title: "Recipe not found", variant: "destructive" });
      navigate("/");
      return;
    }
    if (data.user_id !== user?.id) {
      toast({ title: "You can only edit your own recipes", variant: "destructive" });
      navigate("/");
      return;
    }
    setTitle(data.title);
    setDescription(data.description || "");
    setImageUrl(data.image_url || "");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("recipe-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("recipe-images").getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast({ title: "Image uploaded!" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const payload = {
      title,
      description,
      image_url: imageUrl || null,
      user_id: user.id,
    };

    let error;
    if (isEdit) {
      ({ error } = await (supabase as any).from("recipes").update(payload).eq("id", id!));
    } else {
      ({ error } = await (supabase as any).from("recipes").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "Recipe updated!" : "Recipe created!" });
      navigate("/");
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">{isEdit ? "Edit Recipe" : "Create New Recipe"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Delicious Recipe" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor content={description} onChange={setDescription} />
            </div>

            <div className="space-y-2">
              <Label>Recipe Image</Label>
              <Tabs value={imageTab} onValueChange={setImageTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url"><LinkIcon className="h-4 w-4 mr-1" /> Paste URL</TabsTrigger>
                  <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-1" /> Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-3">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="upload" className="mt-3">
                  <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  {uploading && <p className="mt-1 text-sm text-muted-foreground">Uploading...</p>}
                </TabsContent>
              </Tabs>
              {imageUrl && (
                <div className="mt-3 overflow-hidden rounded-lg border">
                  <img src={imageUrl} alt="Preview" className="max-h-48 w-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Update Recipe" : "Create Recipe"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
