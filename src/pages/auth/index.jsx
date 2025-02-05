import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthForm } from "@/components/auth/auth-form";
import { toast } from "sonner";

export function AuthPage() {
    const location = useLocation();

    useEffect(() => {
        // Show toast message if redirected with state
        if (location.state?.message) {
            const { message, isSuccess } = location.state;
            if (isSuccess) {
                toast.success(message);
            } else {
                toast.error(message);
            }
        }
    }, [location]);

    return (
        <div className="container max-w-screen-xl mx-auto px-4 py-12">
            <div className="max-w-md mx-auto">
                <AuthForm />
            </div>
        </div>
    );
}
