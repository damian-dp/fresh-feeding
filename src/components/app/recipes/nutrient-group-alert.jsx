import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertCircle,
    AlertTriangle,
    CheckCheck,
    CheckCircle2,
    Circle,
    Plus,
    Loader2,
    ChevronUp,
    ChevronDown,
    CircleCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const NUTRIENT_GROUPS = [
    "Fat Soluble Vitamins (Micro-nutrients)",
    "Water Soluble Vitamins (Micro-nutrients)",
    "Major Minerals",
    "Trace Minerals",
    "Essential Fatty Acids",
    "Essential Amino Acids",
    "Non-Essential Amino Acids",
];

// Combined function that returns both detailed info and simple boolean
async function checkRecipeBalance(recipeIngredients, mode = "view") {
    if (!recipeIngredients?.length) {
        return {
            isBalanced: false,
            missingCategories: [
                "Missing a source of muscle meat",
                "Missing a source of bone",
                "Missing a source of plant matter",
                "Missing a source of liver",
                "Missing a source of secreting organs",
            ],
            missingNutrients: [],
            nutrientSuggestions: {},
        };
    }

    try {
        // Check categories first
        const missingCategories = [];
        const categories = new Set(
            recipeIngredients.map((ri) => {
                if (mode === "view" || mode === "edit") {
                    return ri.ingredients?.category_id;
                }
                return ri.category;
            })
        );

        // Check for meat (category 1)
        if (!categories.has(1)) {
            missingCategories.push("Missing a source of muscle meat");
        }

        // Check for bone content
        const hasBone = recipeIngredients.some((ri) => {
            const ingredient = mode === "create" ? ri : ri.ingredients;
            return ingredient?.bone_percent > 0;
        });
        if (!hasBone) {
            missingCategories.push("Missing a source of bone");
        }

        // Check other categories
        if (!categories.has(2))
            missingCategories.push("Missing a source of plant matter");
        if (!categories.has(3))
            missingCategories.push("Missing a source of liver");
        if (!categories.has(4))
            missingCategories.push("Missing a source of secreting organs");

        // Get all ingredient IDs
        const ingredientIds = recipeIngredients
            .map((ri) => {
                if (mode === "view") return ri.ingredient_id;
                if (mode === "edit")
                    return ri.ingredient_id || ri.ingredients?.ingredient_id;
                return ri.id;
            })
            .filter(Boolean);

        // Get all nutrients in a single query
        const { data: nutrients } = await supabase
            .from("nutrients")
            .select("*")
            .order("nutrient_basic_name");

        // Get present nutrients in a single query
        const { data: ingredientNutrients } = await supabase
            .from("ingredients_nutrients")
            .select("nutrient_id")
            .in("ingredient_id", ingredientIds)
            .eq("has_nutrient", true);

        const presentNutrients = new Set(
            ingredientNutrients.map((item) => item.nutrient_id)
        );

        // Find missing nutrients
        const missingNutrients = nutrients.filter(
            (nutrient) =>
                !presentNutrients.has(nutrient.nutrient_id) &&
                nutrient.nutrient_scientific_name // Only include if scientific name exists
        );

        // Get all suggestions in a single query
        const { data: allSuggestions } = await supabase
            .from("ingredients_nutrients")
            .select(
                `
                nutrient_id,
                ingredients!inner (
                    ingredient_id,
                    ingredient_name,
                    category_id,
                    bone_percent
                )
            `
            )
            .in(
                "nutrient_id",
                missingNutrients.map((n) => n.nutrient_id)
            )
            .eq("has_nutrient", true);

        // Organize suggestions by nutrient
        const nutrientSuggestions = {};
        allSuggestions.forEach((suggestion) => {
            if (!nutrientSuggestions[suggestion.nutrient_id]) {
                nutrientSuggestions[suggestion.nutrient_id] = [];
            }
            nutrientSuggestions[suggestion.nutrient_id].push(
                suggestion.ingredients
            );
        });

        return {
            isBalanced:
                missingCategories.length === 0 && missingNutrients.length === 0,
            missingCategories,
            missingNutrients: missingNutrients.map((nutrient) => ({
                id: nutrient.nutrient_id,
                basic_name: nutrient.nutrient_basic_name,
                scientific_name: nutrient.nutrient_scientific_name || "",
            })),
            nutrientSuggestions,
        };
    } catch (error) {
        console.error("Error checking recipe balance:", error);
        throw error;
    }
}

// Add this base wrapper class to all alert containers
const alertWrapperClass =
    "transition-all duration-300 ease-in-out overflow-hidden";

// Add these animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
};

const alertVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        height: 0,
    },
    visible: {
        opacity: 1,
        y: 0,
        height: "auto",
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: {
            duration: 0.2,
        },
    },
};

// Add a separate variant for loading state
const loadingVariants = {
    visible: {
        opacity: 1,
        height: "auto",
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: {
            duration: 0.2,
        },
    },
};

// Add this animation variant
const expandVariants = {
    hidden: {
        height: 0,
        opacity: 0,
        transition: { duration: 0.2 },
    },
    visible: {
        height: "auto",
        opacity: 1,
        transition: { duration: 0.2 },
    },
};

export function NutrientGroupAlert({
    recipeIngredients,
    mode = "view",
    onAddIngredient,
    nutrientState,
    isChecking,
}) {
    const [loadingIngredients, setLoadingIngredients] = useState(new Set());
    const [addedIngredients, setAddedIngredients] = useState(new Set());
    const [expandedNutrientId, setExpandedNutrientId] = useState(null);
    const INITIAL_INGREDIENTS_SHOWN = 5;
    const [mouseInAlert, setMouseInAlert] = useState({});
    const [collapseTimeouts, setCollapseTimeouts] = useState({});
    const [satisfiedInSession, setSatisfiedInSession] = useState(new Set());

    // Reset addedIngredients when nutrientState changes or recipe ingredients change
    useEffect(() => {
        // Create a Set of all current recipe ingredient IDs
        const currentIngredientIds = new Set(
            recipeIngredients?.map((ri) =>
                mode === "create" ? ri.id : ri.ingredient_id
            ) || []
        );

        // Reset addedIngredients to only include ingredients that are still in the recipe
        setAddedIngredients((prev) => {
            const next = new Set();
            prev.forEach((id) => {
                if (currentIngredientIds.has(id)) {
                    next.add(id);
                }
            });
            return next;
        });
    }, [recipeIngredients, nutrientState, mode]);

    // When an alert turns green (requirement met), add it to satisfiedInSession
    useEffect(() => {
        if (!nutrientState?.missingCategories) return;

        // Get all possible categories
        const allCategories = [
            "Missing a source of muscle meat",
            "Missing a source of bone",
            "Missing a source of liver",
            "Missing a source of secreting organs",
            "Missing a source of plant matter",
        ];

        // Find which categories are now satisfied
        const currentlySatisfied = allCategories.filter(
            (cat) => !nutrientState.missingCategories.includes(cat)
        );

        // Add newly satisfied categories to our session tracking
        setSatisfiedInSession((prev) => {
            const next = new Set(prev);
            currentlySatisfied.forEach((cat) => next.add(cat));
            return next;
        });
    }, [nutrientState?.missingCategories]);

    // Update the shouldShowAlert function to handle both categories and nutrients
    const shouldShowAlert = (item, type = "category") => {
        if (mode !== "edit") return true;

        if (type === "category") {
            // If it's currently missing, always show it
            if (nutrientState?.missingCategories?.includes(item)) return true;

            // If it was satisfied during this session, show it
            return satisfiedInSession.has(item);
        } else {
            // For nutrients, always show them if they're missing
            return true;
        }
    };

    const handleDelayedCollapse = (nutrientId) => {
        // Clear any existing timeout for this nutrient
        if (collapseTimeouts[nutrientId]) {
            clearTimeout(collapseTimeouts[nutrientId]);
        }

        // Set new timeout
        const timeoutId = setTimeout(() => {
            if (!mouseInAlert[nutrientId]) {
                setExpandedNutrientId(null);
                // Clear the timeout reference
                setCollapseTimeouts((prev) => ({
                    ...prev,
                    [nutrientId]: null,
                }));
            }
        }, 2000); // 2 seconds delay

        // Store the timeout ID
        setCollapseTimeouts((prev) => ({
            ...prev,
            [nutrientId]: timeoutId,
        }));
    };

    // Add this function to handle adding ingredients
    const handleAddIngredient = async (ingredient) => {
        // Track loading state
        setLoadingIngredients(
            (prev) => new Set([...prev, ingredient.ingredient_id])
        );

        try {
            // Call the parent's onAddIngredient
            await onAddIngredient(ingredient);

            // Update local state to mark this ingredient as added
            setAddedIngredients(
                (prev) => new Set([...prev, ingredient.ingredient_id])
            );
        } catch (error) {
            console.error("Error adding ingredient:", error);
        } finally {
            // Clear loading state
            setLoadingIngredients((prev) => {
                const next = new Set(prev);
                next.delete(ingredient.ingredient_id);
                return next;
            });
        }
    };

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(collapseTimeouts).forEach((timeoutId) => {
                if (timeoutId) clearTimeout(timeoutId);
            });
        };
    }, [collapseTimeouts]);

    // Add this function to check if an ingredient is added
    const isIngredientAdded = (ingredient) => {
        const ingredientId = ingredient.ingredient_id || ingredient.id;
        return nutrientState?.addedIngredients?.[ingredientId] || false;
    };

    // Update the ingredient rendering in the alert
    const renderIngredient = (ingredient, nutrient) => {
        const ingredientId = ingredient.ingredient_id || ingredient.id;

        // Check if ingredient exists in current recipe
        const isInRecipe = recipeIngredients?.some((ri) => {
            const riId = mode === "create" ? ri.id : ri.ingredient_id;
            return riId === ingredientId;
        });

        // Only use addedIngredients for temporary state during add operation
        const isAdded = isInRecipe || addedIngredients.has(ingredientId);

        return (
            <div
                key={`${ingredientId}-${ingredient.ingredient_name}`}
                className="flex items-center justify-between gap-2"
            >
                <span className="text-base">{ingredient.ingredient_name}</span>
                {!isAdded ? (
                    <Button
                        variant={
                            isNutrientAddressed(nutrient)
                                ? "success"
                                : "warning"
                        }
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() => handleAddIngredient(ingredient)}
                        disabled={isAdded}
                    >
                        {loadingIngredients.has(ingredientId) ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Plus className="" />
                        )}
                    </Button>
                ) : (
                    <div className="flex items-center justify-center h-8 w-8 p-0">
                        <CheckCheck className="size-6" />
                    </div>
                )}
            </div>
        );
    };

    // Update how we render the suggestions
    const renderNutrientSuggestions = (nutrient) => {
        const suggestions =
            nutrientState?.nutrientSuggestions?.[nutrient.id] || [];

        return (
            <>
                {/* First 5 ingredients */}
                {suggestions
                    .slice(0, INITIAL_INGREDIENTS_SHOWN)
                    .map((ingredient) =>
                        renderIngredient(ingredient, nutrient)
                    )}

                {/* Additional ingredients with animation */}
                <AnimatePresence>
                    {expandedNutrientId === nutrient.id &&
                        suggestions.length > INITIAL_INGREDIENTS_SHOWN && (
                            <motion.div
                                key={`expanded-${nutrient.id}`}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={expandVariants}
                                className="overflow-hidden flex flex-col gap-2"
                            >
                                {suggestions
                                    .slice(INITIAL_INGREDIENTS_SHOWN)
                                    .map((ingredient) =>
                                        renderIngredient(ingredient, nutrient)
                                    )}
                            </motion.div>
                        )}
                </AnimatePresence>

                {/* Show more/less button */}
                {suggestions.length > INITIAL_INGREDIENTS_SHOWN && (
                    <Button
                        variant={
                            isNutrientAddressed(nutrient)
                                ? "success"
                                : "warning"
                        }
                        size=""
                        className="w-full mt-4"
                        onClick={() => {
                            setExpandedNutrientId(
                                expandedNutrientId === nutrient.id
                                    ? null
                                    : nutrient.id
                            );
                        }}
                    >
                        {expandedNutrientId === nutrient.id ? (
                            <>
                                <ChevronUp className="size-5" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="size-5" />
                                Show More
                            </>
                        )}
                    </Button>
                )}
            </>
        );
    };

    // In the NutrientGroupAlert component, update how we determine if a nutrient alert is addressed
    const isNutrientAddressed = (nutrient) => {
        const suggestions =
            nutrientState?.nutrientSuggestions?.[nutrient.id] || [];
        // Check if any of the suggested ingredients have been added
        return suggestions.some((suggestion) => {
            const suggestionId = suggestion.ingredient_id || suggestion.id;
            return nutrientState?.addedIngredients?.[suggestionId];
        });
    };

    // Show loading state until we have nutrient state
    if (isChecking || !nutrientState) {
        return (
            <Alert className="flex items-center">
                <AlertTitle className="flex items-center gap-3 mb-0">
                    <Loader2 className="size-5 animate-spin" />
                    Checking nutritional balance...
                </AlertTitle>
            </Alert>
        );
    }

    if (nutrientState.isBalanced) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full"
            >
                <motion.div
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    className="min-h-16"
                >
                    <Alert variant="success">
                        <CheckCircle2 className="" />
                        <div className="flex flex-col gap-2">
                            <AlertTitle>Your recipe is balanced</AlertTitle>
                            <AlertDescription>
                                All required nutrients and ingredient categories
                                are present.
                            </AlertDescription>
                        </div>
                    </Alert>
                </motion.div>
            </motion.div>
        );
    }

    // In view mode, show single alert with all missing items
    if (mode === "view") {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full"
            >
                <motion.div
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    className="min-h-16" // Add minimum height to prevent collapse
                >
                    {isChecking || !nutrientState ? (
                        <Alert className="flex items-center">
                            <AlertTitle className="flex items-center gap-3 mb-0">
                                <Loader2 className="size-5 animate-spin" />
                                Checking nutritional balance...
                            </AlertTitle>
                        </Alert>
                    ) : (
                        <Alert variant="warning" className="w-full">
                            <AlertCircle className="" />
                            <div className="flex flex-col gap-3">
                                <AlertTitle>
                                    Your recipe is missing some components
                                </AlertTitle>
                                <AlertDescription>
                                    <div className="flex flex-col gap-3">
                                        {nutrientState.missingCategories.map(
                                            (category) => (
                                                <div
                                                    key={category}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="h-1 w-1 rounded-full bg-current" />
                                                    <span>{category}</span>
                                                </div>
                                            )
                                        )}
                                        {nutrientState.missingNutrients.map(
                                            (nutrient) => (
                                                <div
                                                    key={nutrient.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="h-1 w-1 rounded-full bg-current" />
                                                    <span>
                                                        {nutrient.basic_name}
                                                        {nutrient.scientific_name &&
                                                            ` (${nutrient.scientific_name})`}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </AlertDescription>
                            </div>
                        </Alert>
                    )}
                </motion.div>
            </motion.div>
        );
    }

    // In edit mode, show separate alerts
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full"
        >
            {/* Categories alert stays full width at the top */}
            {nutrientState.missingCategories.length > 0 && (
                <motion.div
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full mb-4"
                >
                    <Alert variant="warning">
                        <AlertTriangle className="" />
                        <div className="flex flex-col gap-3">
                            <AlertTitle>
                                Missing ingredient categories
                            </AlertTitle>
                            <AlertDescription className="flex flex-col gap-2">
                                {nutrientState.missingCategories.map(
                                    (category) => (
                                        <div
                                            key={category}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="h-1 w-1 rounded-full bg-current" />
                                            <span>{category}</span>
                                        </div>
                                    )
                                )}
                            </AlertDescription>
                        </div>
                    </Alert>
                </motion.div>
            )}

            {/* Two column flex container for nutrient alerts */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Left column */}
                <div className="flex flex-col gap-4 w-full">
                    {nutrientState.missingNutrients
                        .filter((_, index) => index % 2 === 0)
                        .map((nutrient) => (
                            <motion.div
                                key={nutrient.id}
                                variants={alertVariants}
                                initial="hidden"
                                animate="visible"
                                className={`${
                                    nutrientState.missingNutrients.length === 1
                                        ? "col-span-full"
                                        : ""
                                }`}
                            >
                                <Alert
                                    variant={
                                        isNutrientAddressed(nutrient)
                                            ? "success"
                                            : "warning"
                                    }
                                    onMouseEnter={() => {
                                        setMouseInAlert((prev) => ({
                                            ...prev,
                                            [nutrient.id]: true,
                                        }));
                                        // Clear any pending collapse timeout
                                        if (collapseTimeouts[nutrient.id]) {
                                            clearTimeout(
                                                collapseTimeouts[nutrient.id]
                                            );
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        setMouseInAlert((prev) => ({
                                            ...prev,
                                            [nutrient.id]: false,
                                        }));
                                        // Start collapse timeout if ingredients were added and this alert is expanded
                                        if (
                                            addedIngredients.has(nutrient.id) &&
                                            expandedNutrientId === nutrient.id
                                        ) {
                                            handleDelayedCollapse(nutrient.id);
                                        }
                                    }}
                                >
                                    {isNutrientAddressed(nutrient) ? (
                                        <CircleCheck className="" />
                                    ) : (
                                        <AlertTriangle className="" />
                                    )}
                                    <div className="flex flex-col gap-1 w-full">
                                        <AlertTitle>
                                            {isNutrientAddressed(nutrient)
                                                ? `Added source of ${nutrient.basic_name}`
                                                : `Missing source of ${nutrient.basic_name}`}
                                        </AlertTitle>
                                        <AlertDescription>
                                            <p className="">
                                                {nutrient.basic_name}
                                                {nutrient.scientific_name &&
                                                    ` (${nutrient.scientific_name})`}
                                            </p>
                                            <div className="flex flex-col gap-2 mt-4">
                                                {renderNutrientSuggestions(
                                                    nutrient
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </div>
                                </Alert>
                            </motion.div>
                        ))}
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4 w-full">
                    {nutrientState.missingNutrients
                        .filter((_, index) => index % 2 === 1)
                        .map((nutrient) => (
                            <motion.div
                                key={nutrient.id}
                                variants={alertVariants}
                                initial="hidden"
                                animate="visible"
                                className={`${
                                    nutrientState.missingNutrients.length === 1
                                        ? "col-span-full"
                                        : ""
                                }`}
                            >
                                <Alert
                                    variant={
                                        isNutrientAddressed(nutrient)
                                            ? "success"
                                            : "warning"
                                    }
                                    onMouseEnter={() => {
                                        setMouseInAlert((prev) => ({
                                            ...prev,
                                            [nutrient.id]: true,
                                        }));
                                        // Clear any pending collapse timeout
                                        if (collapseTimeouts[nutrient.id]) {
                                            clearTimeout(
                                                collapseTimeouts[nutrient.id]
                                            );
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        setMouseInAlert((prev) => ({
                                            ...prev,
                                            [nutrient.id]: false,
                                        }));
                                        // Start collapse timeout if ingredients were added and this alert is expanded
                                        if (
                                            addedIngredients.has(nutrient.id) &&
                                            expandedNutrientId === nutrient.id
                                        ) {
                                            handleDelayedCollapse(nutrient.id);
                                        }
                                    }}
                                >
                                    {isNutrientAddressed(nutrient) ? (
                                        <CircleCheck className="" />
                                    ) : (
                                        <AlertTriangle className="" />
                                    )}
                                    <div className="flex flex-col gap-1 w-full">
                                        <AlertTitle>
                                            {isNutrientAddressed(nutrient)
                                                ? `Added source of ${nutrient.basic_name}`
                                                : `Missing source of ${nutrient.basic_name}`}
                                        </AlertTitle>
                                        <AlertDescription>
                                            <p className="">
                                                {nutrient.basic_name}
                                                {nutrient.scientific_name &&
                                                    ` (${nutrient.scientific_name})`}
                                            </p>
                                            <div className="flex flex-col gap-2 mt-4">
                                                {renderNutrientSuggestions(
                                                    nutrient
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </div>
                                </Alert>
                            </motion.div>
                        ))}
                </div>
            </div>
        </motion.div>
    );
}

// Add this function at the bottom of the file, just before the final export
export async function isRecipeBalanced(recipeIngredients, mode = "view") {
    try {
        const result = await checkRecipeBalance(recipeIngredients, mode);
        return result.isBalanced;
    } catch (error) {
        console.error("Error checking if recipe is balanced:", error);
        return false;
    }
}

// Keep the existing exports
export { checkRecipeBalance };
