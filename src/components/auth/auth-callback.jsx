import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { ResetPasswordForm } from "./reset-password-form";
import { Toaster } from "sonner";

export function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const code = searchParams.get("code");
                const type = searchParams.get("type");

                console.log("Auth callback params:", { code, type });

                // Handle email verification
                if (type === "signup" || !type) {
                    if (code) {
                        // Just verify the email without establishing a session
                        const { error } = await supabase.auth.verifyOtp({
                            token_hash: code,
                            type: "signup",
                        });

                        if (
                            error?.message?.includes("User already confirmed")
                        ) {
                            navigate("/auth", {
                                state: {
                                    message:
                                        "Email already verified. Please sign in.",
                                    isSuccess: true,
                                },
                                replace: true,
                            });
                            return;
                        }

                        if (error) throw error;

                        navigate("/auth", {
                            state: {
                                message:
                                    "Email verified successfully. Please sign in.",
                                isSuccess: true,
                            },
                            replace: true,
                        });
                        return;
                    }
                }

                // Handle password recovery flow
                if (type === "recovery") {
                    if (code) {
                        const { error } =
                            await supabase.auth.exchangeCodeForSession(code);
                        if (error) throw error;
                    }
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.error("Auth callback error:", error);
                navigate("/auth", {
                    state: {
                        message: "Verification failed. Please try again.",
                        isSuccess: false,
                    },
                    replace: true,
                });
            }
        };

        handleAuthCallback();
    }, [navigate, searchParams]);

    // Show reset password form if this is a recovery flow
    const type = searchParams.get("type");
    const isRecovery = type === "recovery";

    if (isRecovery) {
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
                    <Toaster position="bottom-right" richColors />
                </div>
            </div>
        );
    }

    // Show loading spinner for other auth flows
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
}
