import { useState, useCallback } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2, X, Save, Pencil } from "lucide-react";
import { useUser } from "@/components/providers/user-provider";
import { useDogs } from "@/components/providers/dogs-provider";
import { useIngredients } from "@/components/providers/ingredients-provider";
import { AddDogDialog } from "@/components/app/dashboard/add-dog-dialog";
import { IngredientSelector } from "./ingredient-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DogSwitcher } from "./dog-switcher";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRecipes } from "@/components/providers/recipes-provider";
import { toast } from "sonner";

export function RecipeSheet({
    mode = "create",
    recipe = null,
    open,
    onOpenChange,
}) {
    const { profile } = useUser();
    const { dogs } = useDogs();
    const { ingredients, loading: ingredientsLoading } = useIngredients();
    const { addRecipe, updateRecipe } = useRecipes();

    const [showAddDog, setShowAddDog] = useState(false);
    const [selectedDog, setSelectedDog] = useState("");
    const [recipeName, setRecipeName] = useState(recipe?.recipe_name || "");

    // Ingredient sections state
    const [meatAndBone, setMeatAndBone] = useState(recipe?.meat_and_bone || []);
    const [plantMatter, setPlantMatter] = useState(recipe?.plant_matter || []);
    const [secretingOrgans, setSecretingOrgans] = useState(
        recipe?.secreting_organs || []
    );
    const [liver, setLiver] = useState(recipe?.liver || []);
    const [misc, setMisc] = useState(recipe?.misc || []);

    // Add state for active section
    const [activeSection, setActiveSection] = useState(null);

    // Add state for unsaved changes
    const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

    // Add state for saving
    const [isSaving, setIsSaving] = useState(false);

    // Filter ingredients by category
    const getIngredientsByCategory = useCallback(
        (categoryName) => {
            if (!ingredients) return [];

            return ingredients.filter((ing) => {
                switch (categoryName) {
                    case "meat_and_bone":
                        return ing.category === 1;
                    case "plant_matter":
                        return ing.category === 2;
                    case "liver":
                        return ing.category === 3;
                    case "secreting_organs":
                        return ing.category === 4;
                    case "misc":
                        return ing.category === 5;
                    default:
                        return false;
                }
            });
        },
        [ingredients]
    );

    // Add handler for adding ingredients
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

    // Add handler for removing ingredients
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

    const renderIngredientSection = (
        title,
        items,
        setItems,
        category,
        emptyStateText
    ) => (
        <div className={`space-y-4 ${category === "misc" ? "col-span-2" : ""}`}>
            <div className="flex items-center justify-between">
                <Label>{title}</Label>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setActiveSection(category)}
                    disabled={mode === "view"}
                >
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </div>
            <div
                className={`flex flex-col gap-4 ${
                    items.length > 0 ? "h-auto" : "h-52"
                }`}
            >
                {items.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center rounded-md border border-border p-8 text-center animate-in fade-in-50">
                        <div className="flex flex-col h-full w-full items-center justify-center text-center">
                            <p className="text-sm text-muted-foreground">
                                {emptyStateText}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-md border p-2"
                            >
                                <span>{item.name}</span>
                                {mode !== "view" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() =>
                                            handleRemoveIngredient(
                                                item.id,
                                                category
                                            )
                                        }
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeSection === category && (
                    <div className="">
                        {ingredientsLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : (
                            <IngredientSelector
                                ingredients={getIngredientsByCategory(category)}
                                onSelect={(ingredient) =>
                                    handleAddIngredient(ingredient, category)
                                }
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );

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

    const handleClose = () => {
        if (hasFormChanges()) {
            setShowUnsavedChanges(true);
        } else {
            if (mode === "create") {
                resetForm();
            }
            onOpenChange(false);
        }
    };

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

            // Transform ingredients into the format expected by the provider
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
                try {
                    await addRecipe(recipeData, ingredients);
                    toast.success("Recipe created successfully");
                    resetForm();
                    onOpenChange(false);
                } catch (error) {
                    console.error("Error in addRecipe:", error);
                    toast.error(
                        "Failed to create recipe: " +
                            (error.message || "Unknown error")
                    );
                    return;
                }
            } else if (mode === "edit" && recipe?.recipe_id) {
                try {
                    await updateRecipe(
                        recipe.recipe_id,
                        recipeData,
                        ingredients
                    );
                    toast.success("Recipe updated successfully");
                    onOpenChange(false);
                } catch (error) {
                    console.error("Error in updateRecipe:", error);
                    toast.error(
                        "Failed to update recipe: " +
                            (error.message || "Unknown error")
                    );
                    return;
                }
            }
        } catch (error) {
            console.error("Error saving recipe:", error);
            toast.error(
                "There was a problem saving your recipe. Please try again."
            );
        } finally {
            setIsSaving(false);
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
                                    : "View recipe"}
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
                            <div className="flex flex-row gap-4 p-6 border-b border-border">
                                {/* Recipe Name */}
                                <div className="space-y-2 w-full">
                                    <Label htmlFor="recipe-name">
                                        Recipe Name
                                    </Label>
                                    <Input
                                        id="recipe-name"
                                        value={recipeName}
                                        onChange={(e) =>
                                            setRecipeName(e.target.value)
                                        }
                                        placeholder="Enter recipe name"
                                        disabled={mode === "view"}
                                        className="capitalize w-full"
                                    />
                                </div>

                                {/* Dog Selection */}
                                <div className="space-y-2 w-full">
                                    <Label htmlFor="dog-select">
                                        Select Dog
                                    </Label>
                                    <DogSwitcher
                                        dogs={dogs}
                                        onSelect={setSelectedDog}
                                        onAddDog={() => setShowAddDog(true)}
                                    />
                                </div>
                            </div>

                            {/* Ingredient Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                                {renderIngredientSection(
                                    "Muscle Meat and Bone",
                                    meatAndBone,
                                    setMeatAndBone,
                                    "meat_and_bone",
                                    "Add muscle meat and bone ingredients to your recipe"
                                )}

                                {renderIngredientSection(
                                    "Plant Matter",
                                    plantMatter,
                                    setPlantMatter,
                                    "plant_matter",
                                    "Add plant matter ingredients to your recipe"
                                )}

                                {renderIngredientSection(
                                    "Liver",
                                    liver,
                                    setLiver,
                                    "liver",
                                    "Add liver ingredients to your recipe"
                                )}

                                {renderIngredientSection(
                                    "Secreting Organs",
                                    secretingOrgans,
                                    setSecretingOrgans,
                                    "secreting_organs",
                                    "Add secreting organ ingredients to your recipe"
                                )}

                                {renderIngredientSection(
                                    "Other",
                                    misc,
                                    setMisc,
                                    "misc",
                                    "Add other ingredients to your recipe"
                                )}
                            </div>
                        </ScrollArea>
                        <SheetFooter>
                            {mode === "create" ? (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleSave}
                                        disabled={!recipeName || !selectedDog}
                                    >
                                        <Save className="" />
                                        Create Recipe
                                    </Button>
                                </div>
                            ) : mode === "edit" ? (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleSave}
                                        disabled={!recipeName || !selectedDog}
                                    >
                                        <Save className="" />
                                        Save Changes
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            // TODO: Implement edit mode transition
                                            console.log(
                                                "Switching to edit mode..."
                                            );
                                        }}
                                    >
                                        <Pencil className="" />
                                        Edit Recipe
                                    </Button>
                                </div>
                            )}
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>

            <AlertDialog
                open={showUnsavedChanges && !isSaving}
                onOpenChange={setShowUnsavedChanges}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to
                            close without saving?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setShowUnsavedChanges(false);
                                if (mode === "create") {
                                    resetForm();
                                }
                                onOpenChange(false);
                            }}
                        >
                            Close Without Saving
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
