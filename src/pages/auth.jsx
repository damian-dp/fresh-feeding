import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthForm } from "@/components/auth/auth-form";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthPage() {
    const { user, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const toastShown = useRef(false);

    useEffect(() => {
        if (!isLoading && user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, isLoading, navigate]);

    useEffect(() => {
        // Show toast if we have a message from the callback and haven't shown it yet
        if (location.state?.message && !toastShown.current) {
            const { message, isSuccess } = location.state;
            if (isSuccess) {
                toast.success(message);
            } else {
                toast.error(message);
            }
            toastShown.current = true;
            // Clear the message from location state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div className="container max-w-screen-xl mx-auto px-4 py-12">
            <AuthForm />
            <Toaster position="bottom-right" richColors />
        </div>
    );
}
