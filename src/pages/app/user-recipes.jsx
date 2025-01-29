import { useRecipes } from "@/components/providers/recipes-provider";
import { useDogs } from "@/components/providers/dogs-provider";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RecipeTable } from "@/components/app/recipes/recipe-table";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function UserRecipesPage() {
    const { recipes, loading: recipesLoading, deleteRecipe } = useRecipes();
    const { dogs } = useDogs();

    const handleDeleteRecipe = async (recipeId) => {
        try {
            await deleteRecipe(recipeId);
            toast.success("Recipe deleted successfully");
        } catch (error) {
            console.error("Error deleting recipe:", error);
            toast.error("Failed to delete recipe");
        }
    };

    const getDogName = (dogId) => {
        const dog = dogs.find((d) => d.dog_id === dogId);
        return dog?.dog_name || "Unknown Dog";
    };

    const formatIngredients = (recipeIngredients) => {
        if (!recipeIngredients?.length) return "No ingredients";

        const ingredients = recipeIngredients.map(
            (ri) => ri.ingredients.ingredient_name
        );

        if (ingredients.length <= 3) {
            return ingredients.join(", ");
        }

        return `${ingredients.slice(0, 3).join(", ")} +${
            ingredients.length - 3
        } more`;
    };

    if (recipesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (recipes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <h1 className="text-3xl font-bold">No Recipes Created</h1>
                <p className="text-muted-foreground mt-2 mb-8">
                    Get started by creating your first recipe for your dog
                </p>
                <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Recipe
                </Button>
            </div>
        );
    }

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Dashboard
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Your recipes</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Your Recipes
                            </h1>
                            <p className="text-muted-foreground">
                                Manage and organize your dog's recipes
                            </p>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Recipe
                        </Button>
                    </div>

                    <RecipeTable onDelete={handleDeleteRecipe} />
                </div>
            </div>
        </>
    );
}
