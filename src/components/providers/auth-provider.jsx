import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const initializeAuth = async () => {
            try {
                // First check localStorage directly
                const storedSession = localStorage.getItem(
                    "sb-stjoiaqeuxfgvgkfkhhi-auth-token"
                );
                console.log("Stored session found:", !!storedSession);

                if (storedSession) {
                    // Parse the stored session
                    const parsedSession = JSON.parse(storedSession);
                    if (parsedSession?.user) {
                        // If we have a stored session with a user, use it immediately
                        setSession(parsedSession);
                        setLoading(false);
                    }
                }

                // Then verify with Supabase
                const {
                    data: { session: currentSession },
                    error,
                } = await supabase.auth.getSession();

                if (error) throw error;

                console.log("Session check:", {
                    hasSession: !!currentSession,
                    user: currentSession?.user?.email,
                });

                setSession(currentSession);
            } catch (error) {
                console.error("Auth initialization error:", error);
                setSession(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            console.log("Auth state changed:", _event, {
                hasSession: !!currentSession,
                user: currentSession?.user?.email,
            });
            setSession(currentSession);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,
        isAuthenticated: !!session?.user,
        loading,
        user: session?.user ?? null,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
