import { BadgeStack } from "@/components/ui/badge-stack";
import { DogIcon, Percent, Target } from "lucide-react";
import { BatchCalculator } from "./batch-calculator";

export function RecipeSheetView({ recipe, dogs, getDogName }) {
    return (
        <>
            <div className="p-8 flex flex-row justify-between w-full border-b border-border">
                <BadgeStack
                    variant="default"
                    icon={<DogIcon />}
                    label={getDogName(recipe.dog_id)}
                    sublabel="Created for"
                    flipped={true}
                />
                <BadgeStack
                    variant="default"
                    icon={<Percent />}
                    label={(() => {
                        const dog = dogs.find(
                            (d) => d.dog_id === recipe.dog_id
                        );
                        if (!dog) return "Unknown";
                        const dailyIntake = Math.round(
                            dog.weight_metric * 1000 * (dog.ratios_intake / 100)
                        );
                        return (
                            <>
                                {dailyIntake}g{" "}
                                <span className="text-muted-foreground">
                                    / {dog.ratios_intake}%
                                </span>
                            </>
                        );
                    })()}
                    sublabel="Daily intake"
                    flipped={true}
                />
                <BadgeStack
                    variant="default"
                    icon={<Target />}
                    label={(() => {
                        const dog = dogs.find(
                            (d) => d.dog_id === recipe.dog_id
                        );
                        return dog
                            ? dog.goal === "maintain"
                                ? "Maintain weight"
                                : dog.goal === "gain"
                                ? "Gain weight"
                                : dog.goal === "lose"
                                ? "Lose weight"
                                : "Custom goal"
                            : "Unknown";
                    })()}
                    sublabel="Goal"
                    flipped={true}
                />
            </div>
            <BatchCalculator
                recipe={recipe}
                dogs={dogs}
                getDogName={getDogName}
            />
        </>
    );
}
