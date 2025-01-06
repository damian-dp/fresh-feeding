import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

export function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                console.log("Current URL:", window.location.href);

                // Parse both URL components
                const searchParams = new URLSearchParams(
                    window.location.search
                );
                const hashParams = new URLSearchParams(
                    window.location.hash.replace("#", "")
                );

                // Get all possible parameters
                const type = searchParams.get("type");
                const error =
                    searchParams.get("error") || hashParams.get("error");
                const error_description =
                    searchParams.get("error_description") ||
                    hashParams.get("error_description");
                const error_code = hashParams.get("error_code");

                // Handle errors by passing them to auth page
                if (error || error_code) {
                    let message;
                    let isSuccess = false;

                    // If we have both access_denied and otp_expired, it means the email is already verified
                    if (
                        error === "access_denied" &&
                        error_code === "otp_expired"
                    ) {
                        message =
                            "Your email is already verified. Please sign in.";
                        isSuccess = true;
                    } else {
                        switch (error_code || error) {
                            case "unauthorized":
                                message =
                                    "This link is invalid. Please try signing up again.";
                                break;
                            case "otp_expired":
                                message =
                                    "The verification link has expired. Please request a new one.";
                                break;
                            default:
                                message =
                                    error_description || "An error occurred";
                        }
                    }

                    navigate("/auth", {
                        state: { message, isSuccess },
                        replace: true,
                    });
                    return;
                }

                // If no errors, try to get session
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (session) {
                    navigate("/dashboard", {
                        state: {
                            message:
                                "Email verified successfully! Welcome aboard!",
                            isSuccess: true,
                        },
                        replace: true,
                    });
                } else {
                    navigate("/auth", {
                        state: {
                            message: "Please sign in to continue",
                            isSuccess: false,
                        },
                        replace: true,
                    });
                }
            } catch (error) {
                console.error("Auth callback error:", error);
                navigate("/auth", {
                    state: {
                        message:
                            "Something went wrong. Please try signing in again.",
                        isSuccess: false,
                    },
                    replace: true,
                });
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
}
