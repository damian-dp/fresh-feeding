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
    nutrientState,
    checkingNutrients,
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
            <div className="flex flex-col gap-8 p-8 border-b border-border">
                <p className="font-medium">Ingredients</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                    {/* Meat and Bone Section */}
                    <div className="flex flex-col gap-6">
                        <IngredientSection
                            autoFocus={true}
                            title="Meat and bone"
                            items={ingredientSections.meat_and_bone.getItems()}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "meat_and_bone")
                            }
                            onAddItem={handleAddIngredient}
                            category="meat_and_bone"
                            emptyStateText="Add meat and bone ingredients"
                            mode="create"
                            isActive={activeSection === "meat_and_bone"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory("meat_and_bone")}
                            isLoading={ingredientsLoading}
                        />
                    </div>

                    {/* Plant Matter Section */}
                    <div className="flex flex-col gap-6">
                        <IngredientSection
                            title="Plant matter"
                            items={ingredientSections.plant_matter.getItems()}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "plant_matter")
                            }
                            onAddItem={handleAddIngredient}
                            category="plant_matter"
                            emptyStateText="Add plant matter ingredients"
                            mode="create"
                            isActive={activeSection === "plant_matter"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory("plant_matter")}
                            isLoading={ingredientsLoading}
                        />
                    </div>

                    {/* Secreting Organs Section */}
                    <div className="flex flex-col gap-6">
                        <IngredientSection
                            title="Secreting organs"
                            items={ingredientSections.secreting_organs.getItems()}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "secreting_organs")
                            }
                            onAddItem={handleAddIngredient}
                            category="secreting_organs"
                            emptyStateText="Add secreting organs ingredients"
                            mode="create"
                            isActive={activeSection === "secreting_organs"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory("secreting_organs")}
                            isLoading={ingredientsLoading}
                        />
                    </div>

                    {/* Liver Section */}
                    <div className="flex flex-col gap-6">
                        <IngredientSection
                            title="Liver"
                            items={ingredientSections.liver.getItems()}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "liver")
                            }
                            onAddItem={handleAddIngredient}
                            category="liver"
                            emptyStateText="Add liver ingredients"
                            mode="create"
                            isActive={activeSection === "liver"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory("liver")}
                            isLoading={ingredientsLoading}
                        />
                    </div>

                    {/* Misc Section */}
                    <div className="flex flex-col gap-6 md:col-span-2">
                        <IngredientSection
                            title="Other ingredients"
                            items={ingredientSections.misc.getItems()}
                            onRemoveItem={(id) =>
                                handleRemoveIngredient(id, "misc")
                            }
                            onAddItem={handleAddIngredient}
                            category="misc"
                            emptyStateText="Add miscellaneous ingredients"
                            mode="create"
                            isActive={activeSection === "misc"}
                            onToggleActive={setActiveSection}
                            ingredients={getIngredientsByCategory("misc")}
                            isLoading={ingredientsLoading}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 p-8">
                {Object.values(ingredientSections).some(section => section.getItems().length > 0) && (
                    <>
                        <p className="font-medium">Nutrition status</p>
                        <div className="flex gap-8">
                            <NutrientGroupAlert
                                recipeIngredients={Object.values(
                                    ingredientSections
                                ).flatMap((section) => section.getItems())}
                                mode="create"
                                onAddIngredient={(ingredient, options) => {
                                    const categoryMap = {
                                        1: "meat_and_bone",
                                        2: "plant_matter",
                                        3: "liver",
                                        4: "secreting_organs",
                                        5: "misc",
                                    };
                                    const category = categoryMap[ingredient.category_id];
                                    handleAddIngredient(ingredient, category, options);
                                }}
                                nutrientState={nutrientState}
                                isChecking={checkingNutrients}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
