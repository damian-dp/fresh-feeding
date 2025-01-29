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

                // console.log("Recipes loaded:", data);
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
                async (payload) => {
                    // console.log("Recipes changed:", payload);
                    if (payload.eventType === "DELETE") {
                        setRecipes((prev) =>
                            prev.filter(
                                (recipe) =>
                                    recipe.recipe_id !== payload.old.recipe_id
                            )
                        );
                    } else if (payload.eventType === "INSERT") {
                        // For INSERT, wait a brief moment to ensure ingredients are inserted
                        await new Promise((resolve) =>
                            setTimeout(resolve, 100)
                        );
                        const newRecipe = await fetchRecipeById(
                            payload.new.recipe_id
                        );
                        // Only add if it doesn't already exist
                        setRecipes((prev) => {
                            const exists = prev.some(
                                (r) => r.recipe_id === newRecipe.recipe_id
                            );
                            if (!exists) {
                                return [newRecipe, ...prev];
                            }
                            return prev;
                        });
                    } else if (payload.eventType === "UPDATE") {
                        const updatedRecipe = await fetchRecipeById(
                            payload.new.recipe_id
                        );
                        setRecipes((prev) =>
                            prev.map((recipe) =>
                                recipe.recipe_id === updatedRecipe.recipe_id
                                    ? updatedRecipe
                                    : recipe
                            )
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user?.id, isAuthenticated]);

    const fetchRecipeById = async (recipeId) => {
        console.log("Fetching recipe by ID:", recipeId);
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

            if (error) {
                console.error("Error fetching recipe:", error);
                throw error;
            }

            if (!data) {
                console.error("No recipe found with ID:", recipeId);
                throw new Error("Recipe not found");
            }

            // console.log("Fetched recipe:", data);

            // Update recipes state with the fetched recipe
            setRecipes((prev) => {
                const index = prev.findIndex((r) => r.recipe_id === recipeId);
                if (index >= 0) {
                    const newRecipes = [...prev];
                    newRecipes[index] = data;
                    return newRecipes;
                }
                return [...prev, data];
            });

            return data;
        } catch (error) {
            console.error("Error in fetchRecipeById:", error);
            throw error;
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

            // Instead of immediately updating the state, let the subscription handle it
            // The subscription will trigger fetchRecipeById which will update the state
            return recipe;
        } catch (error) {
            console.error("Error adding recipe:", error);
            throw error;
        }
    };
    // Console

    const updateRecipe = async (recipeId, recipeData, ingredients) => {
        // console.log("RecipesProvider: Starting updateRecipe...");
        try {
            // Update recipe details
            const { error: recipeError } = await supabase
                .from("recipes")
                .update(recipeData)
                .eq("recipe_id", recipeId);

            if (recipeError) throw recipeError;

            // Only modify ingredients if they're provided
            if (ingredients) {
                // Delete existing recipe ingredients
                const { error: deleteError } = await supabase
                    .from("recipe_ingredients")
                    .delete()
                    .eq("recipe_id", recipeId);

                if (deleteError) throw deleteError;

                // Insert new recipe ingredients if array isn't empty
                if (ingredients.length > 0) {
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

            // Update the recipes state with the new data
            setRecipes((prev) => {
                const index = prev.findIndex((r) => r.recipe_id === recipeId);
                if (index >= 0) {
                    const newRecipes = [...prev];
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
    // useEffect(() => {
    //     console.log("Recipes state updated:", recipes);
    // }, [recipes]);

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
