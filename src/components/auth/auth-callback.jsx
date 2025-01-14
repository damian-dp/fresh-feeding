import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the current URL
                const url = new URL(window.location.href);
                const hashParams = new URLSearchParams(url.hash.substring(1));
                const queryParams = new URLSearchParams(url.search);

                // Check for error first
                const error =
                    hashParams.get("error") || queryParams.get("error");
                if (error) {
                    throw new Error(error);
                }

                // Get session
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session) {
                    console.log("Authentication successful");
                    navigate("/dashboard", { replace: true });
                } else {
                    throw new Error("No session found");
                }
            } catch (error) {
                console.error("Auth callback error:", error);
                toast.error("Authentication failed. Please try again.");
                navigate("/auth", { replace: true });
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
    );
}
