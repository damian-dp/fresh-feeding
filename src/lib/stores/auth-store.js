import { supabase } from "@/lib/supabase/client";

export const authService = {
    signIn: async (email, password) => {
        try {
            console.log("Attempting sign in...", { email });
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            console.log("Sign in successful:", data);
            return data;
        } catch (error) {
            console.error("Sign in error:", error);
            throw error;
        }
    },

    signUp: async (email, password, name) => {
        try {
            console.log("Attempting sign up...", { email, name });

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("Please enter a valid email address");
            }

            const hasFullName = name.includes(" ");
            const metadata = {
                email: email,
                unit_metric: true,
            };

            if (hasFullName) {
                metadata.full_name = name;
                metadata.name = name.split(" ")[0];
            } else {
                metadata.name = name;
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: metadata,
                },
            });

            if (error) {
                if (error.message === "Error sending confirmation email") {
                    console.warn(
                        "Email service error, but user might have been created"
                    );
                    if (data?.user) {
                        return data;
                    }
                }
                throw error;
            }

            console.log("Sign up successful:", data);
            return data;
        } catch (error) {
            console.error("Sign up error:", error);
            throw error;
        }
    },

    resetPassword: async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Reset password error:", error);
            throw error;
        }
    },

    resendVerification: async (email) => {
        try {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email: email,
            });
            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Resend verification error:", error);
            throw error;
        }
    },
};
