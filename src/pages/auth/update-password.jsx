import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { toast } from "sonner";

export function UpdatePasswordPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session);

            if (event === "PASSWORD_RECOVERY") {
                console.log("Password recovery event detected");
                setIsRecoveryMode(true);
                setIsLoading(false);
            } else if (event === "SIGNED_IN" && !isRecoveryMode) {
                console.log("User is already signed in");
                navigate("/auth", {
                    state: {
                        message: "Please sign out before resetting password.",
                        isSuccess: false,
                    },
                    replace: true,
                });
            } else if (event === "INITIAL_SESSION" && isRecoveryMode) {
                console.log("Initial session in recovery mode");
                // Do nothing, let the user update their password
            } else if (!isRecoveryMode) {
                console.log("Redirecting to auth page");
                navigate("/auth", {
                    state: {
                        message:
                            "Invalid reset password link. Please try again.",
                        isSuccess: false,
                    },
                    replace: true,
                });
            }
        });

        // Check if we're already in a recovery session
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session?.user?.aud === "authenticated") {
                setIsRecoveryMode(true);
                setIsLoading(false);
            }
        };

        checkSession();

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate, isRecoveryMode]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="container max-w-screen-xl mx-auto px-4 py-12">
            <div className="max-w-md mx-auto">
                <ResetPasswordForm />
            </div>
        </div>
    );
}
