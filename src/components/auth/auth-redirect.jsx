import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function AuthRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        // Get the full URL including hash
        const fullUrl = window.location.href;
        console.log("AuthRedirect: Full URL", fullUrl);

        // Check if it's a recovery flow
        if (fullUrl.includes("type=recovery")) {
            console.log("AuthRedirect: Recovery flow detected");
            // Redirect to the update password page with the same hash
            const hash = window.location.hash;
            console.log("AuthRedirect: Hash", hash);
            navigate(`/auth/update-password${hash}`, { replace: true });
        } else {
            console.log("AuthRedirect: Invalid recovery link");
            // For any other cases, redirect to auth
            navigate("/auth", {
                state: {
                    message: "Invalid reset password link",
                    isSuccess: false,
                },
                replace: true,
            });
        }
    }, [navigate]);

    return null;
}
