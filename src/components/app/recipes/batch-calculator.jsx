import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecipes } from "@/components/providers/recipes-provider";
import { getCurrentIntakePercent } from "@/utils/feeding";

function BatchInputs({
  batchSize,
  numberOfDays,
  onBatchSizeChange,
  onDaysChange,
}) {
  const handleBatchInput = (value) => {
    const cleanValue = value
      .replace(/[^0-9.]/g, "")
      .replace(/^0+/, "")
      .replace(/^\./, "0.")
      .replace(/(\..*)\./g, "$1")
      .replace(/(\.[\d])\d+/, "$1");

    onBatchSizeChange(cleanValue === "" ? null : cleanValue);
  };

  const handleDaysInput = (value) => {
    const cleanValue = value.replace(/[^0-9]/g, "").replace(/^0+/, "");
    onDaysChange(cleanValue === "" ? null : cleanValue);
  };

  const handleInputBlur = () => {
    // If either input is empty, set back to original value
    if (!batchSize || batchSize === "" || batchSize === null) {
      onDaysChange(numberOfDays);
    }

    if (!numberOfDays || numberOfDays === "" || numberOfDays === null) {
      onBatchSizeChange(batchSize);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full justify-between">
      <div className="flex flex-row items-center gap-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            inputMode="decimal"
            value={
              batchSize === "" || batchSize === null ? "" : batchSize.toString()
            }
            onChange={(e) => handleBatchInput(e.target.value)}
            onBlur={handleInputBlur}
            className="pr-8"
          />
          <span className="absolute right-3 top-[50%] -translate-y-[50%] text-sm text-muted-foreground pointer-events-none">
            Kg
          </span>
        </div>
        <span className="text-muted-foreground">or</span>
        <div className="flex-1 relative">
          <Input
            type="text"
            inputMode="numeric"
            value={
              numberOfDays === "" || numberOfDays === null
                ? ""
                : numberOfDays.toString()
            }
            onChange={(e) => handleDaysInput(e.target.value)}
            onBlur={handleInputBlur}
            className="pr-12"
          />
          <span className="absolute right-3 top-[50%] -translate-y-[50%] text-sm text-muted-foreground pointer-events-none">
            Days
          </span>
        </div>
      </div>
      <p className="text-sm font-regular text-muted-foreground">
        Quantities below will make{" "}
        <span className="text-foreground">{batchSize}kg.</span>
      </p>
    </div>
  );
}

function BatchSummary({ batchSize, numberOfDays, recipe, dogs }) {
  const dog = dogs.find((d) => d.dog_id === recipe.dog_id);
  const dailyIntake = dog
    ? Math.round(
        dog.weight_metric * 1000 * (getCurrentIntakePercent(dog) / 100)
      )
    : 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xl text-muted-foreground leading-relaxed -mt-2 -mb-1">
        Preparing <span className="text-foreground">{batchSize}kg</span> of this
        recipe would keep {dog?.dog_name || "Unknown Dog"} fed for{" "}
        <span className="text-foreground">{numberOfDays} days</span>, when
        feeding <span className="text-foreground">{dailyIntake}g</span> per day.
      </p>
    </div>
  );
}

export function BatchCalculator({
  recipe,
  dogs,
  batchSize,
  numberOfDays,
  onBatchSizeChange,
  onDaysChange,
}) {
  return (
    <div className="flex flex-col gap-6 p-8 pb-10 border-t border-border">
      <p className="font-medium">Batch calculator</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
        <BatchInputs
          batchSize={batchSize ?? ""}
          numberOfDays={numberOfDays ?? ""}
          onBatchSizeChange={onBatchSizeChange}
          onDaysChange={onDaysChange}
        />
        <BatchSummary
          batchSize={batchSize}
          numberOfDays={numberOfDays}
          recipe={recipe}
          dogs={dogs}
        />
      </div>
    </div>
  );
}
