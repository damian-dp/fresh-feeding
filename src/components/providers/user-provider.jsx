import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./auth-provider";

const UserContext = createContext({});

export function UserProvider({ children }) {
    const { session, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!isAuthenticated || !session?.user?.id) {
                    setProfile(null);
                    return;
                }

                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("profile_id", session.user.id)
                    .single();

                if (error) throw error;

                console.log("Profile loaded:", data);
                setProfile({
                    ...data,
                    name:
                        data.name ||
                        session.user.user_metadata?.full_name ||
                        "there",
                    new_user: data.new_user ?? true,
                });
            } catch (error) {
                console.error("Error loading profile:", error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        // Subscribe to profile changes
        const channel = supabase
            .channel(`profile:${session?.user?.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "profiles",
                    filter: `profile_id=eq.${session?.user?.id}`,
                },
                (payload) => {
                    console.log("Profile changed:", payload);
                    setProfile({
                        ...payload.new,
                        name:
                            payload.new.name ||
                            session.user.user_metadata?.full_name ||
                            "there",
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user?.id, isAuthenticated]);

    const updateProfile = async (updates) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("profile_id", session.user.id)
                .select()
                .single();

            if (error) throw error;
            setProfile({
                ...data,
                name:
                    data.name ||
                    session.user.user_metadata?.full_name ||
                    "there",
            });
            return data;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const completeOnboarding = async () => {
        return await updateProfile({ new_user: false });
    };

    const value = {
        profile,
        loading,
        updateProfile,
        completeOnboarding,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
