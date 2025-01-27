import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecipes } from "@/components/providers/recipes-provider";

function BatchInputs({
    batchSize,
    numberOfDays,
    onBatchSizeChange,
    onDaysChange,
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-4">
                <div className="flex-1 relative">
                    <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={batchSize}
                        onChange={(e) => onBatchSizeChange(e.target.value)}
                        placeholder="1"
                        className="pr-8"
                    />
                    <span className="absolute right-3 top-[50%] -translate-y-[50%] text-sm text-muted-foreground pointer-events-none">
                        Kg
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                        Batch size
                    </p>
                </div>
                <span className="text-muted-foreground">or</span>
                <div className="flex-1 relative">
                    <Input
                        type="number"
                        min="1"
                        step="1"
                        value={numberOfDays}
                        onChange={(e) => onDaysChange(e.target.value)}
                        placeholder="10"
                        className="pr-12"
                    />
                    <span className="absolute right-3 top-[50%] -translate-y-[50%] text-sm text-muted-foreground pointer-events-none">
                        Days
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                        Duration
                    </p>
                </div>
            </div>
        </div>
    );
}

function BatchSummary({ batchSize, numberOfDays, recipe, dogs, getDogName }) {
    const dog = dogs.find((d) => d.dog_id === recipe.dog_id);
    const dailyIntake = dog
        ? Math.round(dog.weight_metric * 1000 * (dog.ratios_intake / 100))
        : 0;

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
                This batch will last approximately {numberOfDays} days based on{" "}
                {getDogName(recipe.dog_id)}'s daily intake of {dailyIntake}g.
            </p>
        </div>
    );
}

export function BatchCalculator({ recipe, dogs, getDogName }) {
    const { updateRecipe } = useRecipes();
    const [batchSize, setBatchSize] = useState(recipe?.batch_size || 1);
    const [numberOfDays, setNumberOfDays] = useState(1);

    useEffect(() => {
        const dog = dogs.find((d) => d.dog_id === recipe.dog_id);
        if (dog) {
            const dailyIntake =
                (dog.weight_metric * 1000 * (dog.ratios_intake / 100)) / 1000;
            setNumberOfDays(Math.round(batchSize / dailyIntake));
        }
    }, [recipe, dogs, batchSize]);

    const handleBatchSizeChange = (value) => {
        const newBatchSize = Number(parseFloat(value).toFixed(1)) || 0;
        setBatchSize(newBatchSize);

        const dog = dogs.find((d) => d.dog_id === recipe.dog_id);
        if (dog) {
            const dailyIntake =
                (dog.weight_metric * 1000 * (dog.ratios_intake / 100)) / 1000;
            const days = Math.round(newBatchSize / dailyIntake);
            setNumberOfDays(days);
            updateRecipe(recipe.recipe_id, { batch_size: newBatchSize });
        }
    };

    const handleDaysChange = (value) => {
        const newDays = parseInt(value) || 0;
        setNumberOfDays(newDays);

        const dog = dogs.find((d) => d.dog_id === recipe.dog_id);
        if (dog) {
            const dailyIntake =
                (dog.weight_metric * 1000 * (dog.ratios_intake / 100)) / 1000;
            const newBatchSize = Number((dailyIntake * newDays).toFixed(1));
            setBatchSize(newBatchSize);
            updateRecipe(recipe.recipe_id, { batch_size: newBatchSize });
        }
    };

    return (
        <div className="flex flex-col gap-6 p-8 pb-10 border-b border-border">
            <p className="font-medium">Batch calculator</p>
            <div className="grid grid-cols-2 gap-8 w-full">
                <BatchInputs
                    batchSize={batchSize}
                    numberOfDays={numberOfDays}
                    onBatchSizeChange={handleBatchSizeChange}
                    onDaysChange={handleDaysChange}
                />
                <BatchSummary
                    batchSize={batchSize}
                    numberOfDays={numberOfDays}
                    recipe={recipe}
                    dogs={dogs}
                    getDogName={getDogName}
                />
            </div>
        </div>
    );
}
