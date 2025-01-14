import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);

    useEffect(() => {
        // Get session from Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ session }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
