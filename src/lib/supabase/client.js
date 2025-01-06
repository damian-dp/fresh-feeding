import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

export const supabase = createClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
        global: {
            headers: {
                apikey: supabaseConfig.anonKey,
            },
        },
    }
);
