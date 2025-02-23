import { BadgeStack } from "@/components/ui/badge-stack";
import {
    DogIcon,
    Percent,
    Target,
    Bone,
    Brain,
    Heart,
    Leaf,
    Pill,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { BatchCalculator } from "./batch-calculator";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRecipes } from "@/components/providers/recipes-provider";
import { IngredientSection } from "./ingredient-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NutrientGroupAlert } from "./nutrient-group-alert";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const getIngredientsByCategory = (recipeIngredients, categoryId) => {
    return (recipeIngredients || []).filter(
        (item) => item.ingredients?.category_id === categoryId
    );
};

export function RecipeSheetView({
    recipe,
    dogs,
    getDogName,
    nutrientState,
    checkingNutrients,
}) {
    const { updateRecipe } = useRecipes();
    const [batchSize, setBatchSize] = useState(recipe?.batch_size ?? null);
    const [numberOfDays, setNumberOfDays] = useState(null);
    const [localRecipe, setLocalRecipe] = useState(recipe);
    const [notes, setNotes] = useState(recipe?.recipe_notes || "");
    const [saveStatus, setSaveStatus] = useState("idle"); // idle, typing, saving, saved, error
    const textareaRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        setLocalRecipe(recipe);
        if (recipe?.batch_size) {
            setBatchSize(recipe.batch_size);
            // Calculate initial days based on stored batch_size
            const dog = dogs.find((d) => d.dog_id === recipe.dog_id);
            if (dog) {
                const dailyIntake =
                    (dog.weight_metric * 1000 * (dog.ratios_intake / 100)) /
                    1000;
                setNumberOfDays(Math.round(recipe.batch_size / dailyIntake));
            }
        }
    }, [recipe]);

    const handleBatchSizeChange = (value) => {
        const newValue = value === "" ? null : value;
        setBatchSize(newValue);

        // Calculate days and save to database
        const dog = dogs.find((d) => d.dog_id === localRecipe.dog_id);
        if (dog && newValue !== null) {
            const dailyIntake =
                (dog.weight_metric * 1000 * (dog.ratios_intake / 100)) / 1000;
            // Round up days to ensure batch is never short
            const days = Math.ceil(newValue / dailyIntake);
            setNumberOfDays(days);

            // Save exactly what was entered, but limit to 1 decimal place
            updateRecipe(localRecipe.recipe_id, {
                batch_size: Number(Number(newValue).toFixed(1)),
            });
        }
    };

    const handleDaysChange = (value) => {
        const newValue = value === "" ? null : value;
        setNumberOfDays(newValue);

        // Calculate batch size and save to database
        const dog = dogs.find((d) => d.dog_id === localRecipe.dog_id);
        if (dog && newValue !== null) {
            const dailyIntake =
                (dog.weight_metric * 1000 * (dog.ratios_intake / 100)) / 1000;
            // Calculate batch size and round up to nearest 0.1
            const exactBatch = dailyIntake * newValue;
            const newBatch = Math.ceil(exactBatch * 10) / 10;
            setBatchSize(newBatch);

            // Save the calculated batch size
            updateRecipe(localRecipe.recipe_id, {
                batch_size: newBatch,
            });
        }
    };

    // Calculate total grams for a category
    const getCategoryGrams = (dog, ratio) => {
        if (!dog || !batchSize) return 0;
        return Math.round(ratio * (batchSize * 1000));
    };

    // Adjust textarea height on content change
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    };

    // Adjust height on content change
    useEffect(() => {
        adjustTextareaHeight();
    }, [notes]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Debounced save function
    const saveNotes = useCallback(
        async (value) => {
            try {
                setSaveStatus("saving");

                const { error, data } = await supabase
                    .from("recipes")
                    .update({
                        recipe_notes: value,
                    })
                    .eq("recipe_id", recipe.recipe_id)
                    .select("*")
                    .maybeSingle();

                if (error) {
                    console.error("Update error:", error);
                    throw error;
                }

                if (data === null) {
                    throw new Error("No data returned from update");
                }

                // Update local state with the returned data
                setNotes(data.recipe_notes);
                setSaveStatus("saved");

                // Clear any existing timeout
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                }

                // Set new timeout to clear the saved status
                saveTimeoutRef.current = setTimeout(() => {
                    setSaveStatus("idle");
                }, 4000);
            } catch (error) {
                console.error("Error saving notes:", error);
                setSaveStatus("error");
                toast.error("Failed to save notes");
            }
        },
        [recipe.recipe_id]
    );

    // Debounce the save function (1 second delay)
    const debouncedSave = useDebounce(saveNotes, 1000);

    // Handle text changes
    const handleNotesChange = (e) => {
        const value = e.target.value;
        setNotes(value);
        setSaveStatus("typing");
        debouncedSave(value);
    };

    return (
        <>
            <div className="p-8 grid grid-cols-2 [530px]:flex [530px]:flex-row gap-14 [530px]:gap-6 justify-between w-full border-b border-border">
                <BadgeStack
                    variant="default"
                    icon={<DogIcon />}
                    label={getDogName(localRecipe.dog_id)}
                    sublabel="Created for"
                    flipped={true}
                />
                <BadgeStack
                    variant="default"
                    icon={<Percent />}
                    label={(() => {
                        const dog = dogs.find(
                            (d) => d.dog_id === localRecipe.dog_id
                        );
                        if (!dog) return "Unknown";
                        const dailyIntake = Math.round(
                            dog.weight_metric * 1000 * (dog.ratios_intake / 100)
                        );
                        return (
                            <>
                                {dailyIntake}g{" "}
                                <span className="text-muted-foreground">
                                    / {dog.ratios_intake}%
                                </span>
                            </>
                        );
                    })()}
                    sublabel="Daily intake"
                    flipped={true}
                />
                <BadgeStack
                    variant="default"
                    icon={<Target />}
                    label={(() => {
                        const dog = dogs.find(
                            (d) => d.dog_id === localRecipe.dog_id
                        );
                        return dog
                            ? dog.goal === "maintain"
                                ? "Maintain weight"
                                : dog.goal === "gain"
                                ? "Gain weight"
                                : dog.goal === "lose"
                                ? "Lose weight"
                                : "Custom goal"
                            : "Unknown";
                    })()}
                    sublabel="Goal"
                    flipped={true}
                    className="hidden [530px]:flex"
                />
            </div>
            <BatchCalculator
                recipe={localRecipe}
                dogs={dogs}
                getDogName={getDogName}
                batchSize={batchSize}
                numberOfDays={numberOfDays}
                onBatchSizeChange={handleBatchSizeChange}
                onDaysChange={handleDaysChange}
            />

            {/* Ingredients sections */}

            <div className="flex flex-col gap-8 p-8 border-b border-border">
                <p className="font-medium">Ingredients</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                    {/* Meat and Bone Section */}
                    <div className="flex flex-col gap-6">
                        <BadgeStack
                            variant="meat"
                            icon={<Bone />}
                            label="Meat and bone"
                            sublabel={(() => {
                                const dog = dogs.find(
                                    (d) => d.dog_id === localRecipe.dog_id
                                );
                                if (!dog) return "Unknown";
                                const grams = getCategoryGrams(
                                    dog,
                                    dog.ratios_muscle_meat
                                );
                                return (
                                    <>
                                        {grams}g{" "}
                                        <span className="text-muted-foreground">
                                            /{" "}
                                            {Math.round(
                                                dog.ratios_muscle_meat * 100
                                            )}
                                            %
                                        </span>
                                    </>
                                );
                            })()}
                        />
                        <div
                            className={
                                getIngredientsByCategory(
                                    localRecipe.recipe_ingredients,
                                    1
                                ).length > 0
                                    ? "border-t"
                                    : ""
                            }
                        >
                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                1
                            ).map((item) => (
                                <div
                                    key={item.ingredient_id}
                                    className="flex items-center justify-between border-b py-4"
                                >
                                    <span>
                                        {item.ingredients?.ingredient_name}
                                    </span>
                                    {/* <span className="text-muted-foreground">
                                        {Math.round(
                                            item.quantity * (batchSize * 1000)
                                        )}
                                        g
                                    </span> */}
                                </div>
                            ))}

                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                1
                            ).length === 0 && (
                                <div className="flex flex-col h-52 items-center justify-center rounded-md border border-border p-8 text-center animate-in fade-in-50">
                                    <p className="text-sm text-muted-foreground">
                                        No ingredients added to this category.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Plant Matter Section */}
                    <div className="flex flex-col gap-6">
                        <BadgeStack
                            variant="plant"
                            icon={<Leaf />}
                            label="Plant matter"
                            sublabel={(() => {
                                const dog = dogs.find(
                                    (d) => d.dog_id === localRecipe.dog_id
                                );
                                if (!dog) return "Unknown";
                                const grams = getCategoryGrams(
                                    dog,
                                    dog.ratios_plant_matter
                                );
                                return (
                                    <>
                                        {grams}g{" "}
                                        <span className="text-muted-foreground">
                                            /{" "}
                                            {Math.round(
                                                dog.ratios_plant_matter * 100
                                            )}
                                            %
                                        </span>
                                    </>
                                );
                            })()}
                        />
                        <div
                            className={
                                getIngredientsByCategory(
                                    localRecipe.recipe_ingredients,
                                    2
                                ).length > 0
                                    ? "border-t"
                                    : ""
                            }
                        >
                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                2
                            ).map((item) => (
                                <div
                                    key={item.ingredient_id}
                                    className="flex items-center justify-between border-b py-4"
                                >
                                    <span>
                                        {item.ingredients?.ingredient_name}
                                    </span>
                                    {/* <span className="text-muted-foreground">
                                        {Math.round(
                                            item.quantity * (batchSize * 1000)
                                        )}
                                        g
                                    </span> */}
                                </div>
                            ))}

                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                2
                            ).length === 0 && (
                                <div className="flex flex-col h-52 items-center justify-center rounded-md border border-border p-8 text-center animate-in fade-in-50">
                                    <p className="text-sm text-muted-foreground">
                                        No ingredients added to this category.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Liver Section */}
                    <div className="flex flex-col gap-6">
                        <BadgeStack
                            variant="liver"
                            icon={<Heart />}
                            label="Liver"
                            sublabel={(() => {
                                const dog = dogs.find(
                                    (d) => d.dog_id === localRecipe.dog_id
                                );
                                if (!dog) return "Unknown";
                                const grams = getCategoryGrams(
                                    dog,
                                    dog.ratios_liver
                                );
                                return (
                                    <>
                                        {grams}g{" "}
                                        <span className="text-muted-foreground">
                                            /{" "}
                                            {Math.round(dog.ratios_liver * 100)}
                                            %
                                        </span>
                                    </>
                                );
                            })()}
                        />
                        <div
                            className={
                                getIngredientsByCategory(
                                    localRecipe.recipe_ingredients,
                                    3
                                ).length > 0
                                    ? "border-t"
                                    : ""
                            }
                        >
                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                3
                            ).map((item) => (
                                <div
                                    key={item.ingredient_id}
                                    className="flex items-center justify-between border-b py-4"
                                >
                                    <span>
                                        {item.ingredients?.ingredient_name}
                                    </span>
                                    {/* <span className="text-muted-foreground">
                                        {Math.round(
                                            item.quantity * (batchSize * 1000)
                                        )}
                                        g
                                    </span> */}
                                </div>
                            ))}

                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                3
                            ).length === 0 && (
                                <div className="flex flex-col h-52 items-center justify-center rounded-md border border-border p-8 text-center animate-in fade-in-50">
                                    <p className="text-sm text-muted-foreground">
                                        No ingredients added to this category.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Secreting Organs Section */}
                    <div className="flex flex-col gap-6">
                        <BadgeStack
                            variant="organ"
                            icon={<Brain />}
                            label="Secreting organs"
                            sublabel={(() => {
                                const dog = dogs.find(
                                    (d) => d.dog_id === localRecipe.dog_id
                                );
                                if (!dog) return "Unknown";
                                const grams = getCategoryGrams(
                                    dog,
                                    dog.ratios_secreting_organ
                                );
                                return (
                                    <>
                                        {grams}g{" "}
                                        <span className="text-muted-foreground">
                                            /{" "}
                                            {Math.round(
                                                dog.ratios_secreting_organ * 100
                                            )}
                                            %
                                        </span>
                                    </>
                                );
                            })()}
                        />
                        <div
                            className={
                                getIngredientsByCategory(
                                    localRecipe.recipe_ingredients,
                                    4
                                ).length > 0
                                    ? "border-t"
                                    : ""
                            }
                        >
                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                4
                            ).map((item) => (
                                <div
                                    key={item.ingredient_id}
                                    className="flex items-center justify-between border-b py-4"
                                >
                                    <span>
                                        {item.ingredients?.ingredient_name}
                                    </span>
                                    {/* <span className="text-muted-foreground">
                                        {Math.round(
                                            item.quantity * (batchSize * 1000)
                                        )}
                                        g
                                    </span> */}
                                </div>
                            ))}

                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                4
                            ).length === 0 && (
                                <div className="flex flex-col h-52 items-center justify-center rounded-md border border-border p-8 text-center animate-in fade-in-50">
                                    <p className="text-sm text-muted-foreground">
                                        No ingredients added to this category.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Miscellaneous Section */}
                    <div className="flex flex-col gap-6 md:col-span-2">
                        <BadgeStack
                            icon={<Pill />}
                            label="Other ingredients"
                            sublabel="Toppers, dairy, herbs, etc"
                        />
                        <div
                            className={
                                getIngredientsByCategory(
                                    localRecipe.recipe_ingredients,
                                    5
                                ).length > 0
                                    ? "border-t"
                                    : ""
                            }
                        >
                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                5
                            ).map((item) => (
                                <div
                                    key={item.ingredient_id}
                                    className="flex items-center justify-between border-b py-4"
                                >
                                    <span>
                                        {item.ingredients?.ingredient_name}
                                    </span>
                                    {/* <span className="text-muted-foreground">
                                        {Math.round(
                                            item.quantity * (batchSize * 1000)
                                        )}
                                        g
                                    </span> */}
                                </div>
                            ))}

                            {getIngredientsByCategory(
                                localRecipe.recipe_ingredients,
                                5
                            ).length === 0 && (
                                <div className="flex flex-col h-52 items-center justify-center rounded-md border border-border p-8 text-center animate-in fade-in-50">
                                    <p className="text-sm text-muted-foreground">
                                        No ingredients added to this category.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 p-8 border-b border-border">
                <p className="font-medium">Nutrition status</p>
                <div className="flex gap-8">
                    <NutrientGroupAlert
                        recipeIngredients={recipe.recipe_ingredients}
                        mode="view"
                        nutrientState={nutrientState}
                        isChecking={checkingNutrients}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-6 p-8">
                <div className="flex items-center justify-between">
                    <p className="font-medium">Recipe notes</p>
                    <span className="text-sm text-muted-foreground">
                        {saveStatus === "saving" && "Saving..."}
                        {saveStatus === "saved" && "Saved"}
                        {saveStatus === "error" && "Error saving"}
                        {/* {saveStatus === "idle" && "Notes auto save"}
                        {saveStatus === "typing" && "Notes auto save"} */}
                    </span>
                </div>
                <div className="flex gap-8 w-full">
                    <Textarea
                        placeholder="Add notes about this recipe..."
                        className="rounded-sm px-4 py-3 min-h-[100px] h-auto resize-none overflow-hidden w-full"
                        ref={textareaRef}
                        value={notes}
                        onChange={handleNotesChange}
                    />
                </div>
            </div>
        </>
    );
}
