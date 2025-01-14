import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturePills } from "@/components/landing-page/feature-pills";
import { AppDemoScreen } from "@/components/landing-page/app-demo-screen";
import { TestimonialsGrid } from "@/components/landing-page/testimonials-grid";
import { useLoading } from "@/hooks/use-loading";
import { useAuth } from "@/components/providers/auth-provider";

export function LandingPage() {
    const isLoading = useLoading();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [activeFeature, setActiveFeature] = useState("Recipes");

    // Only wait for page load
    if (isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
        >
            {/* Navigation */}
            <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
                <nav className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                    <Link to="/" className="font-semibold text-lg">
                        Fresh Feeding
                    </Link>
                    <div className="flex items-center gap-4">
                        {authLoading ? (
                            <Button disabled variant="ghost">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Loading
                            </Button>
                        ) : isAuthenticated ? (
                            <Button asChild>
                                <Link to="/dashboard">Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link to="/auth">Sign in</Link>
                                </Button>
                                <Button asChild>
                                    <Link to="/auth">Get started</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="pt-32 pb-16">
                    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm mb-4"
                            >
                                <Link
                                    to="/blog/raw-feeding"
                                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                                >
                                    Why raw feeding is best for your dog
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8"
                            >
                                Feed your dogs the{" "}
                                <span className="text-primary">
                                    natural way
                                </span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
                            >
                                Create balanced, species-appropriate raw food
                                recipes for your dogs. Track nutrients, manage
                                multiple pets, and join the fresh feeding
                                revolution.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex justify-center gap-4"
                            >
                                <Button size="lg" asChild>
                                    <Link to="/auth">
                                        Start feeding fresh{" "}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-16"
                        >
                            <FeaturePills
                                activeFeature={activeFeature}
                                setActiveFeature={setActiveFeature}
                            />
                        </motion.div>

                        <AppDemoScreen activeFeature={activeFeature} />
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-24 bg-muted/50">
                    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">
                                Loved by dog parents worldwide
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                See what our customers have to say about Fresh
                                Feeding
                            </p>
                        </div>
                        <TestimonialsGrid />
                    </div>
                </section>

                {/* Keep your existing benefits section */}
            </main>

            {/* Keep your existing footer */}
        </motion.div>
    );
}
