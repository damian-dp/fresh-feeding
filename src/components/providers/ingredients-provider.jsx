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
                const { data, error } = await supabase
                    .from("ingredients")
                    .select("*");

                if (error) throw error;
                setIngredients(data || []);
            } catch (error) {
                console.error("Error fetching ingredients:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchIngredients();
    }, []);

    // Separate effect for subscription
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
                (payload) => {
                    console.log("Ingredients changed:", payload);
                    // Update ingredients directly based on the change
                    if (payload.eventType === "INSERT") {
                        setIngredients((prev) => [...prev, payload.new]);
                    } else if (payload.eventType === "DELETE") {
                        setIngredients((prev) =>
                            prev.filter((item) => item.id !== payload.old.id)
                        );
                    } else if (payload.eventType === "UPDATE") {
                        setIngredients((prev) =>
                            prev.map((item) =>
                                item.id === payload.new.id ? payload.new : item
                            )
                        );
                    }
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
