import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Toaster } from "sonner";

export function UpdatePasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("UpdatePasswordPage: Location", {
            pathname: location.pathname,
            hash: location.hash,
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(
                "UpdatePasswordPage: Auth event",
                event,
                session?.user?.email
            );

            if (event === "PASSWORD_RECOVERY") {
                setIsLoading(false);
            } else if (event === "SIGNED_IN") {
                if (location.hash.includes("type=recovery")) {
                    setIsLoading(false);
                } else {
                    navigate("/auth", {
                        state: {
                            message:
                                "Please sign out before resetting password.",
                            isSuccess: false,
                        },
                        replace: true,
                    });
                }
            } else if (event === "SIGNED_OUT") {
                if (!location.hash.includes("type=recovery")) {
                    navigate("/auth", { replace: true });
                }
            }
        });

        // Check for recovery token in URL
        if (location.hash.includes("type=recovery")) {
            setIsLoading(false);
        }

        return () => subscription.unsubscribe();
    }, [navigate, location]);

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
