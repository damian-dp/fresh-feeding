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
                console.log("[AuthProvider] Initializing auth...");
                // Get current session from Supabase
                const {
                    data: { session: currentSession },
                    error,
                } = await supabase.auth.getSession();

                if (error) throw error;

                if (currentSession) {
                    console.log("[AuthProvider] Got current session:", {
                        email: currentSession.user.email,
                    });
                    setSession(currentSession);
                } else {
                    console.log("[AuthProvider] No current session");
                }
            } catch (error) {
                console.error(
                    "[AuthProvider] Auth initialization error:",
                    error
                );
                setSession(null);
            } finally {
                console.log("[AuthProvider] Setting loading to false");
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            console.log("[AuthProvider] Auth state changed:", {
                event,
                hasSession: !!currentSession,
                email: currentSession?.user?.email,
                path: window.location.pathname,
            });

            // Update the session state
            setSession(currentSession);
            setLoading(false);

            // Handle sign out
            if (event === "SIGNED_OUT") {
                window.location.replace("/");
                return;
            }

            // Handle successful sign in or token refresh
            if (["SIGNED_IN", "TOKEN_REFRESHED"].includes(event)) {
                // If we're on the auth page or home page, redirect to dashboard
                if (["/", "/auth"].includes(window.location.pathname)) {
                    window.location.replace("/dashboard");
                }
            }
        });

        return () => {
            console.log("[AuthProvider] Cleaning up auth subscription");
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        isAuthenticated: !!session?.user,
        loading,
        user: session?.user ?? null,
    };

    // Log state changes
    useEffect(() => {
        console.log("[AuthProvider] State updated:", {
            isAuthenticated: !!session?.user,
            loading,
            path: window.location.pathname,
        });
    }, [session, loading]);

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
