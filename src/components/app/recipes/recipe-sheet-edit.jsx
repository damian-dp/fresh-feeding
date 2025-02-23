import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DogSwitcher } from "./dog-switcher";
import { IngredientSection, INGREDIENT_SECTIONS } from "./ingredient-section";
import { toast } from "sonner";
import { BadgeStack } from "@/components/ui/badge-stack";
import { Bone, Brain, Heart, Leaf, Pill, Loader2 } from "lucide-react";
import { NutrientGroupAlert } from "./nutrient-group-alert";
import { useState } from "react";

export function RecipeSheetEdit({
    recipe,
    recipeName,
    setRecipeName,
    dogs,
    setSelectedDog,
    setShowAddDog,
    ingredientSections,
    activeSection,
    setActiveSection,
    handleAddIngredient,
    handleRemoveIngredient,
    getIngredientsByCategory,
    ingredientsLoading,
    nutrientState,
    checkingNutrients,
}) {
    const [isUpdating, setIsUpdating] = useState(false);

    // Get all ingredients from all sections
    const allIngredients = Object.values(ingredientSections).flatMap(
        (section) => section.getItems()
    );

    const hasEditChanges = () => {
        return (
            recipeName !== recipe?.recipe_name ||
            selectedDog !== recipe?.dog_id ||
            Object.entries(ingredientSections).some(
                ([key, section]) =>
                    JSON.stringify(section.getItems()) !==
                    JSON.stringify(recipe[key])
            )
        );
    };

    // Calculate total grams for a category
    const getCategoryGrams = (dog, ratio) => {
        if (!dog || !recipe?.batch_size) return 0;
        return Math.round(ratio * (recipe.batch_size * 1000));
    };

    // Update the handleIngredientAdd function
    const handleIngredientAdd = (ingredient, category, options = {}) => {
        // Create the recipe_ingredients structure with proper category_id
        const newIngredient = {
            ingredient_id: ingredient.ingredient_id || ingredient.id,
            ingredients: {
                ingredient_id: ingredient.ingredient_id || ingredient.id,
                ingredient_name: ingredient.ingredient_name || ingredient.name,
                category_id: ingredient.category_id || ingredient.category,
                ...ingredient,
            },
            quantity: 0,
        };

        // Call the parent handler with the properly structured ingredient and options
        handleAddIngredient(newIngredient, category, options);
        setActiveSection(null);
    };

    return (
        <>
            {/* Form section */}
            <div className="flex flex-col md:flex-row gap-6 p-8">
                <div className="space-y-2 w-full">
                    <Label htmlFor="recipe-name">Recipe Name</Label>
                    <Input
                        id="recipe-name"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        placeholder="Enter recipe title"
                        className="capitalize w-full h-14 text-lg md:text-base"
                    />
                </div>

                <div className="space-y-2 w-full">
                    <Label htmlFor="dog-select">Select Dog</Label>
                    <DogSwitcher
                        dogs={dogs}
                        onSelect={setSelectedDog}
                        onAddDog={() => setShowAddDog(true)}
                        defaultSelectedDog={recipe?.dog_id}
                    />
                </div>
            </div>

            {/* Ingredients section */}
            <div className="flex flex-col gap-8 p-8 border-t border-border">
                <p className="font-medium">Ingredients</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                    {Object.entries(INGREDIENT_SECTIONS).map(
                        ([key, section]) => (
                            <IngredientSection
                                key={key}
                                {...section}
                                items={ingredientSections[key].getItems()}
                                onRemoveItem={(id) =>
                                    handleRemoveIngredient(id, key)
                                }
                                onAddItem={handleAddIngredient}
                                category={key}
                                mode="edit"
                                isActive={activeSection === key}
                                onToggleActive={setActiveSection}
                                ingredients={getIngredientsByCategory(key)}
                                isLoading={ingredientsLoading}
                                allIngredients={allIngredients}
                            />
                        )
                    )}
                </div>
            </div>

            {/* Move nutrition status section here */}
            {allIngredients.length > 0 && (
                <div className="flex flex-col gap-6 p-8 border-t border-border">
                    <div className="flex items-center gap-2">
                        <p className="font-medium">Nutrition status</p>
                        {isUpdating && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                    </div>
                    <div className="flex gap-8">
                        <NutrientGroupAlert
                            recipeIngredients={Object.values(
                                ingredientSections
                            ).flatMap((section) => section.getItems())}
                            mode="edit"
                            onAddIngredient={(ingredient, options) => {
                                const categoryMap = {
                                    1: "meat_and_bone",
                                    2: "plant_matter",
                                    3: "liver",
                                    4: "secreting_organs",
                                    5: "misc",
                                };
                                const category =
                                    categoryMap[ingredient.category_id];
                                handleAddIngredient(
                                    ingredient,
                                    category,
                                    options
                                );
                            }}
                            nutrientState={nutrientState}
                            isChecking={isUpdating}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
