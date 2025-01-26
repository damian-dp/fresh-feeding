import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export function IngredientSelector({ ingredients = [], onSelect }) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    // Filter ingredients based on search input
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
        <div className="relative w-full">
            <Input
                value={search}
                onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                    // Small delay to allow click events on options
                    setTimeout(() => {
                        setSearch("");
                        setOpen(false);
                    }, 200);
                }}
                placeholder="Search ingredients..."
                className="w-full"
            />
            {open && (
                <div className="absolute top-full left-0 w-full z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
                    <ScrollArea className="h-[200px]">
                        {filteredIngredients.length === 0 ? (
                            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                No matching ingredients found
                            </div>
                        ) : (
                            <div className="grid">
                                {filteredIngredients.map((ingredient) => (
                                    <button
                                        key={ingredient.id}
                                        onMouseDown={(e) => {
                                            // Prevent onBlur from firing before click
                                            e.preventDefault();
                                        }}
                                        onClick={() => handleSelect(ingredient)}
                                        className={cn(
                                            "flex items-center px-2 py-1.5 text-sm",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "cursor-pointer text-left"
                                        )}
                                    >
                                        {ingredient.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
