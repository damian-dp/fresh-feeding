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
        <div className="container max-w-7xl mx-auto py-8 px-4">
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

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Recipe Name</TableHead>
                                <TableHead>Dog</TableHead>
                                <TableHead className="max-w-[400px]">
                                    Ingredients
                                </TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recipes.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center h-24"
                                    >
                                        No recipes found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recipes.map((recipe) => (
                                    <TableRow key={recipe.recipe_id}>
                                        <TableCell className="font-medium">
                                            {recipe.recipe_name}
                                        </TableCell>
                                        <TableCell>
                                            {getDogName(recipe.dog_id)}
                                        </TableCell>
                                        <TableCell className="max-w-[400px] truncate">
                                            {formatIngredients(
                                                recipe.recipe_ingredients
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            console.log(
                                                                "Edit recipe",
                                                                recipe.recipe_id
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            handleDeleteRecipe(
                                                                recipe.recipe_id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
