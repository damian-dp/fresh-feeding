import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/components/providers/user-provider";
import { useLoading } from "@/components/providers/loading-provider";
import { LoadingScreen } from "@/components/app/loading-screen";
import { useAuth } from "@/components/providers/auth-provider";

export function AdminRoute({ children }) {
    const { isAdmin } = useUser();
    const location = useLocation();
    const { loading: authLoading } = useAuth();
    const { isLoading } = useLoading();

    if (authLoading) {
        return <LoadingScreen />;
    }

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAdmin) {
        // Redirect them to the dashboard if not an admin
        return <Navigate to="/dashboard" replace state={{ from: location }} />;
    }

    return children;
}
