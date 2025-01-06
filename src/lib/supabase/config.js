const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    console.error("Missing Supabase environment variables:", {
        url: !!url,
        anonKey: !!anonKey,
    });
}

export const supabaseConfig = {
    url,
    anonKey,
};
