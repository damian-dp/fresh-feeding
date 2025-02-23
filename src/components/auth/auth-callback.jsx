import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { LoadingScreen } from "@/components/app/loading-screen";

export function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        const handleAuthCallback = async () => {
            try {
                const url = new URL(window.location.href);
                console.log("[Auth Callback] Full URL:", url.toString());

                // Parse both query parameters and hash parameters
                const queryString = url.search.substring(1);
                const hashString = url.hash.substring(1);

                const queryParams = new URLSearchParams(queryString);
                const hashParams = new URLSearchParams(hashString);

                // Check for error parameters
                const errorDescription =
                    hashParams.get("error_description") ||
                    queryParams.get("error_description");
                const error =
                    hashParams.get("error") || queryParams.get("error");
                const errorCode =
                    hashParams.get("error_code") ||
                    queryParams.get("error_code");

                // Get token from either hash or query params
                const token =
                    queryParams.get("token") || hashParams.get("token");
                const type = queryParams.get("type") || hashParams.get("type");

                // If we have an error or invalid/expired token
                if (error || errorCode || (token && type === "signup")) {
                    console.log("[Auth Callback] Error detected:", {
                        error,
                        errorCode,
                        errorDescription,
                    });

                    // Navigate to sign in with error state
                    navigate("/sign-in", {
                        replace: true,
                        state: {
                            formAlert: {
                                type: "error",
                                title: "Link expired",
                                message:
                                    "This verification link has expired. Please sign in to request a new one.",
                            },
                        },
                    });
                    return;
                }

                // Check for access token (successful verification)
                const accessToken =
                    hashParams.get("access_token") ||
                    queryParams.get("access_token");
                if (accessToken) {
                    console.log("[Auth Callback] Found access token");
                    try {
                        const refreshToken =
                            hashParams.get("refresh_token") ||
                            queryParams.get("refresh_token");

                        // First verify the session is valid
                        const {
                            data: { user },
                            error: userError,
                        } = await supabase.auth.getUser(accessToken);

                        if (userError || !user) {
                            throw new Error(
                                userError?.message || "Invalid user token"
                            );
                        }

                        // Set the session
                        const {
                            data: { session },
                            error: sessionError,
                        } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (sessionError || !session) {
                            throw new Error(
                                sessionError?.message ||
                                    "Failed to create session"
                            );
                        }

                        // Small delay to ensure session is properly set
                        await new Promise((resolve) =>
                            setTimeout(resolve, 500)
                        );

                        if (mounted) {
                            window.location.replace("/dashboard");
                        }
                        return;
                    } catch (error) {
                        console.error("[Auth Callback] Session error:", error);
                        navigate("/sign-in", {
                            replace: true,
                            state: {
                                formAlert: {
                                    type: "error",
                                    title: "Authentication failed",
                                    message:
                                        "Failed to verify your email. Please try signing in or request a new verification link.",
                                },
                            },
                        });
                        return;
                    }
                }

                // If we get here without any successful auth, show expired message
                navigate("/sign-in", {
                    replace: true,
                    state: {
                        formAlert: {
                            type: "error",
                            title: "Link expired",
                            message:
                                "This verification link has expired. Please sign in to request a new one.",
                        },
                    },
                });
            } catch (error) {
                console.error("[Auth Callback] Error:", error);
                navigate("/sign-in", {
                    replace: true,
                    state: {
                        formAlert: {
                            type: "error",
                            title: "Authentication failed",
                            message:
                                "An unexpected error occurred. Please try signing in again.",
                        },
                    },
                });
            }
        };

        handleAuthCallback();

        return () => {
            mounted = false;
        };
    }, [navigate]);

    return <LoadingScreen />;
}
