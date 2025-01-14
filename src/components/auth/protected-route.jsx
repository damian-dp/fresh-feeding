import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!loading && !isAuthenticated) {
                console.log("Protected route: Redirecting to auth", {
                    loading,
                    isAuthenticated,
                });
                toast.error("Please sign in to continue");
                navigate("/auth", { replace: true });
            }
        }, 1000); // Give a short delay to prevent flash redirects

        return () => clearTimeout(timeoutId);
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return isAuthenticated ? children : null;
}
