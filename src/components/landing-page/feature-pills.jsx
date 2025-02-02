import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Dog,
    UtensilsCrossed,
    Database,
    Calculator,
} from "lucide-react";

export const features = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        description: "Get an overview of your dogs and recent recipes",
    },
    {
        name: "Dog Management",
        icon: Dog,
        description: "Manage your dogs' profiles and feeding plans",
    },
    {
        name: "Recipes",
        icon: UtensilsCrossed,
        description: "Create and manage your raw feeding recipes",
    },
    {
        name: "Ingredient Database",
        icon: Database,
        description: "Browse and learn about available ingredients",
    },
    {
        name: "Customised Ratios",
        icon: Calculator,
        description: "Customise your recipes to your dog's needs",
    },
];

export function FeaturePills({ activeFeature, setActiveFeature }) {
    return (
        <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
            {features.map((feature, i) => (
                <motion.button
                    key={feature.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border border-border transition-colors ${
                        activeFeature === feature.name
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-secondary-foreground hover:bg-accent"
                    }`}
                    onClick={() => setActiveFeature(feature.name)}
                >
                    <feature.icon className="h-4 w-4" />
                    <span>{feature.name}</span>
                </motion.button>
            ))}
        </div>
    );
}
