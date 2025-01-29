import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import { useLoading } from "@/components/providers/loading-provider";
import { LoadingScreen } from "@/components/app/loading-screen";

export function ProtectedRoute({ children }) {
    const { session, loading: authLoading } = useAuth();
    const { isReady, isLoading } = useLoading();

    if (authLoading) {
        return <LoadingScreen />;
    }

    if (!session) {
        return <Navigate to="/auth" />;
    }

    if (isLoading) {
        return <LoadingScreen />;
    }

    return children;
}
