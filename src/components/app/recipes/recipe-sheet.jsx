import { useState, useCallback, useEffect, useRef } from "react";
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
    mode = "view",
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
        dogId ? Number(dogId) : recipe?.dog_id || ""
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

    // Add this state to track updating
    const [isUpdating, setIsUpdating] = useState(false);

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
            setCheckingNutrients(true);

            try {
                if (mode === "view" && recipe) {
                    // View mode initialization
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

                    // Check nutrients for view mode
                    const state = await checkRecipeBalance(
                        recipe.recipe_ingredients || []
                    );
                    setNutrientState(state);
                } else if (mode === "edit") {
                    if (recipe) {
                        // Editing existing recipe
                        setRecipeName(recipe.recipe_name || "");
                        setSelectedDog(recipe.dog_id || "");
                        if (recipe.recipe_ingredients) {
                            setRecipeIngredients(recipe.recipe_ingredients);
                            const categorized = categorizeIngredients(
                                recipe.recipe_ingredients
                            );
                            setMeatAndBone(categorized.meat_and_bone || []);
                            setPlantMatter(categorized.plant_matter || []);
                            setSecretingOrgans(
                                categorized.secreting_organs || []
                            );
                            setLiver(categorized.liver || []);
                            setMisc(categorized.misc || []);
                        }
                        // Check nutrients for existing recipe
                        const state = await checkRecipeBalance(
                            recipe.recipe_ingredients || []
                        );
                        setNutrientState(state);
                    } else {
                        // Creating new recipe
                        resetForm();
                        if (dogId) {
                            setSelectedDog(Number(dogId));
                        }
                        // Initialize nutrient state for new recipe with empty ingredients
                        const state = await checkRecipeBalance([]);
                        setNutrientState(state);
                    }
                }
            } catch (error) {
                console.error("Error initializing recipe:", error);
                // Set a default nutrient state in case of error
                const defaultState = await checkRecipeBalance([]);
                setNutrientState(defaultState);
            } finally {
                setCheckingNutrients(false);
            }
        };

        // Always run initialization when mode or recipe changes
        initializeRecipe();
    }, [mode, recipe, dogId]);

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
        setRecipeIngredients([]);
    };

    // Track form changes
    const hasChanges = () => {
        if (mode === "view") return false;

        // For new recipes
        if (!recipe) {
            return (
                recipeName !== "" ||
                selectedDog !== "" ||
                recipeIngredients.length > 0
            );
        }

        // For existing recipes
        if (recipeName !== recipe?.recipe_name) return true;
        if (selectedDog !== recipe?.dog_id) return true;

        const originalIngredients = recipe?.recipe_ingredients || [];
        const currentIngredients = recipeIngredients;

        if (originalIngredients.length !== currentIngredients.length)
            return true;

        return (
            JSON.stringify(originalIngredients.sort()) !==
            JSON.stringify(currentIngredients.sort())
        );
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
        return recipeName && selectedDog && hasChanges();
    }, [mode, isSaving, recipeName, selectedDog, hasChanges]);

    // Save functionality
    const handleSave = async () => {
        if (!recipeName || !selectedDog) return;

        setIsSaving(true);
        try {
            const allIngredients = [
                ...meatAndBone,
                ...plantMatter,
                ...secretingOrgans,
                ...liver,
                ...misc,
            ];

            const isBalanced = await isRecipeBalanced(allIngredients);

            const recipeData = {
                recipe_name: recipeName,
                dog_id: selectedDog,
                profile_id: profile.id,
                last_updated: new Date().toISOString(),
                isNutritionallyBalanced: isBalanced,
            };

            let savedRecipe;
            if (recipe?.recipe_id) {
                // Update existing recipe
                const ingredients = recipeIngredients.map((ing) => ({
                    ingredient_id: ing.ingredient_id,
                    quantity: ing.quantity || 0,
                }));

                savedRecipe = await updateRecipe(
                    recipe.recipe_id,
                    recipeData,
                    ingredients
                );
                toast.success("Recipe updated successfully");
            } else {
                // Create new recipe
                const ingredients = allIngredients.map((ing) => ({
                    ingredient_id: ing.id || ing.ingredient_id,
                    quantity: ing.quantity || 0,
                }));

                savedRecipe = await addRecipe(recipeData, ingredients);
                toast.success("Recipe created successfully");
            }

            if (savedRecipe) {
                // Reset state
                setRecipeIngredients([]);
                setRecipeName("");
                setSelectedDog("");
                setActiveSection(null);

                // Wait for state updates
                await new Promise((resolve) => setTimeout(resolve, 100));

                // Fetch fresh recipe data
                const freshRecipe = await fetchRecipeById(
                    savedRecipe.recipe_id
                );

                // Switch to view mode with updated recipe
                onModeChange?.("view");
                onOpenChange?.(true, {
                    mode: "view",
                    recipe: freshRecipe || savedRecipe,
                });

                await handleSaveSuccess(freshRecipe || savedRecipe);
            }
        } catch (error) {
            console.error("Error saving recipe:", error);
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
                    } else {
                        setNutrientState(null);
                    }
                } else if (mode === "create") {
                    // For create mode, initialize with empty state
                    const state = await checkRecipeBalance([], "create");
                    setNutrientState(state);
                }
            } catch (error) {
                console.error("Error checking nutrients:", error);
                setNutrientState(null);
            }

            setCheckingNutrients(false);
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

        // Normalize ingredient structure to match existing recipe format
        const normalizedIngredient = {
            ingredient_id: ingredient.ingredient_id || ingredient.id,
            ingredients: {
                ingredient_id: ingredient.ingredient_id || ingredient.id,
                ingredient_name: ingredient.ingredient_name || ingredient.name,
                category_id: ingredient.category_id || ingredient.category,
                bone_percent: ingredient.bone_percent,
                ...ingredient,
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
                setRecipeIngredients((prev) => {
                    const next = [...prev, normalizedIngredient];
                    resolve(next);
                    return next;
                });
            }),
            new Promise((resolve) => {
                switch (sectionCategory) {
                    case "meat_and_bone":
                        setMeatAndBone((prev) => {
                            const next = [...prev, normalizedIngredient];
                            resolve(next);
                            return next;
                        });
                        break;
                    case "plant_matter":
                        setPlantMatter((prev) => {
                            const next = [...prev, normalizedIngredient];
                            resolve(next);
                            return next;
                        });
                        break;
                    case "secreting_organs":
                        setSecretingOrgans((prev) => {
                            const next = [...prev, normalizedIngredient];
                            resolve(next);
                            return next;
                        });
                        break;
                    case "liver":
                        setLiver((prev) => {
                            const next = [...prev, normalizedIngredient];
                            resolve(next);
                            return next;
                        });
                        break;
                    case "misc":
                        setMisc((prev) => {
                            const next = [...prev, normalizedIngredient];
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
            normalizedIngredient,
        ];

        // Update recipe ingredients
        setRecipeIngredients(updatedIngredients);

        // Just update the nutrient state directly based on the ingredient added
        setNutrientState((prev) => {
            if (!prev) return prev;

            // Get all categories and nutrients this ingredient belongs to
            const ingredientCategories = [];
            const ingredientId = normalizedIngredient.ingredient_id;

            // Check categories
            if (sectionCategory === "meat_and_bone") {
                ingredientCategories.push("muscle meat");
                if (normalizedIngredient.ingredients?.bone_percent > 0) {
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
        setIsUpdating(true);

        // First get the current ingredients
        const currentIngredients = Object.values(ingredientSections).flatMap(
            (section) => section.getItems()
        );

        // Remove from appropriate section
        switch (section) {
            case "meat_and_bone":
                setMeatAndBone((prev) =>
                    prev.filter((i) => i.ingredient_id !== ingredientId)
                );
                break;
            case "plant_matter":
                setPlantMatter((prev) =>
                    prev.filter((i) => i.ingredient_id !== ingredientId)
                );
                break;
            case "secreting_organs":
                setSecretingOrgans((prev) =>
                    prev.filter((i) => i.ingredient_id !== ingredientId)
                );
                break;
            case "liver":
                setLiver((prev) =>
                    prev.filter((i) => i.ingredient_id !== ingredientId)
                );
                break;
            case "misc":
                setMisc((prev) =>
                    prev.filter((i) => i.ingredient_id !== ingredientId)
                );
                break;
        }

        // Remove from recipeIngredients
        setRecipeIngredients((prev) =>
            prev.filter((i) => i.ingredient_id !== ingredientId)
        );

        // Get updated ingredients excluding the removed one
        const updatedIngredients = currentIngredients.filter(
            (i) => i.ingredient_id !== ingredientId
        );

        // Get the new state from checkRecipeBalance first
        const state = await checkRecipeBalance(updatedIngredients);

        // Then update nutrient state
        setNutrientState((prev) => {
            if (!prev) return prev;

            // Remove the ingredient from addedIngredients
            const { [ingredientId]: removed, ...remainingAdded } =
                prev.addedIngredients || {};

            // Keep existing suggestions but mark the removed ingredient as not added
            const updatedSuggestions = { ...prev.nutrientSuggestions };

            // Merge any new suggestions from the state check
            if (state.nutrientSuggestions) {
                Object.keys(state.nutrientSuggestions).forEach((nutrientId) => {
                    if (!updatedSuggestions[nutrientId]) {
                        updatedSuggestions[nutrientId] =
                            state.nutrientSuggestions[nutrientId];
                    }
                });
            }

            // Mark the removed ingredient as not added in all suggestion lists
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

        setIsUpdating(false);
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

    // First, add a ref for the ScrollArea
    const scrollAreaRef = useRef(null);

    // Add this effect to handle scroll reset
    useEffect(() => {
        // Reset scroll position when mode changes
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector(
                "[data-radix-scroll-area-viewport]"
            );
            if (viewport) {
                viewport.scrollTop = 0;
            }
        }
    }, [mode]); // Only run when mode changes

    // Render content based on mode
    const renderContent = () => {
        if (mode === "view" && recipe) {
            return (
                <RecipeSheetView
                    recipe={recipe}
                    dogs={dogs}
                    getDogName={getDogName}
                    nutrientState={nutrientState}
                    checkingNutrients={checkingNutrients}
                />
            );
        }

        return (
            <RecipeSheetEdit
                recipe={recipe}
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
    };

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
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
                                    {mode === "view"
                                        ? recipe?.recipe_name
                                        : recipe?.recipe_id
                                        ? "Edit recipe"
                                        : "New recipe"}
                                </SheetTitle>
                                <SheetDescription className="hidden">
                                    {mode === "view"
                                        ? "View recipe details"
                                        : recipe?.recipe_id
                                        ? "Make changes to your recipe"
                                        : "Create a new recipe"}
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
                        <ScrollArea ref={scrollAreaRef} className="flex-1">
                            {renderContent()}
                        </ScrollArea>
                        <div className="">
                            <SheetFooter
                                className={`px-6 flex flex-row ${
                                    mode === "edit" && recipe?.recipe_id
                                        ? "justify-between"
                                        : ""
                                }`}
                            >
                                {mode === "edit" && recipe?.recipe_id && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive">
                                                <Trash className="" />
                                                Delete
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
                                    <SheetClose className="hidden md:flex">
                                        <div className="hover:bg-accent h-10 px-4 py-2 hover:text-accent-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                                            {mode === "view"
                                                ? "Close"
                                                : "Cancel"}
                                        </div>
                                    </SheetClose>
                                    {mode === "view" ? (
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
                                            Edit
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            onClick={handleSave}
                                            disabled={!canSave()}
                                        >
                                            {isSaving ? (
                                                <Loader2 className="animate-spin" />
                                            ) : recipe?.recipe_id ? (
                                                <CheckCheck className="" />
                                            ) : (
                                                <Plus className="" />
                                            )}
                                            {recipe?.recipe_id
                                                ? "Save"
                                                : "Create recipe"}
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
