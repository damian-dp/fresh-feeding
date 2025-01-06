import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { supabase } from "@/lib/supabase/client";

export function AuthProvider({ children }) {
    const { checkUser } = useAuthStore();

    useEffect(() => {
        // Check for initial session
        const initializeAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                await checkUser();
            }
        };

        initializeAuth();

        // Set up auth state listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state change:", event, session); // Debug log
            if (
                event === "SIGNED_IN" ||
                event === "TOKEN_REFRESHED" ||
                event === "USER_UPDATED"
            ) {
                await checkUser();
            }
            if (event === "SIGNED_OUT") {
                await checkUser();
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [checkUser]);

    return children;
}
