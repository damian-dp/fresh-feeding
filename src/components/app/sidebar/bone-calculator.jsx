import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DogSwitcher } from "@/components/app/recipes/dog-switcher";
import { IngredientSelector } from "@/components/app/recipes/ingredient-selector";
import { useDogs } from "@/components/providers/dogs-provider";
import { useIngredients } from "@/components/providers/ingredients-provider";
import { useAddDog } from "@/components/providers/add-dog-provider";
import { Bone, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

export function BoneCalculator({ open, onOpenChange }) {
    const { dogs } = useDogs();
    const { ingredients, loading: ingredientsLoading } = useIngredients();
    console.log("All ingredients:", ingredients);
    const { setShowAddDog } = useAddDog();

    const [selectedDog, setSelectedDog] = useState(null);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    // Add this function to handle dialog state reset
    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            // Reset form state when dialog closes
            setSelectedDog(null);
            setSelectedIngredient(null);
        }
        onOpenChange(isOpen);
    };

    // Filter ingredients to only show those with bone content
    const boneIngredients =
        ingredients?.filter(
            (ingredient) =>
                ingredient?.bone_percent && ingredient.bone_percent > 0
        ) || [];
    console.log("Bone ingredients:", boneIngredients);

    // Find the selected dog's details
    const dogDetails = dogs.find((dog) => dog.dog_id === selectedDog);

    // Calculate daily intake and bone requirements
    const calculateBoneRequirements = () => {
        if (!dogDetails || !selectedIngredient?.bone_percent) return null;

        const dailyIntakeGrams = dogDetails.ratios_intake * 1000; // Convert kg to g
        const boneRequirementGrams = dailyIntakeGrams * dogDetails.ratios_bone;
        const ingredientRequiredGrams =
            (boneRequirementGrams / selectedIngredient.bone_percent) * 100;

        return {
            dailyIntake: Math.round(dailyIntakeGrams),
            boneRequirement: Math.round(boneRequirementGrams),
            ingredientRequired: Math.round(ingredientRequiredGrams),
        };
    };

    const requirements = calculateBoneRequirements();

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>Bone calculator</DialogTitle>
                    <DialogDescription className="hidden">
                        Calculate how much bone-in food your dog needs based on
                        their daily requirements.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6">
                    <div className="flex flex-row gap-4 w-full">
                        <div className="flex flex-col gap-4 w-full">
                            <Label>Name</Label>
                            <DogSwitcher
                                dogs={dogs}
                                onSelect={setSelectedDog}
                                onAddDog={() => setShowAddDog(true)}
                                defaultSelectedDog={selectedDog}
                            />
                        </div>

                        <div className="flex flex-col gap-4 w-full h-14">
                            <Label>Select bone ingredient</Label>

                            {ingredientsLoading ? (
                                <div className="flex h-14 items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            ) : boneIngredients.length === 0 ? (
                                <div className="text-sm h-14 text-muted-foreground text-center p-4">
                                    No bone-in ingredients found
                                </div>
                            ) : (
                                <IngredientSelector
                                    ingredients={boneIngredients.map((ing) => ({
                                        id: ing.ingredient_id,
                                        ingredient_id: ing.ingredient_id,
                                        ingredient_name: ing.ingredient_name,
                                        name: ing.ingredient_name,
                                        bone_percent: ing.bone_percent,
                                        ...ing,
                                    }))}
                                    selectedIngredient={selectedIngredient}
                                    onSelect={(ingredient) => {
                                        setSelectedIngredient({
                                            ...ingredient,
                                            ingredient_name:
                                                ingredient.ingredient_name ||
                                                ingredient.name,
                                        });
                                    }}
                                    className="h-14 px-4 text-base"
                                />
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {requirements && selectedIngredient && (
                            <motion.div
                                initial={{
                                    height: 0,
                                    opacity: 0,
                                    marginTop: 0,
                                }}
                                animate={{
                                    height: "auto",
                                    opacity: 1,
                                    marginTop: 16,
                                }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className=""
                            >
                                <div className="py-4 px-5 font-normal bg-muted/8 border border-border rounded-sm flex flex-col gap-2 text-muted-foreground/90">
                                    <p className="text-xl leading-[1.8]">
                                        <span className="text-foreground">
                                            {dogDetails.dog_name}{" "}
                                        </span>
                                        needs{" "}
                                        <span className="text-foreground">
                                            {requirements.dailyIntake.toLocaleString()}
                                            g
                                        </span>{" "}
                                        of food per day, including{" "}
                                        <span className="text-foreground">
                                            {requirements.boneRequirement.toLocaleString()}
                                            g
                                        </span>{" "}
                                        of bone content.
                                    </p>
                                    <p className="text-xl leading-[1.8]">
                                        To meet this requirement, feed
                                        approximately{" "}
                                        <span className=" text-foreground">
                                            {requirements.ingredientRequired.toLocaleString()}
                                            g
                                        </span>{" "}
                                        of{" "}
                                        <span className="text-foreground">
                                            {selectedIngredient.ingredient_name ||
                                                selectedIngredient.name}
                                        </span>
                                        .
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <DialogFooter>
                    <div className="flex flex-row items-center gap-2">
                        <DialogClose asChild>
                            <Button variant="ghost" tabIndex={-1}>
                                Close
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
