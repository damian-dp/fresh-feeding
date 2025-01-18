import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { features } from "./feature-pills";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Plus } from "lucide-react";

export function AppDemoScreen({ activeFeature }) {
    const [showSheet, setShowSheet] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(activeFeature);
    const [nextFeature, setNextFeature] = useState(null);
    const [isClosingSheet, setIsClosingSheet] = useState(false);

    // Helper to check if a feature uses a sheet
    const hasSheet = (feature) =>
        feature === "Recipes" || feature === "Ingredient Database";

    // Handle feature changes
    useEffect(() => {
        if (activeFeature !== currentFeature) {
            if (hasSheet(currentFeature) && showSheet) {
                // First, store the next feature
                setNextFeature(activeFeature);
                // Start sheet closing sequence
                setIsClosingSheet(true);
                setShowSheet(false);

                // Wait for sheet to fully close
                setTimeout(() => {
                    setIsClosingSheet(false);
                    // Now we can start the content transition
                    setCurrentFeature(activeFeature);
                    setNextFeature(null);
                }, 500);
            } else {
                // No sheet to close, change content immediately
                setCurrentFeature(activeFeature);
            }
        }
    }, [activeFeature, currentFeature, showSheet]);

    // Show sheet after content transition
    useEffect(() => {
        if (hasSheet(currentFeature) && !isClosingSheet && !nextFeature) {
            const timer = setTimeout(() => {
                setShowSheet(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [currentFeature, isClosingSheet, nextFeature]);

    return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-background shadow-2xl">
            <div className="absolute inset-0 flex">
                <div className="w-64 border-r bg-background">
                    {/* <Sidebar preview /> */}
                </div>

                <div className="flex-1 relative">
                    {/* Content transitions */}
                    <AnimatePresence mode="wait">
                        {!nextFeature && (
                            <motion.div
                                key={currentFeature}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 p-8"
                            >
                                {currentFeature === "Dashboard" && (
                                    <DashboardPreview />
                                )}
                                {currentFeature === "Dog Management" && (
                                    <DogManagementPreview />
                                )}
                                {currentFeature === "Recipes" && (
                                    <RecipePreview />
                                )}
                                {currentFeature === "Ingredient Database" && (
                                    <IngredientPreview />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Sheet with its own AnimatePresence */}
                    <AnimatePresence>
                        {showSheet && (
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{
                                    type: "spring",
                                    bounce: 0,
                                    duration: 0.5,
                                }}
                                className="absolute top-0 right-0 bottom-0 w-[600px] border-l bg-background"
                            >
                                <div className="p-6">
                                    {currentFeature === "Recipes" && (
                                        <RecipeDetails />
                                    )}
                                    {currentFeature ===
                                        "Ingredient Database" && (
                                        <IngredientDetails />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function DashboardPreview() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Hi John,</h1>
                    <p className="text-muted-foreground">let's get started.</p>
                </div>
                <Button>
                    Add dog <Plus className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-8">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Your dogs</h2>
                        <Button variant="ghost" size="sm">
                            Add dog
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Dog cards as per the image */}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                            Recent recipes
                        </h2>
                        <Button variant="ghost" size="sm">
                            Create recipe
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {/* Recipe list as per the image */}
                    </div>
                </section>
            </div>
        </div>
    );
}

function DogManagementPreview() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Your dogs</h1>
                    <p className="text-muted-foreground">
                        Manage your dogs' profiles
                    </p>
                </div>
                <Button>
                    Add dog <Plus className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src="/dogs/cooper.jpg" />
                            <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">Cooper</h3>
                            <p className="text-sm text-muted-foreground">
                                Age: 2y 6m • Weight: 27kg
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Daily intake: 2.5% • 250g
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src="/dogs/reggie.jpg" />
                            <AvatarFallback>R</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">Reggie</h3>
                            <p className="text-sm text-muted-foreground">
                                Age: 1y 6m • Weight: 3kg
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Daily intake: 3% • 90g
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function RecipePreview() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Recipes</h1>
                    <p className="text-muted-foreground">Manage your recipes</p>
                </div>
                <Button>
                    Create recipe <Plus className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                    Single Protein Mix (Goat)
                                </h3>
                                <span className="text-sm text-muted-foreground">
                                    700g
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Ingredients: ground goat meat, heart, liver,
                                kidney, celery...
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full">
                                    Fully balanced
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
                {/* Add more recipe cards */}
            </div>
        </div>
    );
}

function IngredientPreview() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Ingredient Database</h1>
                    <p className="text-muted-foreground">
                        Browse available ingredients
                    </p>
                </div>
                <Button variant="outline">Filter</Button>
            </div>

            <div className="space-y-4">
                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Chicken Heart</h3>
                                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                                    Muscle Meat
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Rich in protein, vitamins and minerals...
                            </p>
                        </div>
                    </div>
                </Card>
                {/* Add more ingredient cards */}
            </div>
        </div>
    );
}

function RecipeDetails() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">
                    Single Protein Mix (Goat)
                </h2>
                <p className="text-muted-foreground">Created for Cooper</p>
            </div>
            {/* Add recipe details */}
        </div>
    );
}

function IngredientDetails() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Chicken Heart</h2>
                <p className="text-muted-foreground">Muscle Meat</p>
            </div>
            {/* Add ingredient details */}
        </div>
    );
}

// I'll continue with the other preview components in the next message...
