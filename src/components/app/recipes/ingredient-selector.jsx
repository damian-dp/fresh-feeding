import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CommandItem } from "@/components/ui/command";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
} from "@/components/ui/command";

export function IngredientSelector({
    ingredients,
    onSelect,
    category,
    existingIngredients,
}) {
    console.log("IngredientSelector received category:", category);

    // Helper functions - moved to top
    const getIngredientName = (ing) => {
        console.log("Ingredient structure:", ing); // Debug log
        return (
            ing.ingredient_name || ing.ingredients?.ingredient_name || "Unknown"
        );
    };

    const getBonePercent = (ing) => {
        const bonePercent =
            ing.bone_percent || ing.ingredients?.bone_percent || 0;
        console.log("getBonePercent for:", ing.name, "is:", bonePercent);
        return bonePercent;
    };

    const hasBoneContent = (ing) => {
        const bonePercent = getBonePercent(ing);
        const hasBone = bonePercent > 0;
        console.log("hasBoneContent for:", ing.name, "is:", hasBone);
        return hasBone;
    };

    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    // Log ingredients to check structure
    React.useEffect(() => {
        console.log("All ingredients:", ingredients);
    }, [ingredients]);

    // Log existing ingredients when they change
    React.useEffect(() => {
        console.log("Category:", category);
        console.log("Existing ingredients:", existingIngredients);
        if (existingIngredients?.length > 0) {
            console.log(
                "Existing bone ingredients:",
                existingIngredients.filter((ing) => hasBoneContent(ing))
            );
        }
    }, [existingIngredients, category]);

    const filteredIngredients = React.useMemo(() => {
        if (!search) return ingredients;
        return ingredients.filter((ingredient) =>
            getIngredientName(ingredient)
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [ingredients, search]);

    // Check if we already have a bone ingredient
    const existingBoneIngredient = existingIngredients?.some((ing) => {
        const hasBone = hasBoneContent(ing);
        console.log(
            "Checking existing ingredient:",
            ing.name,
            "Has bone:",
            hasBone
        );
        return hasBone;
    });

    // Determine if an ingredient should be disabled
    const isDisabled = (ingredient) => {
        if (category !== "meat_and_bone") {
            console.log("Not meat_and_bone category:", category);
            return false;
        }

        const shouldDisable =
            existingBoneIngredient && hasBoneContent(ingredient);
        console.log(
            "Checking if disabled for",
            ingredient.name,
            "category:",
            category,
            "existingBoneIngredient:",
            existingBoneIngredient,
            "hasBone:",
            hasBoneContent(ingredient),
            "isDisabled:",
            shouldDisable
        );
        return shouldDisable;
    };

    const handleSelect = (ingredient) => {
        if (isDisabled(ingredient)) {
            return;
        }
        onSelect(ingredient);
        setSearch("");
        setOpen(false);
    };

    return (
        <div className="">
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ingredients..."
                    className="w-full"
                    onClick={() => setOpen(true)}
                />
                <PopoverTrigger className="w-full -translate-y-4" />
                <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] p-0 rounded-sm max-h-40 overflow-y-auto"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    {filteredIngredients.length === 0 ? (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                            No matching ingredients found
                        </div>
                    ) : (
                        <div className="grid">
                            {filteredIngredients.map((ingredient) => {
                                const disabled = isDisabled(ingredient);
                                return (
                                    <button
                                        key={ingredient.id}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelect(ingredient)}
                                        className={cn(
                                            "flex items-center px-2 py-1.5 text-sm",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "cursor-pointer text-left",
                                            disabled && [
                                                "opacity-50",
                                                "cursor-not-allowed",
                                                "hover:bg-transparent",
                                                "hover:text-muted-foreground",
                                            ]
                                        )}
                                        disabled={disabled}
                                    >
                                        {ingredient.name}
                                        {hasBoneContent(ingredient) &&
                                            ` (${getBonePercent(
                                                ingredient
                                            )}% bone)`}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}
