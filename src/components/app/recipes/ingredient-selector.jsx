import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function IngredientSelector({
    ingredients = [],
    onSelect,
    selectedIngredient,
    className,
}) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const filteredIngredients = React.useMemo(() => {
        if (!search) return ingredients;
        return ingredients.filter((ingredient) =>
            ingredient.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [ingredients, search]);

    const handleSelect = (ingredient) => {
        onSelect(ingredient);
        setSearch("");
        setOpen(false);
    };

    return (
        <div className="h-14">
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <Input
                    value={
                        search ||
                        (selectedIngredient
                            ? selectedIngredient.ingredient_name
                            : "")
                    }
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ingredients..."
                    className={cn("w-full", className)}
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
                            {filteredIngredients.map((ingredient) => (
                                <button
                                    key={ingredient.id}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelect(ingredient)}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 text-sm",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "cursor-pointer text-left w-full"
                                    )}
                                >
                                    <span>
                                        {ingredient.ingredient_name ||
                                            ingredient.name}
                                    </span>
                                    {ingredient.bone_percent && (
                                        <span className="text-muted-foreground">
                                            {ingredient.bone_percent}% bone
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}
