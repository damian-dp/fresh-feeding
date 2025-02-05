import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DogSwitcher } from "./dog-switcher";
import { IngredientSection } from "./ingredient-section";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { NutrientGroupAlert } from "./nutrient-group-alert";

export function RecipeSheetCreate({
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
    defaultDogId,
}) {
    const hasCreateChanges = () => {
        return (
            recipeName !== "" ||
            selectedDog !== "" ||
            Object.values(ingredientSections).some(
                (section) => section.getItems().length > 0
            )
        );
    };

    // Get the current dog ID from your router (example using React Router)
    const { dogId } = useParams();

    return (
        <>
            {/* Form section - moved from recipe-form.jsx */}
            <div className="flex flex-col md:flex-row gap-6 p-8 border-b border-border">
                <div className="flex flex-col gap-4 w-full">
                    <Label htmlFor="recipe-name">Recipe title</Label>
                    <Input
                        id="recipe-name"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        placeholder="Enter recipe title"
                        className="capitalize w-full h-14 text-lg md:text-base"
                    />
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <Label htmlFor="dog-select">Select Dog</Label>
                    <DogSwitcher
                        dogs={dogs}
                        onSelect={setSelectedDog}
                        onAddDog={() => setShowAddDog(true)}
                        defaultSelectedDog={dogId ? Number(dogId) : null}
                    />
                </div>
            </div>

            {/* Ingredients section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 p-8 border-b border-border">
                {Object.entries(ingredientSections).map(([key, section]) => (
                    <IngredientSection
                        autoFocus={true}
                        key={key}
                        title={section.title}
                        items={section.getItems()}
                        onRemoveItem={handleRemoveIngredient}
                        onAddItem={handleAddIngredient}
                        category={key}
                        emptyStateText={section.emptyStateText}
                        mode="create"
                        isActive={activeSection === key}
                        onToggleActive={setActiveSection}
                        ingredients={getIngredientsByCategory(key)}
                        isLoading={ingredientsLoading}
                    />
                ))}
            </div>

            <div className="flex flex-col gap-6 p-8">
                <p className="font-medium">Nutrition status</p>
                <div className="flex gap-8">
                    <NutrientGroupAlert
                        recipeIngredients={Object.values(
                            ingredientSections
                        ).flatMap((section) => section.getItems())}
                        mode="create"
                    />
                </div>
            </div>
        </>
    );
}
