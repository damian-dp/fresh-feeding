import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { RootLayout } from "./components/layout/root-layout";
import { LandingPage } from "./pages/landing-page";
import { AuthPage } from "@/pages/auth";
import { DashboardPage } from "./pages/dashboard";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { ProtectedRoute } from "./components/auth/protected-route";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthCallback } from "@/components/auth/auth-callback";
import { UpdatePasswordPage } from "@/pages/auth/update-password";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { Toaster } from "sonner";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route
                        path="/auth/reset-password"
                        element={<ResetPasswordPage />}
                    />
                    <Route
                        path="/auth/update-password"
                        element={<UpdatePasswordPage />}
                    />
                    <Route path="/reset-password" element={<AuthRedirect />} />

                    {/* Protected routes */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <RootLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/recipes" element={<h1>Recipes</h1>} />
                        <Route
                            path="/dogs/:dogId"
                            element={<h1>Dog Profile</h1>}
                        />
                        <Route
                            path="/ingredients"
                            element={<h1>Ingredients</h1>}
                        />
                    </Route>
                </Routes>
                <Toaster position="bottom-right" richColors />
            </Router>
        </AuthProvider>
    );
}

export default App;
