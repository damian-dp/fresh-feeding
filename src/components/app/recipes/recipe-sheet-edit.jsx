import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DogSwitcher } from "./dog-switcher";
import { IngredientSection } from "./ingredient-section";
import { toast } from "sonner";

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
}) {
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

    return (
        <>
            {/* Form section - moved from recipe-form.jsx */}
            <div className="flex flex-row gap-4 p-6 border-b border-border">
                <div className="space-y-2 w-full">
                    <Label htmlFor="recipe-name">Recipe Name</Label>
                    <Input
                        id="recipe-name"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        placeholder="Enter recipe name"
                        className="capitalize w-full"
                    />
                </div>

                <div className="space-y-2 w-full">
                    <Label htmlFor="dog-select">Select Dog</Label>
                    <DogSwitcher
                        dogs={dogs}
                        onSelect={setSelectedDog}
                        onAddDog={() => setShowAddDog(true)}
                    />
                </div>
            </div>

            {/* Ingredients section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                {Object.entries(ingredientSections).map(([key, section]) => (
                    <IngredientSection
                        key={key}
                        title={section.title}
                        items={section.getItems()}
                        onRemoveItem={handleRemoveIngredient}
                        onAddItem={handleAddIngredient}
                        category={key}
                        emptyStateText={section.emptyStateText}
                        mode="edit"
                        isActive={activeSection === key}
                        onToggleActive={setActiveSection}
                        ingredients={getIngredientsByCategory(key)}
                        isLoading={ingredientsLoading}
                    />
                ))}
            </div>
        </>
    );
}
