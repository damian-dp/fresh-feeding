import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DogSwitcher } from "./dog-switcher";
import { IngredientSection } from "./ingredient-section";
import { toast } from "sonner";
import { BadgeStack } from "@/components/ui/badge-stack";
import { Bone, Brain, Heart, Leaf, Pill } from "lucide-react";

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
    setRecipeIngredients,
    recipeIngredients,
}) {
    const selectedDog = dogs.find((d) => d.dog_id === recipe.dog_id);

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
    const handleIngredientAdd = (ingredient, category) => {
        console.log("Adding ingredient:", ingredient);
        console.log("Category:", category);

        // Create the recipe_ingredients structure with proper category_id
        const newIngredient = {
            ingredient_id: ingredient.id, // Changed from ingredient.ingredient_id
            ingredients: {
                ingredient_id: ingredient.id,
                ingredient_name: ingredient.name,
                category_id: ingredient.category,
                // Include any other properties from the original ingredient
                ...ingredient,
            },
            quantity: 0,
        };

        console.log("Structured ingredient:", newIngredient);

        // Call the parent handler with the properly structured ingredient
        handleAddIngredient(newIngredient, category);
        setActiveSection(null);
    };

    const handleUpdateQuantity = (ingredientId, categoryId, newQuantity) => {
        // Update only the selected ingredient's quantity
        const updatedIngredients = recipeIngredients.map((ing) => {
            if (ing.ingredient_id === ingredientId) {
                return { ...ing, quantity: newQuantity };
            }
            return ing;
        });

        // Update recipe state
        setRecipeIngredients(updatedIngredients);
    };

    return (
        <>
            {/* Form section */}
            <div className="flex flex-row gap-4 p-6 border-b border-border">
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
            <div className="flex flex-col gap-8 p-8">
                <p className="font-medium">Ingredients</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-16">
                    {/* Meat and Bone Section */}
                    <div className="flex flex-col gap-6">
                        <IngredientSection
                            title="Meat and bone"
                            items={(recipe.recipe_ingredients || []).filter(
                                (item) => item?.ingredients?.category_id === 1
                            )}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "meat_and_bone")
                            }
                            onAddItem={handleIngredientAdd}
                            category="meat_and_bone"
                            emptyStateText="Add meat and bone ingredients"
                            mode="edit"
                            isActive={activeSection === "meat_and_bone"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory(
                                "meat_and_bone"
                            )}
                            isLoading={ingredientsLoading}
                            onUpdateQuantity={(ingredientId, newQuantity) =>
                                handleUpdateQuantity(
                                    ingredientId,
                                    1,
                                    newQuantity
                                )
                            }
                            dog={selectedDog}
                        />
                    </div>

                    {/* Plant Matter Section */}
                    <div className="flex flex-col gap-6">
                        <IngredientSection
                            title="Plant matter"
                            items={(recipe.recipe_ingredients || []).filter(
                                (item) => item?.ingredients?.category_id === 2
                            )}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "plant_matter")
                            }
                            onAddItem={handleIngredientAdd}
                            category="plant_matter"
                            emptyStateText="Add plant matter ingredients"
                            mode="edit"
                            isActive={activeSection === "plant_matter"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory(
                                "plant_matter"
                            )}
                            isLoading={ingredientsLoading}
                            onUpdateQuantity={(ingredientId, newQuantity) =>
                                handleUpdateQuantity(
                                    ingredientId,
                                    2,
                                    newQuantity
                                )
                            }
                            dog={selectedDog}
                        />
                    </div>

                    {/* Secreting Organs Section */}
                    <div className="flex flex-col gap-6">
                        <IngredientSection
                            title="Secreting organs"
                            items={(recipe.recipe_ingredients || []).filter(
                                (item) => item?.ingredients?.category_id === 4
                            )}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "secreting_organs")
                            }
                            onAddItem={handleIngredientAdd}
                            category="secreting_organs"
                            emptyStateText="Add secreting organs ingredients"
                            mode="edit"
                            isActive={activeSection === "secreting_organs"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory(
                                "secreting_organs"
                            )}
                            isLoading={ingredientsLoading}
                            onUpdateQuantity={(ingredientId, newQuantity) =>
                                handleUpdateQuantity(
                                    ingredientId,
                                    4,
                                    newQuantity
                                )
                            }
                        />
                    </div>

                    {/* Liver Section */}
                    <div className="flex flex-col gap-6">
                        <IngredientSection
                            title="Liver"
                            items={(recipe.recipe_ingredients || []).filter(
                                (item) => item?.ingredients?.category_id === 3
                            )}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "liver")
                            }
                            onAddItem={handleIngredientAdd}
                            category="liver"
                            emptyStateText="Add liver ingredients"
                            mode="edit"
                            isActive={activeSection === "liver"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory("liver")}
                            isLoading={ingredientsLoading}
                            onUpdateQuantity={(ingredientId, newQuantity) =>
                                handleUpdateQuantity(
                                    ingredientId,
                                    3,
                                    newQuantity
                                )
                            }
                            dog={selectedDog}
                        />
                    </div>

                    <div className="flex flex-col gap-6 col-span-2">
                        <IngredientSection
                            title="Other ingredients"
                            items={(recipe.recipe_ingredients || []).filter(
                                (item) => item?.ingredients?.category_id === 5
                            )}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "misc")
                            }
                            onAddItem={handleIngredientAdd}
                            category="misc"
                            emptyStateText="Add miscellaneous ingredients"
                            mode="edit"
                            isActive={activeSection === "misc"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory("misc")}
                            isLoading={ingredientsLoading}
                            onUpdateQuantity={(ingredientId, newQuantity) =>
                                handleUpdateQuantity(
                                    ingredientId,
                                    5,
                                    newQuantity
                                )
                            }
                            dog={selectedDog}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
