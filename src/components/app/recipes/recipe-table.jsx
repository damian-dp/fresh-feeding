import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertTriangleIcon,
    BoneIcon,
    CheckIcon,
    DogIcon,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
} from "lucide-react";
import { useRecipes } from "@/components/providers/recipes-provider";
import { useDogs } from "@/components/providers/dogs-provider";
import { formatDate } from "@/lib/utils";
import { BadgeStack } from "@/components/ui/badge-stack";
import { useRef, useEffect, useState } from "react";
import { RecipeSheet } from "./recipe-sheet";
import { toast } from "sonner";

export function RecipeTable({
    // Configurable columns
    showRecipeName = true,
    showDog = true,
    showIngredients = true,
    showNutritionStatus = true,
    showActions = true,
    // Optional limit of entries to show
    limit,
    // Optional callback for delete action
    onDelete,
    // Optional callback for edit action
    onEdit,
    // Add this prop
    dogId,
    // Add this prop
    onCreateRecipe,
    // Add this prop
    open,
    // Add this prop
    onOpenChange,
}) {
    const { recipes } = useRecipes();
    const { dogs, loading } = useDogs();
    const tableRef = useRef(null);
    const [tableWidth, setTableWidth] = useState(0);
    const [internalSheetOpen, setInternalSheetOpen] = useState(false);
    const isSheetOpen = open !== undefined ? open : internalSheetOpen;
    const [sheetMode, setSheetMode] = useState("view");
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    useEffect(() => {
        if (!tableRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setTableWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(tableRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Only show ingredients if both prop is true and table is wide enough
    const shouldShowIngredients = showIngredients && tableWidth > 980;
    const shouldShowNutritionStatus = showNutritionStatus && tableWidth > 720;

    // Get dog name helper function
    const getDogName = (dogId) => {
        const dog = dogs.find((d) => d.dog_id === dogId);
        return dog ? dog.dog_name : "Unknown Dog";
    };

    // Format ingredients helper function
    const formatIngredients = (ingredients) => {
        if (
            !ingredients ||
            !Array.isArray(ingredients) ||
            ingredients.length === 0
        ) {
            return "No ingredients";
        }

        const names = ingredients
            .filter((ing) => ing?.ingredients?.ingredient_name)
            .map((ing) => ing.ingredients.ingredient_name);

        if (names.length === 0) return "No ingredients";

        // Show first 8 ingredients + count of remaining
        if (names.length <= 7) {
            return names.join(", ");
        }

        const remaining = names.length - 7;
        return (
            <>
                <span className="text-foreground">Ingredients: </span>
                {names.slice(0, 7).join(", ")}
                <span className="text-foreground">
                    {" "}
                    +{remaining}{" "}
                    {remaining === 1 ? "ingredient." : "ingredients."}
                </span>
            </>
        );
    };

    // Update the visibleRecipes logic to filter by dogId if provided
    const visibleRecipes = recipes
        .filter((recipe) => !dogId || recipe.dog_id === dogId) // Filter by dogId if provided
        .slice(0, limit || recipes.length);

    // Update the handler functions
    const handleViewRecipe = (recipe) => {
        setSelectedRecipe(recipe);
        setSheetMode("view");
        if (onOpenChange) {
            onOpenChange(true);
        } else {
            setInternalSheetOpen(true);
        }
    };

    const handleEditRecipe = (recipe) => {
        setSelectedRecipe(recipe);
        setSheetMode("edit");
        if (onOpenChange) {
            onOpenChange(true);
        } else {
            setInternalSheetOpen(true);
        }
    };

    const handleDeleteRecipe = async (recipeId) => {
        if (onDelete) {
            onDelete(recipeId);
        } else {
            try {
                await deleteRecipe(recipeId);
                toast.success("Recipe deleted successfully");
            } catch (error) {
                console.error("Error deleting recipe:", error);
                toast.error("Failed to delete recipe");
            }
        }
    };

    // Update sheetOpen to use the external state if provided
    const handleSheetOpenChange = (newOpen) => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setInternalSheetOpen(newOpen);
        }
        if (!newOpen) {
            setSelectedRecipe(null);
            setSheetMode("view");
        }
    };

    // Add effect to handle external create trigger
    useEffect(() => {
        if (open && !selectedRecipe) {
            setSheetMode("create");
        }
    }, [open, selectedRecipe]);

    // Get visible columns
    const columns = [
        showRecipeName && {
            id: "name",
            header: "Recipe Name",
            cell: (recipe) => (
                <TableCell
                    key={`${recipe.recipe_id}-name`}
                    className="font-medium sticky left-0 border-r border-border bg-card"
                >
                    <p className="font-medium mb-0.5 whitespace-nowrap">
                        {recipe.recipe_name}
                    </p>
                    <p className="font-normal text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(recipe.created_at)}
                    </p>
                </TableCell>
            ),
        },
        showDog && {
            id: "dog",
            header: "Dog",
            cell: (recipe) => {
                // Find the dog for this recipe
                const dog = dogs.find((d) => d.dog_id === recipe.dog_id);

                return (
                    <TableCell
                        className="border-r border-border"
                        key={`${recipe.recipe_id}-dog`}
                    >
                        <BadgeStack
                            variant="default"
                            icon={<DogIcon />}
                            label={getDogName(recipe.dog_id)}
                            sublabel={
                                dog
                                    ? `Daily intake: ${Math.round(
                                          dog.weight_metric *
                                              1000 *
                                              (dog.ratios_intake / 100)
                                      )}g`
                                    : ""
                            }
                            flipped={false}
                            showSublabel={!!dog}
                        />
                    </TableCell>
                );
            },
        },
        shouldShowIngredients && {
            id: "ingredients",
            header: "Ingredients",
            cell: (recipe) => (
                <TableCell
                    key={`${recipe.recipe_id}-ingredients`}
                    className="text-xs text-muted-foreground leading-[1.15rem] border-r border-border"
                >
                    {formatIngredients(recipe.recipe_ingredients)}
                </TableCell>
            ),
        },
        shouldShowNutritionStatus && {
            id: "nutrition-status",
            header: "Nutrition Status",
            cell: (recipe) => {
                // Find the dog for this recipe
                const nutritionStatus = recipe.isNutritionallyBalanced;

                return (
                    <TableCell
                        className="border-r border-border"
                        key={`${recipe.recipe_id}-nutrition-status`}
                    >
                        {nutritionStatus ? (
                            <BadgeStack
                                variant="success"
                                icon={<CheckIcon />}
                                label="Likely balanced"
                                sublabel="Nutrition status"
                                flipped={true}
                            />
                        ) : (
                            <BadgeStack
                                variant="warning"
                                icon={<AlertTriangleIcon />}
                                label="Possible deficit"
                                sublabel="Nutrition status"
                                flipped={true}
                            />
                        )}
                    </TableCell>
                );
            },
        },
        showActions && {
            id: "actions",
            header: "",
            cell: (recipe) => (
                <TableCell
                    key={`${recipe.recipe_id}-actions`}
                    className="lg:px-4 flex justify-center"
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleViewRecipe(recipe)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleEditRecipe(recipe)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                    handleDeleteRecipe(recipe.recipe_id)
                                }
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            ),
        },
    ].filter(Boolean);

    return (
        <>
            <Table ref={tableRef} className="w-full max-w-full">
                <TableBody>
                    {visibleRecipes.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="text-center h-24 min-w-0"
                            >
                                No recipes found
                            </TableCell>
                        </TableRow>
                    ) : (
                        visibleRecipes.map((recipe) => (
                            <TableRow key={recipe.recipe_id}>
                                {columns.map(
                                    (column) => column && column.cell(recipe)
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <RecipeSheet
                mode={sheetMode}
                recipe={selectedRecipe}
                open={isSheetOpen}
                onOpenChange={handleSheetOpenChange}
                defaultDogId={dogId}
            />
        </>
    );
}
