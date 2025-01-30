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
    DropdownMenuSeparator,
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
import FileAlert from "@/assets/icons/file-alert";

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
    // Add searchQuery prop with default value
    searchQuery = "",
}) {
    const { recipes, deleteRecipe } = useRecipes();
    const { dogs, loading } = useDogs();
    const tableRef = useRef(null);
    const cardRef = useRef(null);
    const [tableWidth, setTableWidth] = useState(0);
    const [cardWidth, setCardWidth] = useState(0);
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

    useEffect(() => {
        if (!cardRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setCardWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(cardRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Only show ingredients if both prop is true and table is wide enough
    const shouldShowIngredients = showIngredients && tableWidth > 0;
    const shouldShowNutritionStatus = showNutritionStatus && cardWidth > 800;
    const shouldShowDog = showDog && cardWidth > 620;

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

    // Filter recipes based on search query
    const filteredRecipes = recipes.filter((recipe) => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase().trim();

        // 1. Search by recipe name
        if (recipe.recipe_name.toLowerCase().includes(query)) {
            return true;
        }

        // 2. Search by dog name
        const dogName = dogNameResolver(recipe.dog_id).toLowerCase();
        if (dogName.includes(query)) {
            return true;
        }

        // 3. Search by ingredients
        if (
            recipe.recipe_ingredients &&
            Array.isArray(recipe.recipe_ingredients)
        ) {
            const hasMatchingIngredient = recipe.recipe_ingredients.some(
                (ing) =>
                    ing?.ingredients?.ingredient_name
                        ?.toLowerCase()
                        .includes(query)
            );
            if (hasMatchingIngredient) {
                return true;
            }
        }

        return false;
    });

    // Apply other filters (dogId, limit) to the filtered results
    const displayedRecipes = filteredRecipes
        .filter((recipe) => !dogId || recipe.dog_id === dogId)
        .slice(0, limit || filteredRecipes.length);

    // Update the handler functions
    const handleViewRecipe = (recipe) => {
        // Get the latest version of the recipe from the recipes array
        const latestRecipe = recipes.find(
            (r) => r.recipe_id === recipe.recipe_id
        );
        // console.log("Viewing recipe:", latestRecipe);
        setSelectedRecipe(latestRecipe);
        setSheetMode("view");
        if (onOpenChange) {
            onOpenChange(true);
        } else {
            setInternalSheetOpen(true);
        }
    };

    const handleEditRecipe = (recipe) => {
        // Get the latest version of the recipe from the recipes array
        const latestRecipe = recipes.find(
            (r) => r.recipe_id === recipe.recipe_id
        );
        // console.log("Editing recipe:", latestRecipe);
        setSelectedRecipe(latestRecipe);
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

    // Update the handleSheetOpenChange function
    const handleSheetOpenChange = (newOpen, options) => {
        // console.log("RecipeTable handleSheetOpenChange:", {
        //     newOpen,
        //     options,
        //     sheetMode,
        // });

        // If we have options with mode and recipe, update both FIRST
        if (options?.mode) {
            // console.log("Setting new mode and recipe:", options);
            // Set mode first
            setSheetMode(options.mode);
            // Then set recipe if provided
            if (options.recipe) {
                // console.log("Setting selected recipe:", options.recipe);
                setSelectedRecipe(options.recipe);
            }
        }

        // Then handle the open state
        if (!newOpen) {
            console.log("Closing sheet, resetting state");
            setSelectedRecipe(null);
            setSheetMode("view");
        }

        if (onOpenChange) {
            onOpenChange(newOpen, options);
        } else {
            setInternalSheetOpen(newOpen);
        }
    };

    // Add effect to handle external create trigger
    useEffect(() => {
        if (open && !selectedRecipe) {
            setSheetMode("create");
        }
    }, [open, selectedRecipe]);

    // Add effect to log when recipes prop changes
    // useEffect(() => {
    //     console.log("RecipeTable recipes prop changed:", recipes);
    // }, [recipes]);

    // Add this near the top of the RecipeTable component, after the state declarations
    useEffect(() => {
        // If we have a selectedRecipe, check if it needs updating from the recipes array
        if (selectedRecipe) {
            const updatedRecipe = recipes.find(
                (r) => r.recipe_id === selectedRecipe.recipe_id
            );
            if (
                updatedRecipe &&
                JSON.stringify(updatedRecipe) !== JSON.stringify(selectedRecipe)
            ) {
                // console.log(
                //     "Updating selectedRecipe with new data:",
                //     updatedRecipe
                // );
                setSelectedRecipe(updatedRecipe);
            }
        }
    }, [recipes, selectedRecipe]);

    // Get visible columns
    const columns = [
        showRecipeName && {
            id: "name",
            header: "Recipe Name",
            cell: (recipe) => (
                <TableCell
                    key={`${recipe.recipe_id}-name`}
                    className="font-medium sticky left-0 border-r border-border bg-card w-[1px] whitespace-nowrap"
                >
                    <p className="font-medium mb-0.5 capitalize">
                        {recipe.recipe_name}
                    </p>
                    <p className="font-normal text-xs text-muted-foreground">
                        {formatDate(recipe.created_at)}
                    </p>
                </TableCell>
            ),
        },
        shouldShowDog && {
            id: "dog",
            header: "Dog",
            cell: (recipe) => {
                const dog = dogs.find((d) => d.dog_id === recipe.dog_id);
                const avatarUrl = dog?.dog_avatar || false;

                return (
                    <TableCell
                        className="border-r border-border w-[1px]"
                        key={`${recipe.recipe_id}-dog`}
                    >
                        <BadgeStack
                            variant="default"
                            icon={<DogIcon />}
                            label={dogNameResolver(recipe.dog_id)}
                            sublabel="Created for"
                            flipped={true}
                            avatar={true}
                            avatarImage={avatarUrl}
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
                    className="text-xs text-muted-foreground border-r border-border"
                >
                    <span className="line-clamp-2 leading-[1.15rem]">
                        <span className="text-foreground">Ingredients: </span>
                        {formatIngredients(recipe.recipe_ingredients)}
                    </span>
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
                        className="border-r border-border pl-5 w-[1px]"
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
                    className=" w-[1px] whitespace-nowrap"
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleViewRecipe(recipe)}
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleEditRecipe(recipe)}
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-error-foreground focus:text-error-foreground focus:bg-error focus:border-error-border"
                                    >
                                        <Trash2 className="h-4 w-4" />
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
        <div ref={cardRef}>
            <Table ref={tableRef} className="max-w-full">
                <TableBody>
                    {displayedRecipes.length === 0 ? (
                        <TableRow className="hover:bg-card data-[state=selected]:bg-card">
                            <TableCell
                                colSpan={columns.length}
                                className="text-center h-72 my-6 text-muted flex flex-col gap-5 items-center justify-center"
                            >
                                <FileAlert width={80} height={80} />
                                <p className="text-lg text-muted-foreground/60 leading-6">
                                    You haven't created
                                    <br />
                                    any recipes yet
                                </p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        displayedRecipes.map((recipe) => (
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
                onModeChange={(newMode) => {
                    // console.log(
                    //     "RecipeTable mode change requested:",
                    //     newMode,
                    //     "current mode:",
                    //     sheetMode
                    // );
                    setSheetMode(newMode);
                }}
                defaultDogId={dogId}
            />
        </div>
    );
}
