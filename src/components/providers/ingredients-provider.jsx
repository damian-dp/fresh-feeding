import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "./user-provider";

const IngredientsContext = createContext({});

export function IngredientsProvider({ children }) {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const { profile } = useUser();

    // Separate effect for initial data fetch
    useEffect(() => {
        async function fetchIngredients() {
            try {
                const { data, error } = await supabase.from("ingredients")
                    .select(`
                        ingredient_id,
                        ingredient_name,
                        category_id,
                        ingredient_description,
                        bone_percent,
                        thumbnail_url,
                        highlights,
                        nutrients:ingredients_nutrients(
                            nutrient:nutrients(
                                nutrient_id,
                                nutrient_basic_name,
                                nutrient_scientific_name,
                                nutrient_group
                            )
                        )
                    `);

                if (error) throw error;

                // Transform the data to match the expected format
                const transformedData =
                    data?.map((ingredient) => ({
                        id: ingredient.ingredient_id,
                        name: ingredient.ingredient_name,
                        description: ingredient.ingredient_description,
                        category: ingredient.category_id,
                        bone_percent: ingredient.bone_percent,
                        thumbnail_image: ingredient.thumbnail_url,
                        highlights: ingredient.highlights,
                        nutrients: ingredient.nutrients.map((n) => ({
                            id: n.nutrient.nutrient_id,
                            name: n.nutrient.nutrient_basic_name,
                            scientific_name:
                                n.nutrient.nutrient_scientific_name,
                            group: n.nutrient.nutrient_group,
                        })),
                    })) || [];

                setIngredients(transformedData);
            } catch (error) {
                console.error("Error fetching ingredients:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchIngredients();
    }, []);

    // Update subscription to match the transformed data structure
    useEffect(() => {
        const channel = supabase
            .channel("ingredients_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "ingredients",
                },
                async (payload) => {
                    console.log("Ingredients changed:", payload);
                    // Refetch all data when there's a change since we need the relations
                    const { data, error } = await supabase.from("ingredients")
                        .select(`
                            ingredient_id,
                            ingredient_name,
                            category_id,
                            ingredient_description,
                            bone_percent,
                            thumbnail_url,
                            highlights,
                            nutrients:ingredients_nutrients(
                                nutrient:nutrients(
                                    nutrient_id,
                                    nutrient_basic_name,
                                    nutrient_scientific_name,
                                    nutrient_group
                                )
                            )
                        `);

                    if (error) {
                        console.error("Error refetching ingredients:", error);
                        return;
                    }

                    const transformedData =
                        data?.map((ingredient) => ({
                            id: ingredient.ingredient_id,
                            name: ingredient.ingredient_name,
                            description: ingredient.ingredient_description,
                            category: ingredient.category_id,
                            bone_percent: ingredient.bone_percent,
                            thumbnail_image: ingredient.thumbnail_url,
                            highlights: ingredient.highlights,
                            nutrients: ingredient.nutrients.map((n) => ({
                                id: n.nutrient.nutrient_id,
                                name: n.nutrient.nutrient_basic_name,
                                scientific_name:
                                    n.nutrient.nutrient_scientific_name,
                                group: n.nutrient.nutrient_group,
                            })),
                        })) || [];

                    setIngredients(transformedData);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <IngredientsContext.Provider value={{ ingredients, loading }}>
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
