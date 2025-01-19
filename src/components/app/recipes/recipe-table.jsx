import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertTriangleIcon,
    BoneIcon,
    CheckIcon,
    DogIcon,
    MoreHorizontal,
    Pencil,
    Trash2,
} from "lucide-react";
import { useRecipes } from "@/components/providers/recipes-provider";
import { useDogs } from "@/components/providers/dogs-provider";
import { formatDate } from "@/lib/utils";
import { BadgeStack } from "@/components/ui/badge-stack";

export function RecipeTable({
    // Configurable columns
    showRecipeName = true,
    showDog = true,
    showIngredients = true,
    showNutritionStatus = true,
    showActions = true,
    // Optional limit of entries to show
    limit,
    // Optional callback for delete action
    onDelete,
    // Optional callback for edit action
    onEdit,
}) {
    const { recipes } = useRecipes();
    const { dogs, loading } = useDogs();

    // Get dog name helper function
    const getDogName = (dogId) => {
        const dog = dogs.find((d) => d.dog_id === dogId);
        return dog ? dog.dog_name : "Unknown Dog";
    };

    // Format ingredients helper function
    const formatIngredients = (ingredients) => {
        if (
            !ingredients ||
            !Array.isArray(ingredients) ||
            ingredients.length === 0
        ) {
            return "No ingredients";
        }

        const names = ingredients
            .filter((ing) => ing?.ingredients?.ingredient_name)
            .map((ing) => ing.ingredients.ingredient_name);

        if (names.length === 0) return "No ingredients";

        // Show first 8 ingredients + count of remaining
        if (names.length <= 7) {
            return names.join(", ");
        }

        const remaining = names.length - 7;
        return (
            <>
                <span className="text-foreground">Ingredients: </span>
                {names.slice(0, 7).join(", ")}
                <span className="text-foreground">
                    {" "}
                    +{remaining}{" "}
                    {remaining === 1 ? "ingredient." : "ingredients."}
                </span>
            </>
        );
    };

    // Get visible recipes based on limit
    const visibleRecipes = limit ? recipes.slice(0, limit) : recipes;

    // Handle recipe actions
    const handleDeleteRecipe = (recipeId) => {
        if (onDelete) {
            onDelete(recipeId);
        }
    };

    const handleEditRecipe = (recipeId) => {
        if (onEdit) {
            onEdit(recipeId);
        }
    };

    // Get visible columns
    const columns = [
        showRecipeName && {
            id: "name",
            header: "Recipe Name",
            cell: (recipe) => (
                <TableCell
                    key={`${recipe.recipe_id}-name`}
                    className="font-medium"
                >
                    <p className="font-medium mb-0.5 whitespace-nowrap">
                        {recipe.recipe_name}
                    </p>
                    <p className="font-normal text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(recipe.created_at)}
                    </p>
                </TableCell>
            ),
        },
        showDog && {
            id: "dog",
            header: "Dog",
            cell: (recipe) => {
                // Find the dog for this recipe
                const dog = dogs.find((d) => d.dog_id === recipe.dog_id);

                return (
                    <TableCell className="" key={`${recipe.recipe_id}-dog`}>
                        <BadgeStack
                            variant="default"
                            icon={<DogIcon />}
                            label={getDogName(recipe.dog_id)}
                            sublabel={
                                dog
                                    ? `Daily intake: ${Math.round(
                                          dog.weight_metric *
                                                1000 *
                                                (dog.ratios_intake / 100)
                                        )}g`
                                    : ""
                            }
                            flipped={false}
                            showSublabel={!!dog}
                        />
                    </TableCell>
                );
            },
        },
        showIngredients && {
            id: "ingredients",
            header: "Ingredients",
            cell: (recipe) => (
                <TableCell
                    key={`${recipe.recipe_id}-ingredients`}
                    className="text-xs text-muted-foreground leading-[1.15rem]"
                >
                    {formatIngredients(recipe.recipe_ingredients)}
                </TableCell>
            ),
        },
        showNutritionStatus && {
            id: "nutrition-status",
            header: "Nutrition Status",
            cell: (recipe) => {
                // Find the dog for this recipe
                const nutritionStatus = recipe.isNutritionallyBalanced;

                return (
                    <TableCell className="" key={`${recipe.recipe_id}-nutrition-status`}>
                        {nutritionStatus ? (
                            <BadgeStack
                                variant="success"
                                icon={<CheckIcon />}
                                label="Likely balanced"
                                sublabel="Nutrition status"
                                flipped={true}
                            />
                        ) : (
                            <BadgeStack
                                variant="warning"
                                icon={<AlertTriangleIcon />}
                                label="Possible deficit"
                                sublabel="Nutrition status"
                                flipped={true}
                            />
                        )}
                    </TableCell>
                );
            },
        },
        showActions && {
            id: "actions",
            header: "",
            cell: (recipe) => (
                <TableCell key={`${recipe.recipe_id}-actions`}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    handleEditRecipe(recipe.recipe_id)
                                }
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                    handleDeleteRecipe(recipe.recipe_id)
                                }
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            ),
        },
    ].filter(Boolean);

    return (
        <Table>
            {/* <TableHeader>
                <TableRow>
                    {columns.map(
                        (column) =>
                            column && (
                                <TableHead
                                    key={column.id}
                                    className={
                                        column.id === "ingredients"
                                            ? "max-w-[400px]"
                                            : column.id === "actions"
                                            ? "w-[70px]"
                                            : undefined
                                    }
                                >
                                    {column.header}
                                </TableHead>
                            )
                    )}
                </TableRow>
            </TableHeader> */}
            <TableBody>
                {visibleRecipes.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={columns.length}
                            className="text-center h-24"
                        >
                            No recipes found
                        </TableCell>
                    </TableRow>
                ) : (
                    visibleRecipes.map((recipe) => (
                        <TableRow key={recipe.recipe_id}>
                            {columns.map(
                                (column) => column && column.cell(recipe)
                            )}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
