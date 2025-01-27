import { useState, useCallback, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
    const { addRecipe, updateRecipe } = useRecipes();

    // State management
    const [showAddDog, setShowAddDog] = useState(false);
    const [selectedDog, setSelectedDog] = useState(recipe?.dog_id || "");
    const [recipeName, setRecipeName] = useState(recipe?.recipe_name || "");
    const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState(null);

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
        // If we're changing modes, update the mode and keep the sheet open
        if (options?.mode) {
            onModeChange?.(options.mode);
            onOpenChange?.(true, options);
            return;
        }

        if (hasFormChanges()) {
            setShowUnsavedChanges(true);
        } else {
            if (mode === "create") {
                resetForm();
            }
            onOpenChange?.(false);
        }
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
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

            const ingredients = [
                ...meatAndBone.map((ing) => ({
                    ingredient_id: ing.id,
                    quantity: 1,
                    category: "meat_and_bone",
                })),
                ...plantMatter.map((ing) => ({
                    ingredient_id: ing.id,
                    quantity: 1,
                    category: "plant_matter",
                })),
                ...secretingOrgans.map((ing) => ({
                    ingredient_id: ing.id,
                    quantity: 1,
                    category: "secreting_organs",
                })),
                ...liver.map((ing) => ({
                    ingredient_id: ing.id,
                    quantity: 1,
                    category: "liver",
                })),
                ...misc.map((ing) => ({
                    ingredient_id: ing.id,
                    quantity: 1,
                    category: "misc",
                })),
            ];

            if (mode === "create") {
                await addRecipe(recipeData, ingredients);
                toast.success("Recipe created successfully");
                resetForm();
            } else if (mode === "edit" && recipe?.recipe_id) {
                await updateRecipe(recipe.recipe_id, recipeData, ingredients);
                toast.success("Recipe updated successfully");
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving recipe:", error);
            toast.error(
                "Failed to save recipe: " + (error.message || "Unknown error")
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Add these functions back
    const handleAddIngredient = (ingredient, section) => {
        switch (section) {
            case "meat_and_bone":
                setMeatAndBone([...meatAndBone, ingredient]);
                break;
            case "plant_matter":
                setPlantMatter([...plantMatter, ingredient]);
                break;
            case "secreting_organs":
                setSecretingOrgans([...secretingOrgans, ingredient]);
                break;
            case "liver":
                setLiver([...liver, ingredient]);
                break;
            case "misc":
                setMisc([...misc, ingredient]);
                break;
        }
        setActiveSection(null);
    };

    const handleRemoveIngredient = (ingredientId, section) => {
        switch (section) {
            case "meat_and_bone":
                setMeatAndBone(
                    meatAndBone.filter((i) => i.ingredient_id !== ingredientId)
                );
                break;
            case "plant_matter":
                setPlantMatter(
                    plantMatter.filter((i) => i.ingredient_id !== ingredientId)
                );
                break;
            case "secreting_organs":
                setSecretingOrgans(
                    secretingOrgans.filter(
                        (i) => i.ingredient_id !== ingredientId
                    )
                );
                break;
            case "liver":
                setLiver(liver.filter((i) => i.ingredient_id !== ingredientId));
                break;
            case "misc":
                setMisc(misc.filter((i) => i.ingredient_id !== ingredientId));
                break;
        }
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
                        recipe={recipe}
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
                        <SheetFooter className="p-6">
                            {mode !== "view" && (
                                <Button
                                    type="submit"
                                    onClick={handleSave}
                                    disabled={
                                        !recipeName || !selectedDog || isSaving
                                    }
                                >
                                    {isSaving && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {mode === "create"
                                        ? "Create recipe"
                                        : "Save changes"}
                                </Button>
                            )}
                            {mode === "view" && (
                                <Button
                                    type="submit"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClose(true, {
                                            mode: "edit",
                                            recipe: recipe,
                                        });
                                    }}
                                >
                                    Edit recipe
                                </Button>
                            )}
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
                    onOpenChange(false);
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
