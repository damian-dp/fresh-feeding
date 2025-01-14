import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            storageKey: "sb-stjoiaqeuxfgvgkfkhhi-auth-token",
            storage: window.localStorage,
            detectSessionInUrl: true,
            autoRefreshToken: true,
            flowType: "implicit",
        },
    }
);
