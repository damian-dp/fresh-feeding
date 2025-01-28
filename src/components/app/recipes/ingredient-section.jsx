import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    PlusCircle,
    X,
    Loader2,
    Percent,
    Bone,
    Pill,
    Brain,
    Leaf,
    Plus,
    Trash,
    Heart,
} from "lucide-react";
import { IngredientSelector } from "./ingredient-selector";
import { useState } from "react";
import { BadgeStack } from "@/components/ui/badge-stack";
import { Input } from "@/components/ui/input";

// Move the sections configuration here
export const INGREDIENT_SECTIONS = {
    meat_and_bone: {
        title: "Muscle Meat & Bone",
        emptyStateText: "Add muscle meat and bone ingredients",
        category: 1,
    },
    plant_matter: {
        title: "Plant Matter",
        emptyStateText: "Add plant matter ingredients",
        category: 2,
    },
    liver: {
        title: "Liver",
        emptyStateText: "Add liver ingredients",
        category: 3,
    },
    secreting_organs: {
        title: "Secreting Organs",
        emptyStateText: "Add secreting organ ingredients",
        category: 4,
    },
    misc: {
        title: "Misc",
        emptyStateText: "Add miscellaneous ingredients",
        category: 5,
    },
};

// Helper function to get ingredients by category
export const getIngredientsByCategory = (ingredients, categoryName) => {
    if (!ingredients) return [];

    return ingredients.filter((ing) => {
        switch (categoryName) {
            case "meat_and_bone":
                return ing.category === 1;
            case "plant_matter":
                return ing.category === 2;
            case "liver":
                return ing.category === 3;
            case "secreting_organs":
                return ing.category === 4;
            case "misc":
                return ing.category === 5;
            default:
                return false;
        }
    });
};

export function IngredientSection({
    title,
    items,
    onRemoveItem,
    onAddItem,
    category,
    emptyStateText,
    mode,
    isActive,
    onToggleActive,
    ingredients,
    isLoading,
    onUpdateQuantity,
}) {
    // Calculate total percentage for the category
    const totalPercentage =
        items.reduce((sum, item) => sum + (item.quantity || 0), 0) * 100;

    // Determine if the total is valid (100%)
    const isValidTotal = Math.abs(totalPercentage - 100) < 0.01; // Using small epsilon for float comparison

    // Only show percentage for non-misc categories
    const showPercentage = category !== "misc";

    // Get the IDs of currently selected ingredients
    const selectedIds = items.map((item) =>
        mode === "edit" ? item.ingredient_id : item.id
    );

    // Filter out already selected ingredients
    const availableIngredients = ingredients?.filter(
        (ing) => !selectedIds.includes(ing.id)
    );

    return (
        <div
            className={`flex flex-col gap-6 ${
                category === "misc" ? "col-span-2" : ""
            }`}
        >
            <div className="flex items-center justify-between">
                <BadgeStack
                    className="text-base"
                    variant={
                        category === "meat_and_bone"
                            ? "meat"
                            : category === "plant_matter"
                            ? "plant"
                            : category === "liver"
                            ? "liver"
                            : category === "secreting_organs"
                            ? "organ"
                            : "default"
                    }
                    icon={
                        category === "meat_and_bone" ? (
                            <Bone />
                        ) : category === "plant_matter" ? (
                            <Leaf />
                        ) : category === "liver" ? (
                            <Heart />
                        ) : category === "secreting_organs" ? (
                            <Brain />
                        ) : (
                            <Pill />
                        )
                    }
                    label={
                        category === "meat_and_bone"
                            ? "Meat and bone"
                            : category === "plant_matter"
                            ? "Plant matter"
                            : category === "liver"
                            ? "Liver"
                            : category === "secreting_organs"
                            ? "Secreting organs"
                            : "Other ingredients"
                    }
                    sublabel={
                        showPercentage ? (
                            mode === "create" ? null : (
                                <span
                                    className={
                                        mode === "edit" && !isValidTotal
                                            ? "text-destructive"
                                            : ""
                                    }
                                >
                                    {`${Math.round(totalPercentage)}% / 100%`}
                                </span>
                            )
                        ) : (
                            "Toppers, dairy, herbs, etc"
                        )
                    }
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onToggleActive(category)}
                    disabled={mode === "view"}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div
                className={`flex flex-col ${
                    items.length > 0 ? "h-auto gap-4" : "h-52"
                }`}
            >
                {items.length === 0 && !isActive ? (
                    <EmptyState text={emptyStateText} />
                ) : (
                    <IngredientList
                        items={items}
                        onRemoveItem={onRemoveItem}
                        category={category}
                        mode={mode}
                        onUpdateQuantity={onUpdateQuantity}
                    />
                )}

                {isActive && (
                    <div className="">
                        {isLoading ? (
                            <LoadingState />
                        ) : (
                            <IngredientSelector
                                ingredients={availableIngredients}
                                onSelect={(ingredient) =>
                                    onAddItem(ingredient, category)
                                }
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="flex flex-col h-full items-center justify-center rounded-md border border-border p-8 text-center animate-in fade-in-50">
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    );
}

function IngredientList({
    items,
    onRemoveItem,
    category,
    mode,
    onUpdateQuantity,
}) {
    return (
        <div className={items.length > 0 ? "border-t" : ""}>
            {items.map((item) => {
                console.log("Item in list:", item);

                // Handle both create and edit mode item structures
                const itemId = mode === "edit" ? item.ingredient_id : item.id;

                console.log("Using itemId:", itemId, "for mode:", mode);

                const itemName =
                    mode === "edit"
                        ? item.ingredients?.ingredient_name
                        : item.name;

                return (
                    <div
                        key={itemId}
                        className="flex items-center justify-between border-b py-3"
                    >
                        <span>{itemName}</span>
                        <div className="flex items-center gap-2">
                            {mode === "edit" && (
                                <div className="relative flex items-center gap-2">
                                    <Input
                                        type="text"
                                        value={
                                            // Only show 0 if it's not focused
                                            document.activeElement ===
                                            document.getElementById(
                                                `quantity-${itemId}`
                                            )
                                                ? Math.round(
                                                      (item.quantity || 0) * 100
                                                  ) || ""
                                                : Math.round(
                                                      (item.quantity || 0) * 100
                                                  )
                                        }
                                        id={`quantity-${itemId}`}
                                        onChange={(e) => {
                                            // Allow empty or numbers only
                                            const value = e.target.value;
                                            if (
                                                value === "" ||
                                                /^\d+$/.test(value)
                                            ) {
                                                const newPercentage =
                                                    value === ""
                                                        ? 0
                                                        : Math.min(
                                                              parseInt(
                                                                  value,
                                                                  10
                                                              ),
                                                              100
                                                          ) / 100;
                                                onUpdateQuantity(
                                                    itemId,
                                                    newPercentage
                                                );
                                            }
                                        }}
                                        onBlur={(e) => {
                                            // If empty on blur, set to 0
                                            if (e.target.value === "") {
                                                onUpdateQuantity(itemId, 0);
                                            }
                                        }}
                                        className="w-16 text-left"
                                        maxLength={3}
                                    />
                                    <span className="absolute right-3 text-muted-foreground">
                                        %
                                    </span>
                                </div>
                            )}
                            {(mode === "edit" || mode === "create") && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                        console.log(
                                            "Removing item with id:",
                                            itemId,
                                            "category:",
                                            category
                                        );
                                        onRemoveItem(itemId, category);
                                    }}
                                >
                                    <Trash className="" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin" />
        </div>
    );
}
