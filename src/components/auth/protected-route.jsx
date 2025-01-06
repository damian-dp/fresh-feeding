import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";

export function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            toast.error("Please sign in to continue");
            navigate("/auth", { replace: true });
        }
    }, [user, isLoading, navigate]);

    // Don't render anything while checking auth
    if (isLoading) return null;

    return user ? children : null;
}
