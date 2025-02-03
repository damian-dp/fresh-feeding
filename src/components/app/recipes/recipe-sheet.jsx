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

    // Update state when recipe changes
    useEffect(() => {
        if (recipe && (mode === "view" || mode === "edit")) {
            setRecipeName(recipe.recipe_name || "");
            setSelectedDog(recipe.dog_id || "");
            setMeatAndBone(recipe.meat_and_bone || []);
            setPlantMatter(recipe.plant_matter || []);
            setSecretingOrgans(recipe.secreting_organs || []);
            setLiver(recipe.liver || []);
            setMisc(recipe.misc || []);
            setActiveSection(null);
        } else if (!recipe && mode === "create") {
            resetForm();
            if (dogId) {
                setSelectedDog(Number(dogId));
            }
        }
    }, [recipe, mode, dogId]);

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

    // Modify the hasFormChanges function to add debugging
    const hasFormChanges = () => {
        // No changes possible in view mode
        if (mode === "view") return false;

        // Check for changes based on mode
        if (mode === "edit") {
            const currentValues = {
                name: recipeName,
                dogId: selectedDog,
                meatAndBone: meatAndBone,
                plantMatter: plantMatter,
                secretingOrgans: secretingOrgans,
                liver: liver,
                misc: misc,
            };

            const originalValues = {
                name: recipe?.recipe_name,
                dogId: recipe?.dog_id,
                meatAndBone: recipe?.meat_and_bone || [],
                plantMatter: recipe?.plant_matter || [],
                secretingOrgans: recipe?.secreting_organs || [],
                liver: recipe?.liver || [],
                misc: recipe?.misc || [],
            };

            const hasChanges =
                currentValues.name !== originalValues.name ||
                currentValues.dogId !== originalValues.dogId ||
                JSON.stringify(currentValues.meatAndBone) !==
                    JSON.stringify(originalValues.meatAndBone) ||
                JSON.stringify(currentValues.plantMatter) !==
                    JSON.stringify(originalValues.plantMatter) ||
                JSON.stringify(currentValues.secretingOrgans) !==
                    JSON.stringify(originalValues.secretingOrgans) ||
                JSON.stringify(currentValues.liver) !==
                    JSON.stringify(originalValues.liver) ||
                JSON.stringify(currentValues.misc) !==
                    JSON.stringify(originalValues.misc);

            return hasChanges;
        }

        // Create mode
        return (
            recipeName !== "" ||
            selectedDog !== "" ||
            meatAndBone.length > 0 ||
            plantMatter.length > 0 ||
            secretingOrgans.length > 0 ||
            liver.length > 0 ||
            misc.length > 0
        );
    };

    const handleClose = (newOpen, options = {}) => {
        // If we're changing modes, update the mode and keep the sheet open
        if (options?.mode) {
            onModeChange?.(options.mode);
            onOpenChange?.(true, options);
            return;
        }

        // Check for unsaved changes
        if (!newOpen && hasFormChanges()) {
            setShowUnsavedChanges(true);
            return;
        }

        // If closing without changes
        if (!newOpen) {
            if (mode === "edit") {
                // In edit mode, switch back to view mode
                onModeChange?.("view");
                onOpenChange?.(true, { mode: "view", recipe });
            } else {
                // In create or view mode, just close the sheet
                resetForm();
                onOpenChange?.(false);
            }
        } else {
            onOpenChange?.(newOpen);
        }
    };

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

    // Add this function to handle ingredient additions
    const handleAddIngredient = (ingredient, category) => {
        if (mode === "edit") {
            setRecipeIngredients((prev) => [...prev, ingredient]);
        }

        // Map category to the correct state setter
        switch (category) {
            case "meat_and_bone":
                setMeatAndBone((prev) => [...prev, ingredient]);
                break;
            case "plant_matter":
                setPlantMatter((prev) => [...prev, ingredient]);
                break;
            case "secreting_organs":
                setSecretingOrgans((prev) => [...prev, ingredient]);
                break;
            case "liver":
                setLiver((prev) => [...prev, ingredient]);
                break;
            case "misc":
                setMisc((prev) => [...prev, ingredient]);
                break;
        }
    };

    const handleRemoveIngredient = (ingredientId, section) => {
        if (mode === "edit") {
            setRecipeIngredients((prev) =>
                prev.filter((i) => i.ingredient_id !== ingredientId)
            );
        }

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

    // Create an object that maps each section to its items
    const ingredientSections = {
        meat_and_bone: {
            title: "Muscle Meat & Bone",
            emptyStateText: "Add muscle meat and bone ingredients",
            category: 1,
            getItems: () => (mode === "edit" ? meatAndBone : meatAndBone),
        },
        plant_matter: {
            title: "Plant Matter",
            emptyStateText: "Add plant matter ingredients",
            category: 2,
            getItems: () => (mode === "edit" ? plantMatter : plantMatter),
        },
        liver: {
            title: "Liver",
            emptyStateText: "Add liver ingredients",
            category: 3,
            getItems: () => (mode === "edit" ? liver : liver),
        },
        secreting_organs: {
            title: "Secreting Organs",
            emptyStateText: "Add secreting organ ingredients",
            category: 4,
            getItems: () =>
                mode === "edit" ? secretingOrgans : secretingOrgans,
        },
        misc: {
            title: "Misc",
            emptyStateText: "Add miscellaneous ingredients",
            category: 5,
            getItems: () => (mode === "edit" ? misc : misc),
        },
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
                        setShowAddDog={handleAddDog}
                        ingredientSections={ingredientSections}
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
                                                Delete '{recipe?.recipe_name}'
                                                recipe?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the
                                                recipe titled '
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
                open={showUnsavedChanges}
                onOpenChange={setShowUnsavedChanges}
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
        </>
    );
}
