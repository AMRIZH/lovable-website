import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ChefHat, Clock, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: { username: string | null } | null;
};

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchRecipe();
  }, [id]);

  async function fetchRecipe() {
    const { data, error } = await (supabase as any)
      .from("recipes")
      .select("*, profiles(username)")
      .eq("id", id!)
      .single();
    if (error || !data) {
      toast({ title: "Recipe not found", variant: "destructive" });
      navigate("/");
    } else {
      setRecipe(data as unknown as Recipe);
    }
    setLoading(false);
  }

  async function handleDelete() {
    const { error } = await (supabase as any).from("recipes").delete().eq("id", id!);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Recipe deleted" });
      navigate("/");
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl animate-pulse px-4 py-8">
        <div className="mb-6 h-8 w-1/3 rounded bg-muted" />
        <div className="mb-4 h-64 rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  const isOwner = user?.id === recipe.user_id;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to recipes
      </Link>

      <h1 className="mb-4 font-serif text-3xl font-bold md:text-4xl">{recipe.title}</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span>{recipe.profiles?.username || "Anonymous"}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {format(new Date(recipe.created_at), "MMMM d, yyyy")}
        </span>
        {isOwner && (
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/recipe/${recipe.id}/edit`)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this recipe?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {recipe.image_url ? (
        <img src={recipe.image_url} alt={recipe.title} className="mb-8 w-full rounded-xl object-cover max-h-[500px]" />
      ) : (
        <div className="mb-8 flex h-64 items-center justify-center rounded-xl bg-muted">
          <ChefHat className="h-16 w-16 text-muted-foreground/30" />
        </div>
      )}

      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: recipe.description || "<p>No description provided.</p>" }} />
    </div>
  );
}
