import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

export function AuthRedirect() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Get the token and type from URL search params
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        console.log("AuthRedirect: Received params", { token, type });

        if (type === "recovery" && token) {
            console.log("AuthRedirect: Recovery flow detected");
            // Exchange the recovery token for an access token
            const exchangeToken = async () => {
                try {
                    console.log("AuthRedirect: Attempting to verify OTP", {
                        token,
                        type,
                    });

                    // First verify the token
                    const { data: verifyData, error: verifyError } =
                        await supabase.auth.verifyOtp({
                            token,
                            type: "recovery",
                        });

                    if (verifyError) {
                        console.error(
                            "AuthRedirect: OTP verification error",
                            verifyError
                        );
                        throw verifyError;
                    }

                    console.log(
                        "AuthRedirect: OTP verification response",
                        verifyData
                    );

                    // If successful, redirect to update password with the access token
                    if (verifyData?.session?.access_token) {
                        console.log(
                            "AuthRedirect: Got access token, redirecting..."
                        );

                        // Store the session
                        const { error: sessionError } =
                            await supabase.auth.setSession(verifyData.session);

                        if (sessionError) {
                            console.error("Session error:", sessionError);
                            throw sessionError;
                        }

                        // Redirect to update password page
                        navigate(
                            `/auth/update-password#access_token=${verifyData.session.access_token}&type=recovery`,
                            { replace: true }
                        );
                    } else {
                        throw new Error("No access token received");
                    }
                } catch (error) {
                    console.error("Token exchange error:", error);
                    navigate("/auth", {
                        state: {
                            message:
                                "Invalid or expired reset link. Please try again.",
                            isSuccess: false,
                        },
                        replace: true,
                    });
                }
            };

            exchangeToken();
        } else {
            console.log("AuthRedirect: Invalid recovery link", { token, type });
            navigate("/auth", {
                state: {
                    message: "Invalid reset password link",
                    isSuccess: false,
                },
                replace: true,
            });
        }
    }, [navigate, searchParams]);

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
}
