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
import { CheckCheck, Loader2, Pencil, Plus, Trash, X } from "lucide-react";
import { useUser } from "@/components/providers/user-provider";
import { useDogs } from "@/components/providers/dogs-provider";
import { useIngredients } from "@/components/providers/ingredients-provider";
import { useRecipes } from "@/components/providers/recipes-provider";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { isRecipeBalanced } from "@/components/app/recipes/nutrient-group-alert";
import { useParams } from "react-router-dom";
import { useAddDog } from "@/components/providers/add-dog-provider";
import { checkRecipeBalance } from "@/components/app/recipes/nutrient-group-alert";

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
    const { dogId } = useParams();
    const { openAddDog } = useAddDog();

    // State management
    const [selectedDog, setSelectedDog] = useState(
        mode === "create" && dogId ? Number(dogId) : recipe?.dog_id || ""
    );
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

    // Add nutrient states
    const [nutrientState, setNutrientState] = useState(null);
    const [checkingNutrients, setCheckingNutrients] = useState(true);

    // Add this state to track initial load
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Move ingredientSections inside component
    const ingredientSections = {
        meat_and_bone: {
            getItems: () => meatAndBone,
        },
        plant_matter: {
            getItems: () => plantMatter,
        },
        liver: {
            getItems: () => liver,
        },
        secreting_organs: {
            getItems: () => secretingOrgans,
        },
        misc: {
            getItems: () => misc,
        },
    };

    // First, let's update the recipe initialization effect
    useEffect(() => {
        const initializeRecipe = async () => {
            // Always show loading when initializing
            setCheckingNutrients(true);

            try {
                if (recipe && (mode === "view" || mode === "edit")) {
                    setRecipeName(recipe.recipe_name || "");
                    setSelectedDog(recipe.dog_id || "");

                    if (recipe.recipe_ingredients) {
                        setRecipeIngredients(recipe.recipe_ingredients);
                        const categorized = categorizeIngredients(
                            recipe.recipe_ingredients
                        );
                        setMeatAndBone(categorized.meat_and_bone || []);
                        setPlantMatter(categorized.plant_matter || []);
                        setSecretingOrgans(categorized.secreting_organs || []);
                        setLiver(categorized.liver || []);
                        setMisc(categorized.misc || []);
                    }
                    setActiveSection(null);
                } else if (!recipe && mode === "create") {
                    resetForm();
                    if (dogId) {
                        setSelectedDog(Number(dogId));
                    }
                }
            } catch (error) {
                console.error("Error initializing recipe:", error);
            }
            // Don't set checkingNutrients to false here - let the nutrient check effect handle it
        };

        initializeRecipe();
    }, [recipe, mode, dogId]);

    // Reset initial load flag when sheet closes
    useEffect(() => {
        if (!open) {
            setIsInitialLoad(true);
        }
    }, [open]);

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

    // Track form changes
    const hasChanges = () => {
        // Never show discard dialog in view mode
        if (mode === "view") return false;

        // Check if recipe name changed
        if (recipeName !== recipe?.recipe_name) return true;

        // Check if selected dog changed
        if (selectedDog !== recipe?.dog_id) return true;

        // Check if ingredients changed
        if (mode === "edit") {
            const originalIngredients = recipe?.recipe_ingredients || [];
            const currentIngredients = recipeIngredients;

            if (originalIngredients.length !== currentIngredients.length)
                return true;

            // Compare ingredients
            return (
                JSON.stringify(originalIngredients.sort()) !==
                JSON.stringify(currentIngredients.sort())
            );
        }

        // In create mode, check if any ingredients were added
        return recipeIngredients.length > 0 || recipeName !== "";
    };

    // Add this function to properly categorize ingredients
    const categorizeIngredients = (ingredients) => {
        if (!ingredients) return {};

        return ingredients.reduce((acc, ing) => {
            const category = ing.ingredients?.category_id;
            switch (category) {
                case 1:
                    acc.meat_and_bone = [...(acc.meat_and_bone || []), ing];
                    break;
                case 2:
                    acc.plant_matter = [...(acc.plant_matter || []), ing];
                    break;
                case 3:
                    acc.liver = [...(acc.liver || []), ing];
                    break;
                case 4:
                    acc.secreting_organs = [
                        ...(acc.secreting_organs || []),
                        ing,
                    ];
                    break;
                case 5:
                    acc.misc = [...(acc.misc || []), ing];
                    break;
            }
            return acc;
        }, {});
    };

    // Handle dialog close with unsaved changes
    const handleClose = (newOpen, options = {}) => {
        // If we're changing modes, update the mode and keep the sheet open
        if (options?.mode) {
            if (options.mode === "edit" && recipe?.recipe_ingredients) {
                const categorized = categorizeIngredients(
                    recipe.recipe_ingredients
                );
                setMeatAndBone(categorized.meat_and_bone || []);
                setPlantMatter(categorized.plant_matter || []);
                setSecretingOrgans(categorized.secreting_organs || []);
                setLiver(categorized.liver || []);
                setMisc(categorized.misc || []);
                setRecipeIngredients(recipe.recipe_ingredients);
            }
            onModeChange?.(options.mode);
            onOpenChange?.(true, options);
            return;
        }

        // Check for unsaved changes
        if (!newOpen && hasChanges()) {
            setShowUnsavedChanges(true);
            return;
        }

        // If closing without changes
        if (!newOpen) {
            if (mode === "edit") {
                onModeChange?.("view");
                onOpenChange?.(true, { mode: "view", recipe });
            } else {
                resetForm();
                // Let the animation complete before closing
                requestAnimationFrame(() => {
                    onOpenChange?.(false);
                });
            }
        } else {
            onOpenChange?.(newOpen);
        }
    };

    // Handle save button state
    const canSave = useCallback(() => {
        if (mode === "view") return false;
        if (isSaving) return false;
        if (!recipeName || !selectedDog) return false;
        return hasChanges();
    }, [mode, isSaving, recipeName, selectedDog, hasChanges]);

    // Save functionality
    const handleSave = async () => {
        if (!recipeName || !selectedDog) return;

        setIsSaving(true);
        try {
            // Get all ingredients for the recipe
            const allIngredients =
                mode === "edit"
                    ? recipeIngredients
                    : [
                          ...meatAndBone,
                          ...plantMatter,
                          ...secretingOrgans,
                          ...liver,
                          ...misc,
                      ];

            // Check if recipe is nutritionally balanced
            const isBalanced = await isRecipeBalanced(allIngredients, mode);

            const recipeData = {
                recipe_name: recipeName,
                dog_id: selectedDog,
                profile_id: profile.id,
                last_updated: new Date().toISOString(),
                isNutritionallyBalanced: isBalanced,
            };

            if (mode === "edit" && recipe?.recipe_id) {
                const ingredients = recipeIngredients.map((ing) => ({
                    ingredient_id: ing.ingredient_id,
                    quantity: ing.quantity || 0,
                }));

                const updatedRecipe = await updateRecipe(
                    recipe.recipe_id,
                    recipeData,
                    ingredients
                );

                if (updatedRecipe) {
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

                    // Use the updatedRecipe directly instead of looking up in state
                    onModeChange?.("view");
                    onOpenChange?.(true, {
                        mode: "view",
                        recipe: updatedRecipe,
                    });

                    await handleSaveSuccess(updatedRecipe);
                }
                return;
            } else {
                // Create mode
                const ingredients = [
                    ...meatAndBone,
                    ...plantMatter,
                    ...secretingOrgans,
                    ...liver,
                    ...misc,
                ].map((ing) => ({
                    ingredient_id: ing.id,
                    quantity: ing.quantity || 0,
                }));

                try {
                    const newRecipe = await addRecipe(recipeData, ingredients);

                    if (!newRecipe) {
                        throw new Error("Failed to create recipe");
                    }

                    toast.success("Recipe created successfully");

                    // Wait a moment for the database to settle
                    await new Promise((resolve) => setTimeout(resolve, 100));

                    try {
                        // Fetch the complete recipe with ingredients
                        const freshRecipe = await fetchRecipeById(
                            newRecipe.recipe_id
                        );

                        if (!freshRecipe) {
                            throw new Error("Failed to fetch fresh recipe");
                        }

                        // Reset create mode state
                        setRecipeIngredients(
                            freshRecipe.recipe_ingredients || []
                        );
                        setRecipeName(freshRecipe.recipe_name || "");
                        setSelectedDog(freshRecipe.dog_id || "");
                        setActiveSection(null);

                        // Wait for a tick to ensure state is updated
                        await new Promise((resolve) => setTimeout(resolve, 0));

                        // Switch back to view mode with current recipe - using same pattern as edit mode
                        onModeChange?.("view");
                        onOpenChange?.(true, {
                            mode: "view",
                            recipe: freshRecipe,
                        });

                        await handleSaveSuccess(freshRecipe);
                        return;
                    } catch (fetchError) {
                        console.error(
                            "Error fetching fresh recipe:",
                            fetchError
                        );
                        // If we can't fetch the fresh recipe, try using the newRecipe
                        onModeChange?.("view");
                        onOpenChange?.(true, {
                            mode: "view",
                            recipe: newRecipe,
                        });
                        return;
                    }
                } catch (error) {
                    console.error("Error in create mode:", error);
                    toast.error("Failed to create recipe: " + error.message);
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

    // Keep one effect for initial load and mode changes
    useEffect(() => {
        const checkNutrientsForMode = async () => {
            setCheckingNutrients(true);

            try {
                if (mode === "view" || mode === "edit") {
                    const ingredients =
                        mode === "edit"
                            ? recipeIngredients
                            : recipe?.recipe_ingredients;
                    if (ingredients?.length) {
                        const state = await checkRecipeBalance(
                            ingredients,
                            mode
                        );
                        setNutrientState(state);
                    }
                }
            } catch (error) {
                console.error("Error checking nutrients:", error);
                setNutrientState(null);
            } finally {
                setCheckingNutrients(false);
            }
        };

        checkNutrientsForMode();
    }, [mode, recipe]); // Only run on mode or recipe changes

    // Simplify handleIngredientAdd to update alerts directly
    const handleIngredientAdd = async (ingredient, section) => {
        // Map ingredient category_id to the correct section name
        const categoryMap = {
            1: "meat_and_bone",
            2: "plant_matter",
            3: "liver",
            4: "secreting_organs",
            5: "misc",
        };

        // Create the recipe_ingredients structure with proper category_id
        const newIngredient =
            mode === "create"
                ? {
                      id: ingredient.ingredient_id || ingredient.id,
                      ingredient_name:
                          ingredient.ingredient_name || ingredient.name,
                      name: ingredient.ingredient_name || ingredient.name,
                      category_id: ingredient.category_id,
                      category: ingredient.category_id,
                      bone_percent: ingredient.bone_percent,
                      ...ingredient,
                  }
                : {
                      ingredient_id: ingredient.ingredient_id || ingredient.id,
                      ingredients: {
                          ingredient_id:
                              ingredient.ingredient_id || ingredient.id,
                          ingredient_name:
                              ingredient.ingredient_name || ingredient.name,
                          category_id: ingredient.category_id,
                          bone_percent: ingredient.bone_percent,
                          ...(ingredient.ingredients || ingredient),
                      },
                      quantity: 0,
                  };

        // Get the category from the ingredient's category_id
        const sectionCategory =
            section ||
            categoryMap[
                ingredient.category_id || ingredient.ingredients?.category_id
            ];

        if (!sectionCategory) {
            console.error("Invalid category_id:", ingredient.category_id);
            return;
        }

        // First update the local state and wait for all state updates
        await Promise.all([
            new Promise((resolve) => {
                if (mode === "edit") {
                    setRecipeIngredients((prev) => {
                        const next = [...prev, newIngredient];
                        resolve(next);
                        return next;
                    });
                } else {
                    resolve([]);
                }
            }),
            new Promise((resolve) => {
                switch (sectionCategory) {
                    case "meat_and_bone":
                        setMeatAndBone((prev) => {
                            const next = [...prev, newIngredient];
                            resolve(next);
                            return next;
                        });
                        break;
                    case "plant_matter":
                        setPlantMatter((prev) => {
                            const next = [...prev, newIngredient];
                            resolve(next);
                            return next;
                        });
                        break;
                    case "secreting_organs":
                        setSecretingOrgans((prev) => {
                            const next = [...prev, newIngredient];
                            resolve(next);
                            return next;
                        });
                        break;
                    case "liver":
                        setLiver((prev) => {
                            const next = [...prev, newIngredient];
                            resolve(next);
                            return next;
                        });
                        break;
                    case "misc":
                        setMisc((prev) => {
                            const next = [...prev, newIngredient];
                            resolve(next);
                            return next;
                        });
                        break;
                }
            }),
        ]);

        // Get the updated ingredients
        const updatedIngredients = [
            ...meatAndBone,
            ...plantMatter,
            ...secretingOrgans,
            ...liver,
            ...misc,
            newIngredient,
        ];

        // Update recipe ingredients
        setRecipeIngredients(updatedIngredients);

        // Just update the nutrient state directly based on the ingredient added
        setNutrientState((prev) => {
            if (!prev) return prev;

            // Get all categories and nutrients this ingredient belongs to
            const ingredientCategories = [];
            const ingredientId = ingredient.ingredient_id || ingredient.id;

            // Check categories
            if (sectionCategory === "meat_and_bone") {
                ingredientCategories.push("muscle meat");
                if (
                    ingredient.bone_percent > 0 ||
                    ingredient.ingredients?.bone_percent > 0
                ) {
                    ingredientCategories.push("bone");
                }
            }
            if (sectionCategory === "plant_matter")
                ingredientCategories.push("plant matter");
            if (sectionCategory === "liver") ingredientCategories.push("liver");
            if (sectionCategory === "secreting_organs")
                ingredientCategories.push("secreting organs");

            // Remove all categories this ingredient satisfies
            const missingCategories = prev.missingCategories.filter((cat) => {
                return !ingredientCategories.some((ic) =>
                    cat.toLowerCase().includes(ic.toLowerCase())
                );
            });

            // Track this ingredient as added globally
            const addedIngredients = {
                ...(prev.addedIngredients || {}),
                [ingredientId]: true,
            };

            // Update all nutrient suggestions
            const updatedSuggestions = { ...prev.nutrientSuggestions };
            Object.keys(updatedSuggestions).forEach((nutrientId) => {
                updatedSuggestions[nutrientId] = updatedSuggestions[
                    nutrientId
                ].map((suggestion) => {
                    const suggestionId =
                        suggestion.ingredient_id || suggestion.id;
                    return suggestionId === ingredientId
                        ? { ...suggestion, isAdded: true }
                        : suggestion;
                });
            });

            return {
                ...prev,
                missingCategories,
                nutrientSuggestions: updatedSuggestions,
                addedIngredients,
                fromIngredientSelector: true,
                isBalanced: missingCategories.length === 0,
            };
        });
    };

    const handleRemoveIngredient = async (ingredientId, section) => {
        // First get the current ingredients
        const currentIngredients = Object.values(ingredientSections).flatMap(
            (section) => section.getItems()
        );

        // Remove the ingredient from state
        if (mode === "edit") {
            setRecipeIngredients((prev) =>
                prev.filter((i) => i.ingredient_id !== ingredientId)
            );
        }

        // Remove from appropriate section
        switch (section) {
            case "meat_and_bone":
                setMeatAndBone((prev) =>
                    prev.filter((i) =>
                        mode === "create"
                            ? i.id !== ingredientId
                            : i.ingredient_id !== ingredientId
                    )
                );
                break;
            case "plant_matter":
                setPlantMatter((prev) =>
                    prev.filter((i) =>
                        mode === "create"
                            ? i.id !== ingredientId
                            : i.ingredient_id !== ingredientId
                    )
                );
                break;
            case "secreting_organs":
                setSecretingOrgans((prev) =>
                    prev.filter((i) =>
                        mode === "create"
                            ? i.id !== ingredientId
                            : i.ingredient_id !== ingredientId
                    )
                );
                break;
            case "liver":
                setLiver((prev) =>
                    prev.filter((i) =>
                        mode === "create"
                            ? i.id !== ingredientId
                            : i.ingredient_id !== ingredientId
                    )
                );
                break;
            case "misc":
                setMisc((prev) =>
                    prev.filter((i) =>
                        mode === "create"
                            ? i.id !== ingredientId
                            : i.ingredient_id !== ingredientId
                    )
                );
                break;
        }

        // Get updated ingredients excluding the removed one
        const updatedIngredients = currentIngredients.filter((i) =>
            mode === "create"
                ? i.id !== ingredientId
                : i.ingredient_id !== ingredientId
        );

        // Get the new state from checkRecipeBalance first
        const state = await checkRecipeBalance(updatedIngredients, mode);

        // Then update nutrient state
        setNutrientState((prev) => {
            if (!prev) return prev;

            // Remove the ingredient from addedIngredients
            const { [ingredientId]: removed, ...remainingAdded } =
                prev.addedIngredients || {};

            // Update nutrient suggestions to un-mark the removed ingredient
            const updatedSuggestions = { ...prev.nutrientSuggestions };
            Object.keys(updatedSuggestions).forEach((nutrientId) => {
                updatedSuggestions[nutrientId] = updatedSuggestions[
                    nutrientId
                ].map((suggestion) => {
                    const suggestionId =
                        suggestion.ingredient_id || suggestion.id;
                    return suggestionId === ingredientId
                        ? { ...suggestion, isAdded: false }
                        : suggestion;
                });
            });

            return {
                ...prev,
                ...state,
                addedIngredients: remainingAdded,
                nutrientSuggestions: updatedSuggestions,
                fromIngredientSelector: true,
            };
        });
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

    // Use it in your component where you need to handle the success case
    const handleAddDog = () => {
        openAddDog((newDog) => {
            setSelectedDog(newDog.dog_id);
        });
    };

    // Render content based on mode
    const renderContent = () => {
        switch (mode) {
            case "create":
                return (
                    <RecipeSheetCreate
                        recipeName={recipeName}
                        setRecipeName={setRecipeName}
                        dogs={dogs}
                        setSelectedDog={setSelectedDog}
                        setShowAddDog={handleAddDog}
                        ingredientSections={ingredientSections}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        handleAddIngredient={handleIngredientAdd}
                        handleRemoveIngredient={handleRemoveIngredient}
                        getIngredientsByCategory={(category) =>
                            getIngredientsByCategory(ingredients, category)
                        }
                        ingredientsLoading={ingredientsLoading}
                        nutrientState={nutrientState}
                        checkingNutrients={checkingNutrients}
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
                        setShowAddDog={handleAddDog}
                        ingredientSections={ingredientSections}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        handleAddIngredient={handleIngredientAdd}
                        handleRemoveIngredient={handleRemoveIngredient}
                        getIngredientsByCategory={(category) =>
                            getIngredientsByCategory(ingredients, category)
                        }
                        ingredientsLoading={ingredientsLoading}
                        nutrientState={nutrientState}
                        checkingNutrients={checkingNutrients}
                    />
                );
            case "view":
                return (
                    recipe && (
                        <RecipeSheetView
                            recipe={recipe}
                            dogs={dogs}
                            getDogName={getDogName}
                            nutrientState={nutrientState}
                            checkingNutrients={checkingNutrients}
                        />
                    )
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Sheet
                open={open}
                onOpenChange={handleClose}
            >
                <SheetContent
                    className="md:p-2 ring-0! outline-none"
                    side="right"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => {
                        e.preventDefault();
                        handleClose(false);
                    }}
                >
                    <div className="md:rounded-lg bg-card flex flex-col h-full p-0">
                        <div className="">
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
                                <SheetClose asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full [&_svg]:size-5 w-11 h-11"
                                    >
                                        <X className="" />
                                    </Button>
                                </SheetClose>
                            </SheetHeader>
                        </div>
                        <ScrollArea className="flex-1">
                            {renderContent()}
                        </ScrollArea>
                        <div className="">
                            <SheetFooter
                                className={`px-6 flex flex-row ${
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
                                                    Delete '
                                                    {recipe?.recipe_name}'
                                                    recipe?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete
                                                    the recipe titled '
                                                    {recipe?.recipe_name}'. This
                                                    action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDelete}
                                                    variant="destructive"
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
                                            {mode === "view"
                                                ? "Close"
                                                : "Cancel"}
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
                    </div>
                </SheetContent>
            </Sheet>

            {showUnsavedChanges && (
                <UnsavedChangesDialog
                    open={showUnsavedChanges}
                    onOpenChange={setShowUnsavedChanges}
                    onConfirm={() => {
                        setShowUnsavedChanges(false);
                        handleClose(false);
                    }}
                    onClose={() => {
                        if (mode === "edit") {
                            onModeChange?.("view");
                            onOpenChange?.(true, { mode: "view", recipe });
                        } else {
                            resetForm();
                            onOpenChange?.(false);
                        }
                        setShowUnsavedChanges(false);
                    }}
                />
            )}
        </>
    );
}
