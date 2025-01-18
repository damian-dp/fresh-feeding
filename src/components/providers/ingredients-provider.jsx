import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const IngredientsContext = createContext({});

export function IngredientsProvider({ children }) {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const { data, error } = await supabase
                    .from("ingredients")
                    .select(
                        `
                        *,
                        ingredients_nutrients!inner (
                            has_nutrient,
                            nutrients (
                                nutrient_id,
                                nutrient_basic_name,
                                nutrient_scientific_name,
                                nutrient_group
                            )
                        ),
                        categories (
                            category_name
                        )
                    `
                    )
                    .order("ingredient_name");

                if (error) throw error;

                // Transform the data to match our component's expected format
                const transformedData = data.map((ingredient) => {
                    return {
                        id: ingredient.ingredient_id,
                        name: ingredient.ingredient_name,
                        category:
                            ingredient.categories?.category_name ||
                            "Uncategorized",
                        description: ingredient.ingredient_description,
                        bone_percentage: ingredient.bone_percentage,
                        thumbnail_image: ingredient.thumbnail_image,
                        highlights: ingredient.highlights || "",
                        nutrients: ingredient.ingredients_nutrients
                            .filter((in_) => in_.has_nutrient)
                            .map((in_) => ({
                                id: in_.nutrients.nutrient_id,
                                name: in_.nutrients.nutrient_basic_name,
                                scientific_name:
                                    in_.nutrients.nutrient_scientific_name,
                                group: in_.nutrients.nutrient_group,
                            })),
                    };
                });

                setIngredients(transformedData);
            } catch (error) {
                setIngredients([]);
            } finally {
                setLoading(false);
            }
        };

        fetchIngredients();

        // Subscribe to ingredients changes
        const channel = supabase
            .channel("ingredients_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "ingredients",
                },
                (payload) => {
                    console.log("Ingredients changed:", payload);
                    // Refetch all ingredients when any change occurs
                    fetchIngredients();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const value = {
        ingredients,
        loading,
    };

    return (
        <IngredientsContext.Provider value={value}>
            {children}
        </IngredientsContext.Provider>
    );
}

export const useIngredients = () => {
    const context = useContext(IngredientsContext);
    if (!context) {
        throw new Error(
            "useIngredients must be used within an IngredientsProvider"
        );
    }
    return context;
};
