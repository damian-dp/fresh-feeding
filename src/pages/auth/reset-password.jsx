import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Toaster } from "sonner";

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { session } = useAuth();

    useEffect(() => {
        if (session) {
            navigate("/auth", {
                state: {
                    message: "Please sign out before resetting password.",
                    isSuccess: false,
                },
                replace: true,
            });
        } else {
            setIsLoading(false);
        }
    }, [session, navigate]);

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
