import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertCircle,
    AlertTriangle,
    CheckCheck,
    CheckCircle2,
    Circle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const NUTRIENT_GROUPS = [
    "Fat Soluble Vitamins (Micro-nutrients)",
    "Water Soluble Vitamins (Micro-nutrients)",
    "Major Minerals",
    "Trace Minerals",
    "Essential Fatty Acids",
    "Essential Amino Acids",
    "Non-Essential Amino Acids",
];

export async function checkRecipeBalance(recipeIngredients, mode = "view") {
    if (!recipeIngredients?.length) {
        return {
            isBalanced: false,
            missingGroups: NUTRIENT_GROUPS,
            missingCategories: [
                "Missing a source of muscle meat",
                "Missing a source of bone",
                "Missing a source of plant matter",
                "Missing a source of liver",
                "Missing a source of secreting organs",
            ],
        };
    }

    try {
        // Check for missing categories
        const categories = new Set(
            recipeIngredients.map((ri) => {
                if (mode === "view" || mode === "edit") {
                    return ri.ingredients?.category_id;
                }
                return ri.category;
            })
        );

        const missingCats = [];

        // Special handling for meat and bone category
        const meatAndBoneIngredients = recipeIngredients.filter((ri) => {
            const categoryId =
                mode === "create" ? ri.category : ri.ingredients?.category_id;
            return categoryId === 1;
        });

        if (meatAndBoneIngredients.length === 0) {
            missingCats.push("Missing a source of muscle meat");
            missingCats.push("Missing a source of bone");
        } else {
            const hasBone = meatAndBoneIngredients.some((ri) => {
                const ingredient = mode === "create" ? ri : ri.ingredients;
                return ingredient?.bone_percent > 0;
            });

            if (!hasBone) {
                missingCats.push("Missing a source of bone");
            }
        }

        // Check other categories
        if (!categories.has(2))
            missingCats.push("Missing a source of plant matter");
        if (!categories.has(3)) missingCats.push("Missing a source of liver");
        if (!categories.has(4))
            missingCats.push("Missing a source of secreting organs");

        // Get all ingredient IDs
        const ingredientIds = recipeIngredients
            .map((ri) => {
                if (mode === "view") return ri.ingredient_id;
                if (mode === "edit")
                    return ri.ingredient_id || ri.ingredients?.ingredient_id;
                return ri.id;
            })
            .filter(Boolean);

        if (ingredientIds.length === 0) {
            return {
                isBalanced: false,
                missingGroups: NUTRIENT_GROUPS,
                missingCategories: missingCats,
            };
        }

        // Get nutrients for ingredients
        const { data: ingredientNutrients, error } = await supabase
            .from("ingredients_nutrients")
            .select(
                `
                ingredient_id,
                nutrient_id,
                has_nutrient,
                nutrients!inner (
                    nutrient_id,
                    nutrient_group
                )
            `
            )
            .in("ingredient_id", ingredientIds)
            .eq("has_nutrient", true);

        if (error) throw error;

        // Get present nutrient groups
        const presentGroups = new Set(
            ingredientNutrients
                .filter((item) => item.has_nutrient)
                .map((item) => item.nutrients.nutrient_group)
        );

        // Find missing groups
        const missingGroups = NUTRIENT_GROUPS.filter(
            (group) => !presentGroups.has(group)
        );

        return {
            isBalanced: missingGroups.length === 0 && missingCats.length === 0,
            missingGroups,
            missingCategories: missingCats,
        };
    } catch (error) {
        console.error("Error checking recipe balance:", error);
        throw error;
    }
}

export function NutrientGroupAlert({ recipeIngredients, mode = "view" }) {
    const [missingGroups, setMissingGroups] = useState([]);
    const [missingCategories, setMissingCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkNutrientGroups = async () => {
            // console.log("Starting nutrient check with:", {
            //     mode,
            //     recipeIngredients,
            // });

            if (!recipeIngredients?.length) {
                // console.log("No recipe ingredients found");
                setMissingGroups(NUTRIENT_GROUPS);
                setMissingCategories([
                    "Missing a source of muscle meat",
                    "Missing a source of bone",
                    "Missing a source of plant matter",
                    "Missing a source of liver",
                    "Missing a source of secreting organs",
                ]);
                setLoading(false);
                return;
            }

            try {
                // Check for missing categories
                const categories = new Set(
                    recipeIngredients.map((ri) => {
                        if (mode === "view" || mode === "edit") {
                            return ri.ingredients?.category_id;
                        }
                        return ri.category;
                    })
                );

                const missingCats = [];

                // Special handling for meat and bone category
                const meatAndBoneIngredients = recipeIngredients.filter(
                    (ri) => {
                        const categoryId =
                            mode === "create"
                                ? ri.category
                                : ri.ingredients?.category_id;
                       
                        return categoryId === 1;
                    }
                );

                // console.log(
                //     "Meat and bone ingredients:",
                //     meatAndBoneIngredients
                // );

                if (meatAndBoneIngredients.length === 0) {
                    // console.log("No meat ingredients found");
                    missingCats.push("Missing a source of muscle meat");
                    missingCats.push("Missing a source of bone");
                } else {
                    const hasBone = meatAndBoneIngredients.some((ri) => {
                        const ingredient =
                            mode === "create" ? ri : ri.ingredients;
                        const bonePercent = ingredient?.bone_percent;
                        // console.log("Checking bone content:", {
                        //     mode,
                        //     ingredient,
                        //     bonePercent,
                        //     hasBone: bonePercent > 0,
                        // });
                        return bonePercent > 0;
                    });

                    if (!hasBone) {
                        console.log(
                            "No bone content found in meat ingredients"
                        );
                        missingCats.push("Missing a source of bone");
                    }
                }

                // Check other categories
                if (!categories.has(2))
                    missingCats.push("Missing a source of plant matter");
                if (!categories.has(3))
                    missingCats.push("Missing a source of liver");
                if (!categories.has(4))
                    missingCats.push("Missing a source of secreting organs");

                setMissingCategories(missingCats);

                // Get all ingredient IDs from the recipe
                const ingredientIds = recipeIngredients
                    .map((ri) => {
                        // console.log("Processing recipe ingredient:", ri);
                        if (mode === "view") {
                            return ri.ingredient_id;
                        }
                        if (mode === "edit") {
                            return (
                                ri.ingredient_id ||
                                ri.ingredients?.ingredient_id
                            );
                        }
                        // Create mode
                        return ri.id;
                    })
                    .filter(Boolean); // Remove any undefined values

                // console.log("Ingredient IDs to check:", ingredientIds);

                if (ingredientIds.length === 0) {
                    setMissingGroups(NUTRIENT_GROUPS);
                    setLoading(false);
                    return;
                }

                // First, get all nutrients for these ingredients with their groups
                const { data: ingredientNutrients, error } = await supabase
                    .from("ingredients_nutrients")
                    .select(
                        `
                        ingredient_id,
                        nutrient_id,
                        has_nutrient,
                        nutrients!inner (
                            nutrient_id,
                            nutrient_group
                        )
                    `
                    )
                    .in("ingredient_id", ingredientIds)
                    .eq("has_nutrient", true);

                if (error) {
                    console.error("Supabase query error:", error);
                    throw error;
                }

                // console.log(
                //     "Raw ingredient nutrients data:",
                //     ingredientNutrients
                // );

                // Get all unique nutrient groups present in the recipe
                const presentGroups = new Set(
                    ingredientNutrients
                        .filter((item) => item.has_nutrient)
                        .map((item) => item.nutrients.nutrient_group)
                );

                // console.log("Present nutrient groups:", [...presentGroups]);

                // Find missing groups
                const missing = NUTRIENT_GROUPS.filter(
                    (group) => !presentGroups.has(group)
                );

                // console.log("Missing nutrient groups:", missing);
                // console.log(
                //     "All nutrient groups for reference:",
                //     NUTRIENT_GROUPS
                // );

                setMissingGroups(missing);
            } catch (error) {
                console.error("Error checking nutrient groups:", error);
                setMissingGroups([]);
                setMissingCategories([]);
            } finally {
                setLoading(false);
            }
        };

        checkNutrientGroups();
    }, [recipeIngredients, mode]);

    if (loading) return null;

    if (missingGroups.length === 0 && missingCategories.length === 0) {
        return (
            <Alert variant="success">
                <CheckCheck />
                <AlertTitle>Your recipe seems balanced.</AlertTitle>
                <AlertDescription>
                    Based on the ingredients selected, your recipe is likely
                    balanced.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert variant="warning">
            <AlertTriangle />
            <AlertTitle>Your recipe may have gaps in its nutrition</AlertTitle>
            <AlertDescription>
                Click Edit recipe and add the recommended ingredients to resolve
                each of the following nutritional deficits:
                <div className="flex flex-col gap-2 mt-3">
                    {missingCategories.map((category) => (
                        <div key={category} className="flex items-center gap-3">
                            <Circle className="h-1 w-1 flex-shrink-0 fill-current" />
                            <span className="text-sm leading-relaxed">
                                {category}
                            </span>
                        </div>
                    ))}
                    {missingGroups.map((group) => (
                        <div key={group} className="flex items-center gap-3">
                            <Circle className="h-1 w-1 flex-shrink-0 fill-current" />
                            <span className="text-sm leading-relaxed">
                                {group}
                            </span>
                        </div>
                    ))}
                </div>
            </AlertDescription>
        </Alert>
    );
}

export async function isRecipeBalanced(recipeIngredients, mode = "view") {
    if (!recipeIngredients?.length) {
        return false;
    }

    try {
        // Check for missing categories
        const categories = new Set(
            recipeIngredients.map((ri) => {
                if (mode === "view" || mode === "edit") {
                    return ri.ingredients?.category_id;
                }
                return ri.category;
            })
        );

        // Check meat and bone
        const meatAndBoneIngredients = recipeIngredients.filter((ri) => {
            const categoryId =
                mode === "create" ? ri.category : ri.ingredients?.category_id;
            return categoryId === 1;
        });

        if (meatAndBoneIngredients.length === 0) {
            return false;
        }

        const hasBone = meatAndBoneIngredients.some((ri) => {
            const ingredient = mode === "create" ? ri : ri.ingredients;
            return ingredient?.bone_percent > 0;
        });

        if (!hasBone) {
            return false;
        }

        // Check other required categories
        if (!categories.has(2) || !categories.has(3) || !categories.has(4)) {
            return false;
        }

        // Check nutrient groups
        const ingredientIds = recipeIngredients
            .map((ri) => {
                if (mode === "view") return ri.ingredient_id;
                if (mode === "edit")
                    return ri.ingredient_id || ri.ingredients?.ingredient_id;
                return ri.id;
            })
            .filter(Boolean);

        if (ingredientIds.length === 0) {
            return false;
        }

        const { data: ingredientNutrients, error } = await supabase
            .from("ingredients_nutrients")
            .select(
                `
                ingredient_id,
                nutrient_id,
                has_nutrient,
                nutrients!inner (
                    nutrient_id,
                    nutrient_group
                )
            `
            )
            .in("ingredient_id", ingredientIds)
            .eq("has_nutrient", true);

        if (error) throw error;

        const presentGroups = new Set(
            ingredientNutrients
                .filter((item) => item.has_nutrient)
                .map((item) => item.nutrients.nutrient_group)
        );

        // Recipe is balanced if all nutrient groups are present
        return NUTRIENT_GROUPS.every((group) => presentGroups.has(group));
    } catch (error) {
        console.error("Error checking recipe balance:", error);
        return false;
    }
}
