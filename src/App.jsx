import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { RootLayout } from "./components/layout/root-layout";
import { LandingPage } from "./pages/landing/landing-page";
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
import {
    LoadingProvider,
    useLoading,
} from "@/components/providers/loading-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TermsPage } from "@/pages/landing/terms-page";
import { PrivacyPage } from "@/pages/landing/privacy-page";
import { ScrollToTop } from "@/components/scroll-to-top";
import { AdminDashPage } from "./pages/admin/admin-dash";
import { AdminRoute } from "./components/auth/admin-route";

function AppContent() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/terms-of-use" element={<TermsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPage />} />

                <Route path="/auth" element={<AuthPage />} />
                <Route path="/sign-in" element={<AuthPage />} />
                <Route path="/sign-up" element={<AuthPage />} />
                <Route path="/forgot-password" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                    path="/auth/update-password"
                    element={<UpdatePasswordPage />}
                />

                <Route
                    element={
                        <ProtectedRoute>
                            <RootLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/recipes" element={<UserRecipesPage />} />
                    <Route path="/dogs/:dogId" element={<DogProfilePage />} />
                    <Route
                        path="/ingredients"
                        element={<IngredientDatabasePage />}
                    />
                    <Route path="/suppliers" element={<h1>Suppliers</h1>} />
                    <Route
                        path="/admin-dashboard"
                        element={
                            <AdminRoute>
                                <RootLayout>
                                    <AdminDashPage />
                                </RootLayout>
                            </AdminRoute>
                        }
                    />
                </Route>
            </Routes>
            <Toaster position="bottom-right" richColors />
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <ThemeProvider defaultTheme="light" storageKey="fresh-food-theme">
                <UserProvider>
                    <DogsProvider>
                        <RecipesProvider>
                            <IngredientsProvider>
                                <LoadingProvider>
                                    <AppContent />
                                </LoadingProvider>
                            </IngredientsProvider>
                        </RecipesProvider>
                    </DogsProvider>
                </UserProvider>
                <Analytics />
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
