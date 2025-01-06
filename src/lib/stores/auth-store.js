import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export const useAuthStore = create((set) => ({
    user: null,
    isLoading: true,
    error: null,

    signIn: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            set({ user: data.user, error: null });
            return data;
        } catch (error) {
            set({ error: error.message });
            return null;
        }
    },

    signUp: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        name: email.split("@")[0],
                        full_name: email.split("@")[0],
                    },
                },
            });

            if (error) throw error;

            if (data?.user?.identities?.length === 0) {
                throw new Error("Email already registered");
            }

            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    },

    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            set({ user: null, error: null });
        } catch (error) {
            set({ error: error.message });
        }
    },

    checkUser: async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            set({ user, isLoading: false });
            return user;
        } catch (error) {
            set({ user: null, isLoading: false });
            return null;
        }
    },

    resetPassword: async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
        } catch (error) {
            throw error;
        }
    },
}));
