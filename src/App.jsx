import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RootLayout } from "./components/layout/root-layout";
import { LandingPage } from "./pages/landing-page";
import { AuthPage } from "./pages/auth";
import { DashboardPage } from "./pages/dashboard";
import { ProtectedRoute } from "./components/auth/protected-route";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthCallback } from "@/components/auth/auth-callback";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />

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

                    <Route path="/auth/callback" element={<AuthCallback />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
