import { useState } from "react";
import { Search, ImageIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIngredients } from "@/components/providers/ingredients-provider";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IngredientDatabasePage() {
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { ingredients, loading } = useIngredients();

    const filteredIngredients = ingredients
        .map((ingredient) => {
            // Check if ingredient name matches (case-insensitive)
            const nameMatch = ingredient.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            // Check if any nutrients match (case-insensitive)
            const nutrientMatch = ingredient.nutrients.some((nutrient) =>
                nutrient.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Return ingredient with match type for sorting
            return {
                ...ingredient,
                matchType: nameMatch
                    ? "name"
                    : nutrientMatch
                    ? "nutrient"
                    : null,
            };
        })
        // Filter out non-matches
        .filter((ingredient) => ingredient.matchType)
        // Sort by match type (name matches first)
        .sort((a, b) => {
            if (a.matchType === "name" && b.matchType === "nutrient") return -1;
            if (a.matchType === "nutrient" && b.matchType === "name") return 1;
            return 0;
        });

    const ImagePlaceholder = ({ size = "small" }) => (
        <div
            className={cn(
                "bg-muted flex items-center justify-center rounded",
                size === "small" ? "w-8 h-8" : "w-32 h-32"
            )}
        >
            <ImageIcon
                className={cn(
                    "text-muted-foreground",
                    size === "small" ? "h-4 w-4" : "h-8 w-8"
                )}
            />
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Ingredient database</h1>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search ingredients or nutrients..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        {filteredIngredients.length} results
                    </div>
                )}
            </div>

            <div className="grid grid-cols-[1fr,auto] gap-6">
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Nutrients</TableHead>
                                <TableHead>Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredIngredients.map(
                                ({ matchType, ...ingredient }) => (
                                    <TableRow
                                        key={ingredient.id}
                                        className={cn(
                                            "cursor-pointer hover:bg-muted",
                                            selectedIngredient?.id ===
                                                ingredient.id && "bg-muted",
                                            // Highlight matching nutrients
                                            matchType === "nutrient" &&
                                                "bg-muted/50"
                                        )}
                                        onClick={() =>
                                            setSelectedIngredient(ingredient)
                                        }
                                    >
                                        <TableCell className="flex items-center gap-3">
                                            {ingredient.thumbnail_image ? (
                                                <img
                                                    src={
                                                        ingredient.thumbnail_image
                                                    }
                                                    alt={ingredient.name}
                                                    className="w-8 h-8 rounded object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display =
                                                            "none";
                                                        e.target.nextSibling.style.display =
                                                            "flex";
                                                    }}
                                                />
                                            ) : (
                                                <ImagePlaceholder size="small" />
                                            )}
                                            {ingredient.name}
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate">
                                            {ingredient.nutrients.length > 0
                                                ? ingredient.nutrients
                                                      .map((n) => (
                                                          <span
                                                              key={n.id}
                                                              className={cn(
                                                                  matchType ===
                                                                      "nutrient" &&
                                                                      n.name
                                                                          .toLowerCase()
                                                                          .includes(
                                                                              searchQuery.toLowerCase()
                                                                          ) &&
                                                                      "font-medium text-primary"
                                                              )}
                                                          >
                                                              {n.name}
                                                          </span>
                                                      ))
                                                      .slice(0, 3)
                                                      .reduce(
                                                          (prev, curr, index) =>
                                                              index === 0
                                                                  ? [curr]
                                                                  : [
                                                                        ...prev,
                                                                        ", ",
                                                                        curr,
                                                                    ],
                                                          []
                                                      )
                                                : "No nutrients"}
                                            {ingredient.nutrients.length > 3 &&
                                                ` +${
                                                    ingredient.nutrients
                                                        .length - 3
                                                }`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {ingredient.category}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div
                    className={cn(
                        "border rounded-lg transition-all duration-300 ease-in-out overflow-hidden",
                        selectedIngredient
                            ? "w-[400px] opacity-100"
                            : "w-0 opacity-0"
                    )}
                >
                    <div className="w-[400px]">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Ingredient Details
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedIngredient(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {selectedIngredient && (
                                <>
                                    <div className="flex items-center gap-4">
                                        {selectedIngredient.thumbnail_image ? (
                                            <img
                                                src={
                                                    selectedIngredient.thumbnail_image
                                                }
                                                alt={selectedIngredient.name}
                                                className="w-32 h-32 rounded-lg object-cover"
                                                onError={(e) => {
                                                    e.target.style.display =
                                                        "none";
                                                    e.target.nextSibling.style.display =
                                                        "flex";
                                                }}
                                            />
                                        ) : (
                                            <ImagePlaceholder size="large" />
                                        )}
                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                {selectedIngredient.name}
                                            </h2>
                                            <Badge
                                                variant="secondary"
                                                className="mt-2"
                                            >
                                                {selectedIngredient.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            {selectedIngredient.description}
                                        </p>
                                    </div>

                                    {selectedIngredient?.highlights &&
                                        selectedIngredient.highlights.length >
                                            0 && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">
                                                    Fresh feeding highlights
                                                </h3>
                                                <div className="flex gap-2 flex-wrap">
                                                    {selectedIngredient.highlights
                                                        .split(",")
                                                        .filter(Boolean)
                                                        .map((highlight) => (
                                                            <Badge
                                                                key={highlight}
                                                                variant="outline"
                                                                className="bg-green-50"
                                                            >
                                                                {highlight.trim()}
                                                            </Badge>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center justify-between">
                                            Nutrients
                                            <Badge variant="secondary">
                                                {
                                                    selectedIngredient.nutrients
                                                        .length
                                                }{" "}
                                                total
                                            </Badge>
                                        </h3>
                                        <ScrollArea className="h-[120px]">
                                            <div className="flex gap-2 flex-wrap">
                                                {selectedIngredient.nutrients.map(
                                                    (nutrient) => (
                                                        <Badge
                                                            key={nutrient.id}
                                                            variant="outline"
                                                            className={cn(
                                                                "cursor-help",
                                                                nutrient.group ===
                                                                    "Vitamins" &&
                                                                    "bg-blue-50",
                                                                nutrient.group ===
                                                                    "Minerals" &&
                                                                    "bg-green-50"
                                                            )}
                                                            title={
                                                                nutrient.scientific_name
                                                            }
                                                        >
                                                            {nutrient.name}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
