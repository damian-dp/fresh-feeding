import { useState, useCallback, useEffect } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCheck, Loader2, Pencil, Plus, Trash } from "lucide-react";
import { useUser } from "@/components/providers/user-provider";
import { useDogs } from "@/components/providers/dogs-provider";
import { useIngredients } from "@/components/providers/ingredients-provider";
import { useRecipes } from "@/components/providers/recipes-provider";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddDogDialog } from "@/components/app/dashboard/add-dog-dialog";
import { RecipeSheetView } from "./recipe-sheet-view";
import { RecipeSheetCreate } from "./recipe-sheet-create";
import { RecipeSheetEdit } from "./recipe-sheet-edit";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";
import {
    INGREDIENT_SECTIONS,
    getIngredientsByCategory,
} from "./ingredient-section";
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
import { supabase } from "@/lib/supabase";

// Update the helper function to calculate percentages instead of grams
const calculateIngredientQuantities = (ingredients, dog) => {
    if (!dog || !ingredients || ingredients.length === 0) return [];

    // Group ingredients by category
    const ingredientsByCategory = {};
    ingredients.forEach((ing) => {
        const categoryId = ing.id ? ing.category : ing.ingredients.category_id;
        if (!ingredientsByCategory[categoryId]) {
            ingredientsByCategory[categoryId] = [];
        }
        ingredientsByCategory[categoryId].push(ing);
    });

    // Calculate quantities (as percentages) for each ingredient
    return ingredients.map((ing) => {
        const categoryId = ing.id ? ing.category : ing.ingredients.category_id;
        const categoryIngredients = ingredientsByCategory[categoryId].length;

        // For each category, distribute the percentage evenly
        let quantity = 0;

        switch (categoryId) {
            case 1: // Meat and Bone
                // Distribute meat and bone ratio evenly among ingredients
                quantity =
                    (dog.ratios_muscle_meat + dog.ratios_bone) /
                    categoryIngredients;
                break;
            case 2: // Plant Matter
                quantity = dog.ratios_plant_matter / categoryIngredients;
                break;
            case 3: // Liver
                quantity = dog.ratios_liver / categoryIngredients;
                break;
            case 4: // Secreting Organs
                quantity = dog.ratios_secreting_organ / categoryIngredients;
                break;
            case 5: // Misc - set to small default value
                quantity = 0;
                break;
        }

        return {
            ingredient_id: ing.id || ing.ingredient_id,
            quantity: quantity, // This will be a decimal between 0 and 1
        };
    });
};

export function RecipeSheet({
    mode = "create",
    recipe = null,
    open,
    onOpenChange,
    onModeChange,
}) {
    const { profile } = useUser();
    const { dogs } = useDogs();
    const { ingredients, loading: ingredientsLoading } = useIngredients();
    const { addRecipe, updateRecipe, deleteRecipe, recipes, fetchRecipeById } =
        useRecipes();

    // State management
    const [showAddDog, setShowAddDog] = useState(false);
    const [selectedDog, setSelectedDog] = useState(recipe?.dog_id || "");
    const [recipeName, setRecipeName] = useState(recipe?.recipe_name || "");
    const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [recipeIngredients, setRecipeIngredients] = useState(
        recipe?.recipe_ingredients || []
    );

    // Ingredient sections state
    const [meatAndBone, setMeatAndBone] = useState(recipe?.meat_and_bone || []);
    const [plantMatter, setPlantMatter] = useState(recipe?.plant_matter || []);
    const [secretingOrgans, setSecretingOrgans] = useState(
        recipe?.secreting_organs || []
    );
    const [liver, setLiver] = useState(recipe?.liver || []);
    const [misc, setMisc] = useState(recipe?.misc || []);

    // Update state when recipe changes
    useEffect(() => {
        if (recipe && (mode === "view" || mode === "edit")) {
            console.log("Recipe changed in RecipeSheet:", recipe);
            setRecipeName(recipe.recipe_name || "");
            setSelectedDog(recipe.dog_id || "");
            setRecipeIngredients(recipe.recipe_ingredients || []);

            // Update ingredient sections
            const meatAndBoneIngredients =
                recipe.recipe_ingredients?.filter(
                    (ing) => ing.ingredients?.category_id === 1
                ) || [];
            const plantMatterIngredients =
                recipe.recipe_ingredients?.filter(
                    (ing) => ing.ingredients?.category_id === 2
                ) || [];
            const secretingOrgansIngredients =
                recipe.recipe_ingredients?.filter(
                    (ing) => ing.ingredients?.category_id === 4
                ) || [];
            const liverIngredients =
                recipe.recipe_ingredients?.filter(
                    (ing) => ing.ingredients?.category_id === 3
                ) || [];
            const miscIngredients =
                recipe.recipe_ingredients?.filter(
                    (ing) => ing.ingredients?.category_id === 5
                ) || [];

            setMeatAndBone(meatAndBoneIngredients);
            setPlantMatter(plantMatterIngredients);
            setSecretingOrgans(secretingOrgansIngredients);
            setLiver(liverIngredients);
            setMisc(miscIngredients);
        } else if (!recipe && mode === "create") {
            // Reset all state when entering create mode with no recipe
            setRecipeName("");
            setSelectedDog("");
            setRecipeIngredients([]);
            setMeatAndBone([]);
            setPlantMatter([]);
            setSecretingOrgans([]);
            setLiver([]);
            setMisc([]);
            setActiveSection(null);
        }
    }, [recipe, mode]);

    // Helper functions
    const getDogName = useCallback(
        (dogId) => {
            if (!dogId) return "Unknown Dog";
            const dog = dogs.find((d) => d.dog_id === dogId);
            return dog ? dog.dog_name : "Unknown Dog";
        },
        [dogs]
    );

    // Form management
    const resetForm = () => {
        setRecipeName("");
        setSelectedDog("");
        setMeatAndBone([]);
        setPlantMatter([]);
        setSecretingOrgans([]);
        setLiver([]);
        setMisc([]);
        setActiveSection(null);
    };

    const hasFormChanges = () => {
        if (mode === "create") {
            return (
                recipeName !== "" ||
                selectedDog !== "" ||
                meatAndBone.length > 0 ||
                plantMatter.length > 0 ||
                secretingOrgans.length > 0 ||
                liver.length > 0 ||
                misc.length > 0
            );
        }

        if (mode === "edit") {
            return (
                recipeName !== recipe?.recipe_name ||
                selectedDog !== recipe?.dog_id ||
                JSON.stringify(meatAndBone) !==
                    JSON.stringify(recipe?.meat_and_bone) ||
                JSON.stringify(plantMatter) !==
                    JSON.stringify(recipe?.plant_matter) ||
                JSON.stringify(secretingOrgans) !==
                    JSON.stringify(recipe?.secreting_organs) ||
                JSON.stringify(liver) !== JSON.stringify(recipe?.liver) ||
                JSON.stringify(misc) !== JSON.stringify(recipe?.misc)
            );
        }

        return false;
    };

    const handleClose = (newOpen, options = {}) => {
        console.log("RecipeSheet handleClose:", { newOpen, options, mode });

        // If we're changing modes, update the mode and keep the sheet open
        if (options?.mode) {
            console.log("Changing mode to:", options.mode);
            onModeChange?.(options.mode);
            onOpenChange?.(true, options);
            return;
        }

        // In edit mode, switch back to view mode instead of closing
        if (mode === "edit") {
            // Reset edit mode state
            setRecipeIngredients(recipe?.recipe_ingredients || []);
            setRecipeName(recipe?.recipe_name || "");
            setSelectedDog(recipe?.dog_id || "");
            setActiveSection(null);

            // Switch back to view mode with current recipe
            onModeChange?.("view");
            onOpenChange?.(true, { mode: "view", recipe });
            return;
        }

        // If closing the sheet completely
        if (!newOpen) {
            // Check for unsaved changes
            if (hasFormChanges()) {
                setShowUnsavedChanges(true);
                return;
            }

            // Reset all state when closing
            setRecipeName("");
            setSelectedDog("");
            setRecipeIngredients([]);
            setMeatAndBone([]);
            setPlantMatter([]);
            setSecretingOrgans([]);
            setLiver([]);
            setMisc([]);
            setActiveSection(null);

            if (mode === "create") {
                resetForm();
            }
        }

        onOpenChange?.(newOpen);
    };

    // Save functionality
    const handleSave = async () => {
        if (!recipeName || !selectedDog) return;

        setIsSaving(true);
        try {
            const recipeData = {
                recipe_name: recipeName,
                dog_id: selectedDog,
                profile_id: profile.id,
                last_updated: new Date().toISOString(),
            };

            if (mode === "edit" && recipe?.recipe_id) {
                console.log("Edit mode - preparing ingredients...");
                const ingredients = recipeIngredients.map((ing) => ({
                    ingredient_id: ing.ingredient_id,
                    quantity: ing.quantity || 0,
                }));

                console.log("Calling updateRecipe...");
                const updatedRecipe = await updateRecipe(
                    recipe.recipe_id,
                    recipeData,
                    ingredients
                );

                if (updatedRecipe) {
                    console.log(
                        "Update successful, transitioning to view mode..."
                    );
                    toast.success("Recipe updated successfully");

                    // Reset edit mode state
                    setRecipeIngredients([]);
                    setRecipeName("");
                    setSelectedDog("");
                    setActiveSection(null);

                    // Wait for a tick to ensure state is updated
                    await new Promise((resolve) => setTimeout(resolve, 0));

                    // Get the latest recipe from the recipes array
                    const latestRecipe = recipes.find(
                        (r) => r.recipe_id === recipe.recipe_id
                    );

                    console.log("Latest recipe from state:", latestRecipe);
                    console.log("Updated recipe from API:", updatedRecipe);

                    // Use the updatedRecipe directly instead of looking up in state
                    onModeChange?.("view");
                    onOpenChange?.(true, {
                        mode: "view",
                        recipe: updatedRecipe,
                    });

                    console.log(
                        "Transitioned to view mode with recipe:",
                        updatedRecipe
                    );

                    await handleSaveSuccess(updatedRecipe);
                }
                return;
            } else {
                // Create mode
                console.log("Create mode - preparing ingredients...");
                const allIngredients = [
                    ...meatAndBone,
                    ...plantMatter,
                    ...secretingOrgans,
                    ...liver,
                    ...misc,
                ];

                // Get the selected dog's data
                const selectedDogData = dogs.find(
                    (d) => d.dog_id === selectedDog
                );

                // Calculate quantities as percentages
                const ingredientsWithQuantities = calculateIngredientQuantities(
                    allIngredients,
                    selectedDogData
                );

                console.log(
                    "Calculated ingredient quantities (percentages):",
                    ingredientsWithQuantities
                );

                // Call addRecipe with the calculated quantities
                const newRecipe = await addRecipe(
                    recipeData,
                    ingredientsWithQuantities
                );

                if (!newRecipe) {
                    throw new Error("Failed to create recipe");
                }

                console.log(
                    "Create successful, preparing to transition to view mode..."
                );
                toast.success("Recipe created successfully");

                // Wait a moment for the database to settle
                await new Promise((resolve) => setTimeout(resolve, 100));

                try {
                    // Fetch the complete recipe with ingredients
                    const freshRecipe = await fetchRecipeById(
                        newRecipe.recipe_id
                    );
                    console.log("Got fresh recipe:", freshRecipe);

                    if (!freshRecipe) {
                        throw new Error("Failed to fetch fresh recipe");
                    }

                    // Reset create mode state
                    setRecipeIngredients(freshRecipe.recipe_ingredients || []);
                    setRecipeName(freshRecipe.recipe_name || "");
                    setSelectedDog(freshRecipe.dog_id || "");
                    setActiveSection(null);

                    // Wait for a tick to ensure state is updated
                    await new Promise((resolve) => setTimeout(resolve, 0));

                    console.log("Attempting mode transition to view...");

                    // Switch back to view mode with current recipe - using same pattern as edit mode
                    onModeChange?.("view");
                    onOpenChange?.(true, {
                        mode: "view",
                        recipe: freshRecipe,
                    });

                    // Add handleSaveSuccess call like in edit mode
                    await handleSaveSuccess(freshRecipe);
                    return;
                } catch (fetchError) {
                    console.error("Error fetching fresh recipe:", fetchError);
                    // If we can't fetch the fresh recipe, try using the newRecipe
                    onModeChange?.("view");
                    onOpenChange?.(true, {
                        mode: "view",
                        recipe: newRecipe,
                    });
                    return;
                }
            }
        } catch (error) {
            console.error("Error in handleSave:", error);
            toast.error(
                "Failed to save recipe: " + (error.message || "Unknown error")
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Add these functions back
    const handleAddIngredient = (ingredient, category) => {
        console.log("RecipeSheet handling ingredient:", ingredient);
        console.log("Category:", category);

        if (mode === "edit") {
            setRecipeIngredients((prev) => {
                // Get all ingredients in this category
                const categoryId = ingredient.ingredients.category_id;
                const categoryIngredients = prev.filter(
                    (ing) => ing.ingredients?.category_id === categoryId
                );

                // Calculate total used percentage
                const usedPercentage = categoryIngredients.reduce(
                    (sum, ing) => sum + (ing.quantity || 0),
                    0
                );

                // New ingredient gets remaining percentage
                const remainingPercentage = Math.max(0, 1 - usedPercentage);

                // Add new ingredient with remaining percentage
                return [
                    ...prev,
                    { ...ingredient, quantity: remainingPercentage },
                ];
            });
            setActiveSection(null);
            return;
        }

        // Create mode handling
        const getExistingIngredients = (category) => {
            switch (category) {
                case "meat_and_bone":
                    return meatAndBone;
                case "plant_matter":
                    return plantMatter;
                case "secreting_organs":
                    return secretingOrgans;
                case "liver":
                    return liver;
                case "misc":
                    return misc;
                default:
                    return [];
            }
        };

        const setIngredients = (category, ingredients) => {
            switch (category) {
                case "meat_and_bone":
                    setMeatAndBone(ingredients);
                    break;
                case "plant_matter":
                    setPlantMatter(ingredients);
                    break;
                case "secreting_organs":
                    setSecretingOrgans(ingredients);
                    break;
                case "liver":
                    setLiver(ingredients);
                    break;
                case "misc":
                    setMisc(ingredients);
                    break;
            }
        };

        // Get current ingredients for this category
        const existingIngredients = getExistingIngredients(category);

        // Calculate total used percentage
        const usedPercentage = existingIngredients.reduce(
            (sum, ing) => sum + (ing.quantity || 0),
            0
        );

        // New ingredient gets remaining percentage
        const remainingPercentage = Math.max(0, 1 - usedPercentage);

        // Add new ingredient with remaining percentage
        const newIngredient = {
            ...ingredient,
            quantity: remainingPercentage,
        };

        // Update the category's ingredients
        setIngredients(category, [...existingIngredients, newIngredient]);
    };

    const handleRemoveIngredient = (ingredientId, section) => {
        console.log("handleRemoveIngredient called with:", {
            ingredientId,
            section,
            mode,
        });

        if (mode === "edit") {
            setRecipeIngredients((prev) =>
                prev.filter((ing) => ing.ingredient_id !== ingredientId)
            );
            return;
        }

        // Create mode handling
        console.log("Current state before removal:", {
            meatAndBone,
            plantMatter,
            secretingOrgans,
            liver,
            misc,
        });

        switch (section) {
            case "meat_and_bone":
                setMeatAndBone(
                    meatAndBone.filter((i) => {
                        console.log("Comparing:", i.id, "with:", ingredientId);
                        return i.id !== ingredientId;
                    })
                );
                break;
            case "plant_matter":
                setPlantMatter(
                    plantMatter.filter((i) => i.id !== ingredientId)
                );
                break;
            case "secreting_organs":
                setSecretingOrgans(
                    secretingOrgans.filter((i) => i.id !== ingredientId)
                );
                break;
            case "liver":
                setLiver(liver.filter((i) => i.id !== ingredientId));
                break;
            case "misc":
                setMisc(misc.filter((i) => i.id !== ingredientId));
                break;
        }
    };

    // Delete functionality
    const handleDelete = async () => {
        const success = await deleteRecipe(recipe.recipe_id);
        if (success) {
            toast.success("Recipe deleted successfully");
            onOpenChange(false);
        } else {
            toast.error("Failed to delete recipe");
        }
    };

    // When transitioning to view mode, force a refresh
    const handleSaveSuccess = async (updatedRecipe) => {
        try {
            const freshRecipe = await fetchRecipeById(updatedRecipe.recipe_id);
            onModeChange?.("view");
            onOpenChange?.(true, { mode: "view", recipe: freshRecipe });
        } catch (error) {
            console.error("Error refreshing recipe:", error);
        }
    };

    // Add this function inside the RecipeSheet component
    const fetchRecipeFromServer = async (recipeId) => {
        const { data, error } = await supabase
            .from("recipes")
            .select(
                `
                *,
                recipe_ingredients (
                    *,
                    ingredients (*)
                )
            `
            )
            .eq("recipe_id", recipeId)
            .single();

        if (error) throw error;
        return data;
    };

    // Render content based on mode
    const renderContent = () => {
        const sections = Object.entries(INGREDIENT_SECTIONS).reduce(
            (acc, [key, section]) => {
                acc[key] = {
                    ...section,
                    getItems: () => {
                        switch (key) {
                            case "meat_and_bone":
                                return meatAndBone;
                            case "plant_matter":
                                return plantMatter;
                            case "liver":
                                return liver;
                            case "secreting_organs":
                                return secretingOrgans;
                            case "misc":
                                return misc;
                            default:
                                return [];
                        }
                    },
                };
                return acc;
            },
            {}
        );

        switch (mode) {
            case "create":
                return (
                    <RecipeSheetCreate
                        recipeName={recipeName}
                        setRecipeName={setRecipeName}
                        dogs={dogs}
                        setSelectedDog={setSelectedDog}
                        setShowAddDog={setShowAddDog}
                        ingredientSections={sections}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        handleAddIngredient={handleAddIngredient}
                        handleRemoveIngredient={handleRemoveIngredient}
                        getIngredientsByCategory={(category) =>
                            getIngredientsByCategory(ingredients, category)
                        }
                        ingredientsLoading={ingredientsLoading}
                    />
                );
            case "edit":
                return (
                    <RecipeSheetEdit
                        recipe={{
                            ...recipe,
                            recipe_ingredients: recipeIngredients,
                        }}
                        recipeName={recipeName}
                        setRecipeName={setRecipeName}
                        dogs={dogs}
                        setSelectedDog={setSelectedDog}
                        setShowAddDog={setShowAddDog}
                        ingredientSections={sections}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        handleAddIngredient={handleAddIngredient}
                        handleRemoveIngredient={handleRemoveIngredient}
                        getIngredientsByCategory={(category) =>
                            getIngredientsByCategory(ingredients, category)
                        }
                        ingredientsLoading={ingredientsLoading}
                        setRecipeIngredients={setRecipeIngredients}
                        recipeIngredients={recipeIngredients}
                    />
                );
            case "view":
                return (
                    recipe && (
                        <RecipeSheetView
                            recipe={recipe}
                            dogs={dogs}
                            getDogName={getDogName}
                        />
                    )
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent className="p-2">
                    <div className="rounded-lg bg-card h-full overflow-y-hidden max-h-dvh">
                        <SheetHeader>
                            <SheetTitle>
                                {mode === "create"
                                    ? "Create recipe"
                                    : mode === "edit"
                                    ? "Edit recipe"
                                    : recipe?.recipe_name}
                            </SheetTitle>
                            <SheetDescription className="hidden">
                                {mode === "create"
                                    ? "Create a new recipe for your dog"
                                    : mode === "edit"
                                    ? "Make changes to your recipe"
                                    : "View recipe details"}
                            </SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-168px)]">
                            {renderContent()}
                        </ScrollArea>
                        <SheetFooter
                            className={`px-6 flex-row ${
                                mode === "edit" ? "justify-between" : ""
                            }`}
                        >
                            {mode === "edit" && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash className="" />
                                            Delete recipe
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Are you absolutely sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone.
                                                This will permanently delete
                                                this recipe.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            <div className="flex flex-row gap-2">
                                <SheetClose>
                                    <div className="hover:bg-accent h-10 px-4 py-2 hover:text-accent-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                                        {mode === "view" ? "Close" : "Cancel"}
                                    </div>
                                </SheetClose>
                                {mode !== "view" && (
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        onClick={handleSave}
                                        disabled={
                                            !recipeName ||
                                            !selectedDog ||
                                            isSaving
                                        }
                                    >
                                        {isSaving && (
                                            <Loader2 className="animate-spin" />
                                        )}
                                        {mode === "create" && !isSaving && (
                                            <Plus className="" />
                                        )}
                                        {mode === "edit" && !isSaving && (
                                            <CheckCheck className="" />
                                        )}

                                        {mode === "create"
                                            ? "Create recipe"
                                            : "Save changes"}
                                    </Button>
                                )}
                                {mode === "view" && (
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClose(true, {
                                                mode: "edit",
                                                recipe: recipe,
                                            });
                                        }}
                                    >
                                        <Pencil className="" />
                                        Edit recipe
                                    </Button>
                                )}
                            </div>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>

            <UnsavedChangesDialog
                open={showUnsavedChanges && !isSaving}
                onOpenChange={setShowUnsavedChanges}
                onClose={() => {
                    if (mode === "create") {
                        resetForm();
                    }
                    handleClose(false);
                }}
            />

            <AddDogDialog
                open={showAddDog}
                onOpenChange={setShowAddDog}
                onSuccess={(newDog) => {
                    setSelectedDog(newDog.dog_id);
                    setShowAddDog(false);
                }}
            />
        </>
    );
}
