import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { RootLayout } from "./components/layout/root-layout";
import { LandingPage } from "./pages/landing-page";
import { AuthPage } from "@/pages/auth";
import { DashboardPage } from "./pages/app/dashboard";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { ProtectedRoute } from "./components/auth/protected-route";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthCallback } from "@/components/auth/auth-callback";
import { UpdatePasswordPage } from "@/pages/auth/update-password";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { Toaster } from "sonner";
import { UserProvider } from "@/components/providers/user-provider";
import { DogsProvider } from "@/components/providers/dogs-provider";
import { RecipesProvider } from "@/components/providers/recipes-provider";
import { DogProfilePage } from "@/pages/app/dog-profile";
import { UserRecipesPage } from "@/pages/app/user-recipes";
import { IngredientDatabasePage } from "./pages/app/ingredient-database";
import { IngredientsProvider } from "@/components/providers/ingredients-provider";
import { Analytics } from "@vercel/analytics/react";

function App() {
    return (
        <AuthProvider>
            <UserProvider>
                <DogsProvider>
                    <RecipesProvider>
                        <IngredientsProvider>
                            <Router>
                                <Routes>
                                    {/* Public routes */}
                                    <Route path="/" element={<LandingPage />} />
                                    <Route
                                        path="/auth"
                                        element={<AuthPage />}
                                    />
                                    <Route
                                        path="/auth/callback"
                                        element={<AuthCallback />}
                                    />
                                    <Route
                                        path="/auth/reset-password"
                                        element={<ResetPasswordPage />}
                                    />
                                    <Route
                                        path="/auth/update-password"
                                        element={<UpdatePasswordPage />}
                                    />
                                    <Route
                                        path="/reset-password"
                                        element={<AuthRedirect />}
                                    />

                                    {/* Protected routes */}
                                    <Route
                                        element={
                                            <ProtectedRoute>
                                                <RootLayout />
                                            </ProtectedRoute>
                                        }
                                    >
                                        <Route
                                            path="/dashboard"
                                            element={<DashboardPage />}
                                        />
                                        <Route
                                            path="/recipes"
                                            element={<UserRecipesPage />}
                                        />
                                        <Route
                                            path="/dogs/:dogId"
                                            element={<DogProfilePage />}
                                        />
                                        <Route
                                            path="/ingredients"
                                            element={<IngredientDatabasePage />}
                                        />
                                        <Route
                                            path="/suppliers"
                                            element={<h1>Suppliers</h1>}
                                        />
                                    </Route>
                                </Routes>
                                <Toaster position="bottom-right" richColors />
                            </Router>
                        </IngredientsProvider>
                    </RecipesProvider>
                </DogsProvider>
            </UserProvider>
            <Analytics />
        </AuthProvider>
    );
}

export default App;
