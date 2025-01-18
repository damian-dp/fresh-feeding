import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./auth-provider";

const DogsContext = createContext({});

export function DogsProvider({ children }) {
    const { session, isAuthenticated } = useAuth();
    const [dogs, setDogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDogs = async () => {
            try {
                if (!isAuthenticated || !session?.user?.id) {
                    setDogs([]);
                    return;
                }

                const { data, error } = await supabase
                    .from("dogs")
                    .select("*")
                    .eq("profile_id", session.user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                console.log("Dogs loaded:", data);
                setDogs(data);
            } catch (error) {
                console.error("Error loading dogs:", error);
                setDogs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDogs();

        // Subscribe to dogs changes
        const channel = supabase
            .channel(`dogs:${session?.user?.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "dogs",
                    filter: `profile_id=eq.${session?.user?.id}`,
                },
                (payload) => {
                    console.log("Dogs changed:", payload);
                    if (payload.eventType === "DELETE") {
                        setDogs((prev) =>
                            prev.filter(
                                (dog) => dog.dog_id !== payload.old.dog_id
                            )
                        );
                    } else if (payload.eventType === "INSERT") {
                        setDogs((prev) => [...prev, payload.new]);
                    } else if (payload.eventType === "UPDATE") {
                        setDogs((prev) =>
                            prev.map((dog) =>
                                dog.dog_id === payload.new.dog_id
                                    ? payload.new
                                    : dog
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

    const addDog = async (dogData) => {
        try {
            const { data, error } = await supabase
                .from("dogs")
                .insert([{ ...dogData, profile_id: session.user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error adding dog:", error);
            throw error;
        }
    };

    const updateDog = async (dogId, updates) => {
        try {
            const { data, error } = await supabase
                .from("dogs")
                .update(updates)
                .eq("dog_id", dogId)
                .eq("profile_id", session.user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error updating dog:", error);
            throw error;
        }
    };

    const deleteDog = async (dogId) => {
        try {
            const { error } = await supabase
                .from("dogs")
                .delete()
                .eq("dog_id", dogId)
                .eq("profile_id", session.user.id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error deleting dog:", error);
            throw error;
        }
    };

    const value = {
        dogs,
        loading,
        addDog,
        updateDog,
        deleteDog,
    };

    return (
        <DogsContext.Provider value={value}>{children}</DogsContext.Provider>
    );
}

export const useDogs = () => {
    const context = useContext(DogsContext);
    if (!context) {
        throw new Error("useDogs must be used within a DogsProvider");
    }
    return context;
};
