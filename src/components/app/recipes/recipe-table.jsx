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
import { RecipeSheet } from "../recipes/recipe-sheet";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
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
    // Add getDogName prop
    getDogName,
}) {
    const { recipes, deleteRecipe } = useRecipes();
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

    // Create a default implementation if not provided
    const internalGetDogName = (dogId) => {
        const dog = dogs.find((d) => d.dog_id === dogId);
        return dog ? dog.dog_name : "Unknown Dog";
    };

    // Use the provided function or fallback to internal
    const dogNameResolver = getDogName || internalGetDogName;

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
        console.log("Recipe clicked:", recipe);
        setSelectedRecipe(recipe);
        setSheetMode("view");
        if (onOpenChange) {
            onOpenChange(true);
        } else {
            setInternalSheetOpen(true);
        }
    };

    const handleEditRecipe = (recipe) => {
        console.log("Recipe clicked:", recipe);
        setSelectedRecipe(recipe);
        setSheetMode("edit");
        if (onOpenChange) {
            onOpenChange(true);
        } else {
            setInternalSheetOpen(true);
        }
    };

    const handleDeleteRecipe = async (recipeId) => {
        const success = await deleteRecipe(recipeId);
        if (success) {
            toast.success("Recipe deleted successfully");
        } else {
            toast.error("Failed to delete recipe");
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

    // Add effect to log when recipes prop changes
    useEffect(() => {
        console.log("RecipeTable recipes prop changed:", recipes);
    }, [recipes]);

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
                return (
                    <TableCell
                        className="border-r border-border"
                        key={`${recipe.recipe_id}-dog`}
                    >
                        <BadgeStack
                            variant="default"
                            icon={<DogIcon />}
                            label={dogNameResolver(recipe.dog_id)}
                            sublabel="Created for"
                            flipped={true}
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
            header: "Actions",
            cell: (recipe) => (
                <TableCell
                    key={`${recipe.recipe_id}-actions`}
                    className="lg:px-4 flex justify-center items-center"
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
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
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete this
                                            recipe and remove all associated
                                            data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() =>
                                                handleDeleteRecipe(
                                                    recipe.recipe_id
                                                )
                                            }
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Confirm Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
                onOpenChange={(newOpen, options) => {
                    if (options?.mode) {
                        setSheetMode(options.mode);
                    }
                    handleSheetOpenChange(newOpen);
                }}
                onModeChange={(newMode) => setSheetMode(newMode)}
                defaultDogId={dogId}
            />
        </>
    );
}
