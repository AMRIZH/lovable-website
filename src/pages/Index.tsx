import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChefHat, Clock } from "lucide-react";
import { format } from "date-fns";

type Recipe = {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: { username: string | null } | null;
};

export default function Index() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [localSearch, setLocalSearch] = useState(query);

  useEffect(() => {
    fetchRecipes();
  }, [query]);

  async function fetchRecipes() {
    setLoading(true);
    let q = (supabase as any)
      .from("recipes")
      .select("id, title, image_url, created_at, user_id, profiles(username)")
      .order("created_at", { ascending: false });

    if (query) {
      q = q.ilike("title", `%${query}%`);
    }

    const { data, error } = await q;
    if (!error && data) {
      setRecipes(data as unknown as Recipe[]);
    }
    setLoading(false);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(localSearch ? { q: localSearch } : {});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="mb-3 font-serif text-4xl font-bold">Discover Recipes</h1>
        <p className="text-lg text-muted-foreground">Find and share delicious recipes from our community</p>
        <form onSubmit={handleSearch} className="mx-auto mt-6 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by recipe title..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-12 pl-11 text-base"
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 rounded-t-lg bg-muted" />
              <CardContent className="p-5">
                <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <ChefHat className="mb-4 h-16 w-16 text-muted-foreground/40" />
          <h2 className="mb-2 font-serif text-2xl font-semibold">No recipes found</h2>
          <p className="text-muted-foreground">
            {query ? `No recipes match "${query}". Try a different search.` : "Be the first to share a recipe!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Link key={recipe.id} to={`/recipe/${recipe.id}`}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ChefHat className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="mb-2 font-serif text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{recipe.profiles?.username || "Anonymous"}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(recipe.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
