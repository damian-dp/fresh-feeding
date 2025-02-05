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
} from "lucide-react";
import { IngredientSelector } from "./ingredient-selector";
import { useState } from "react";
import { BadgeStack } from "@/components/ui/badge-stack";

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
}) {
    return (
        <div
            className={`flex flex-col gap-6 ${
                category === "misc" ? "md:col-span-2" : ""
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
                            <Brain />
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
                        category === "misc"
                            ? "Toppers, dairy, herbs, etc"
                            : null
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
                    />
                )}

                {isActive && (
                    <div className="">
                        {isLoading ? (
                            <LoadingState />
                        ) : (
                            <IngredientSelector
                                ingredients={ingredients}
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

function IngredientList({ items, onRemoveItem, category, mode }) {
    return (
        <div className={items.length > 0 ? "border-t" : ""}>
            {items.map((item) => {
                // Handle both create and edit mode item structures
                const itemId = mode === "create" ? item.id : item.ingredient_id;
                const itemName =
                    mode === "create"
                        ? item.name
                        : item.ingredients.ingredient_name;

                return (
                    <div
                        key={itemId}
                        className="flex items-center justify-between border-b py-2"
                    >
                        <span>{itemName}</span>
                        {mode !== "view" && (
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => onRemoveItem(itemId, category)}
                            >
                                <Trash className="" />
                            </Button>
                        )}
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
