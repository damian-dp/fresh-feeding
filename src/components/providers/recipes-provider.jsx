import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./auth-provider";

const RecipesContext = createContext({});

export function RecipesProvider({ children }) {
    const { session, isAuthenticated } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                if (!isAuthenticated || !session?.user?.id) {
                    setRecipes([]);
                    return;
                }

                const { data, error } = await supabase
                    .from("recipes")
                    .select(
                        `
                        *,
                        recipe_ingredients (
                            *,
                            ingredients (*)
                        )
                    `
                    )
                    .eq("profile_id", session.user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                console.log("Recipes loaded:", data);
                setRecipes(data);
            } catch (error) {
                console.error("Error loading recipes:", error);
                setRecipes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();

        // Subscribe to recipes changes
        const channel = supabase
            .channel(`recipes:${session?.user?.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "recipes",
                    filter: `profile_id=eq.${session?.user?.id}`,
                },
                (payload) => {
                    console.log("Recipes changed:", payload);
                    if (payload.eventType === "DELETE") {
                        setRecipes((prev) =>
                            prev.filter(
                                (recipe) =>
                                    recipe.recipe_id !== payload.old.recipe_id
                            )
                        );
                    } else {
                        // For INSERT and UPDATE, fetch the full recipe with ingredients
                        fetchRecipeById(payload.new.recipe_id);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user?.id, isAuthenticated]);

    const fetchRecipeById = async (recipeId) => {
        try {
            const { data, error } = await supabase
                .from("recipes")
                .select(
                    `
                    *,
                    recipe_ingredients (
                        *,
                        ingredients (*)
                    )
                `
                )
                .eq("recipe_id", recipeId)
                .single();

            if (error) throw error;

            setRecipes((prev) => {
                const index = prev.findIndex((r) => r.recipe_id === recipeId);
                if (index >= 0) {
                    const newRecipes = [...prev];
                    newRecipes[index] = data;
                    return newRecipes;
                }
                return [...prev, data];
            });
        } catch (error) {
            console.error("Error fetching recipe:", error);
        }
    };

    const addRecipe = async (recipeData, ingredients) => {
        try {
            // First insert the recipe
            const { data: recipe, error: recipeError } = await supabase
                .from("recipes")
                .insert([{ ...recipeData, profile_id: session.user.id }])
                .select()
                .single();

            if (recipeError) throw recipeError;

            // Then insert the ingredients
            if (ingredients?.length) {
                const { error: ingredientsError } = await supabase
                    .from("recipe_ingredients")
                    .insert(
                        ingredients.map((ing) => ({
                            recipe_id: recipe.recipe_id,
                            ingredient_id: ing.ingredient_id,
                            quantity: ing.quantity,
                        }))
                    );

                if (ingredientsError) throw ingredientsError;
            }

            // Fetch the complete recipe with ingredients
            const { data: completeRecipe, error: fetchError } = await supabase
                .from("recipes")
                .select(
                    `
                    *,
                    recipe_ingredients (
                        *,
                        ingredients (*)
                    )
                `
                )
                .eq("recipe_id", recipe.recipe_id)
                .single();

            if (fetchError) throw fetchError;

            // Update recipes state with the new recipe
            setRecipes((prev) => [...prev, completeRecipe]);

            return completeRecipe;
        } catch (error) {
            console.error("Error adding recipe:", error);
            throw error;
        }
    };

    const updateRecipe = async (recipeId, recipeData, ingredients) => {
        console.log("RecipesProvider: Starting updateRecipe...");
        try {
            // Update recipe details
            const { error: recipeError } = await supabase
                .from("recipes")
                .update(recipeData)
                .eq("recipe_id", recipeId);

            if (recipeError) throw recipeError;

            // Delete existing recipe ingredients
            const { error: deleteError } = await supabase
                .from("recipe_ingredients")
                .delete()
                .eq("recipe_id", recipeId);

            if (deleteError) throw deleteError;

            // Insert new recipe ingredients
            if (ingredients?.length) {
                const { error: ingredientsError } = await supabase
                    .from("recipe_ingredients")
                    .insert(
                        ingredients.map((ing) => ({
                            recipe_id: recipeId,
                            ingredient_id: ing.ingredient_id,
                            quantity: ing.quantity,
                        }))
                    );

                if (ingredientsError) throw ingredientsError;
            }

            // Fetch the updated recipe with all its data
            const { data: updatedRecipe, error: fetchError } = await supabase
                .from("recipes")
                .select(
                    `
                    *,
                    recipe_ingredients (
                        *,
                        ingredients (*)
                    )
                `
                )
                .eq("recipe_id", recipeId)
                .single();

            if (fetchError) throw fetchError;

            console.log("Fetched updated recipe:", updatedRecipe);
            console.log(
                "Updated recipe ingredients:",
                updatedRecipe.recipe_ingredients
            );

            // Update the recipes state with the new data
            setRecipes((prev) => {
                const index = prev.findIndex((r) => r.recipe_id === recipeId);
                if (index >= 0) {
                    const newRecipes = [...prev];
                    // Completely replace with updated recipe
                    newRecipes[index] = updatedRecipe;
                    return newRecipes;
                }
                return [...prev, updatedRecipe];
            });

            return updatedRecipe;
        } catch (error) {
            console.error("Error in updateRecipe:", error);
            return false;
        }
    };

    const deleteRecipe = async (recipeId) => {
        try {
            const { error } = await supabase
                .from("recipes")
                .delete()
                .eq("recipe_id", recipeId);

            if (error) throw error;

            setRecipes((prev) => prev.filter((r) => r.recipe_id !== recipeId));
            return true;
        } catch (error) {
            console.error("Error deleting recipe:", error);
            return false;
        }
    };

    const value = {
        recipes,
        loading,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        fetchRecipeById,
    };

    // Also add a useEffect to log recipes state changes
    useEffect(() => {
        console.log("Recipes state updated:", recipes);
    }, [recipes]);

    return (
        <RecipesContext.Provider value={value}>
            {children}
        </RecipesContext.Provider>
    );
}

export const useRecipes = () => {
    const context = useContext(RecipesContext);
    if (!context) {
        throw new Error("useRecipes must be used within a RecipesProvider");
    }
    return context;
};
