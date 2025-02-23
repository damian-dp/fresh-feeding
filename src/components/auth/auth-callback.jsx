import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { LoadingScreen } from "@/components/app/loading-screen";

export function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Skip if we're already on the auth page
        if (location.pathname === "/auth") {
            return;
        }

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

                // Check for expired link first
                const errorDescription =
                    hashParams.get("error_description") ||
                    queryParams.get("error_description");
                const error =
                    hashParams.get("error") || queryParams.get("error");
                const errorCode =
                    hashParams.get("error_code") ||
                    queryParams.get("error_code");

                if (error === "access_denied" && errorCode === "otp_expired") {
                    console.log(
                        "[Auth Callback] Link expired, redirecting to auth"
                    );
                    navigate("/auth", {
                        replace: true,
                        state: {
                            showVerification: true,
                            isExpired: true,
                            email: null,
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
                        console.log("[Auth Callback] Setting session...");

                        // First verify the session is valid
                        const {
                            data: { user },
                            error: userError,
                        } = await supabase.auth.getUser(accessToken);

                        if (userError) {
                            console.error(
                                "[Auth Callback] Invalid access token:",
                                userError
                            );
                            throw userError;
                        }

                        if (!user) {
                            console.error(
                                "[Auth Callback] No user found with token"
                            );
                            throw new Error("Invalid user token");
                        }

                        console.log(
                            "[Auth Callback] Valid user token, setting session"
                        );

                        const {
                            data: { session },
                            error: sessionError,
                        } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (sessionError) {
                            console.error(
                                "[Auth Callback] Session error:",
                                sessionError
                            );
                            throw sessionError;
                        }

                        if (!session) {
                            console.error("[Auth Callback] No session created");
                            throw new Error("Failed to create session");
                        }

                        console.log("[Auth Callback] Session set successfully");

                        // Small delay to ensure session is properly set
                        await new Promise((resolve) =>
                            setTimeout(resolve, 500)
                        );

                        if (mounted) {
                            console.log(
                                "[Auth Callback] Redirecting to dashboard"
                            );
                            window.location.replace("/dashboard");
                        }
                        return;
                    } catch (error) {
                        console.error("[Auth Callback] Session error:", error);
                        if (mounted) {
                            navigate("/auth", {
                                replace: true,
                                state: {
                                    showVerification: true,
                                    isExpired: true,
                                    email: null,
                                },
                            });
                        }
                        return;
                    }
                }

                // Handle old-style token verification
                const token =
                    queryParams.get("token") || hashParams.get("token");
                if (token) {
                    console.log("[Auth Callback] Found verification token");
                    const { data: verifyData, error: verifyError } =
                        await supabase.auth.verifyOtp({
                            token_hash: token,
                            type: "signup",
                        });

                    if (verifyError) throw verifyError;
                    if (verifyData?.session) {
                        console.log(
                            "[Auth Callback] OTP verified successfully, redirecting to dashboard"
                        );
                        if (mounted) {
                            window.location.replace("/dashboard");
                        }
                        return;
                    }
                }

                // If we get here, show expired message
                if (mounted) {
                    navigate("/auth", {
                        replace: true,
                        state: {
                            showVerification: true,
                            isExpired: true,
                            email: null,
                        },
                    });
                }
            } catch (error) {
                console.error("[Auth Callback] Error:", error);
                if (mounted) {
                    navigate("/auth", {
                        replace: true,
                        state: {
                            showVerification: true,
                            isExpired: true,
                            email: null,
                        },
                    });
                }
            }
        };

        handleAuthCallback();

        return () => {
            mounted = false;
        };
    }, [navigate, location.pathname]);

    // Only show loading spinner on callback route
    if (location.pathname === "/auth") {
        return null;
    }

    return <LoadingScreen />;
}
