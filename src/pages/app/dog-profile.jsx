import { useParams } from "react-router-dom";
import { useDogs } from "@/components/providers/dogs-provider";
import {
    Bone,
    Brain,
    CheckCheck,
    CheckIcon,
    Heart,
    Loader2,
    PartyPopper,
    Pencil,
    Scale,
    Weight,
} from "lucide-react";
import Dog from "@/assets/icons/dog";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RecipeTable } from "@/components/app/recipes/recipe-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculateAge } from "@/components/app/dashboard/dog-profile-card";
import { BadgeStack } from "@/components/ui/badge-stack";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { supabase } from "@/lib/supabase";
import { EditDogProfileDialog } from "@/components/app/dashboard/edit-dog-profile-dialog";
import { RecipeSheet } from "@/components/app/recipes/recipe-sheet";
import { useRecipes } from "@/components/providers/recipes-provider";
import { EditDogRatiosDialog } from "@/components/app/dashboard/edit-dog-ratios-dialog";
import DogOutline from "@/assets/icons/dog-outline";
import Party from "@/assets/icons/party";
import Target from "@/assets/icons/target";
import ScaleUnbalanced2 from "@/assets/icons/scale-unbalanced-2";
import FoodScale from "@/assets/icons/food-scale";
import Percentage from "@/assets/icons/percentage";
import Ham from "@/assets/icons/ham";
import Leaf from "@/assets/icons/leaf";
import Liver5 from "@/assets/icons/liver-5";
const formatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
};

export function DogProfilePage() {
    const { dogId } = useParams();
    const { dogs, loading } = useDogs();
    const { recipes } = useRecipes();
    const textareaRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showEditRatiosDialog, setShowEditRatiosDialog] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Local state for notes
    const [notes, setNotes] = useState("");
    const [saveStatus, setSaveStatus] = useState("idle"); // "typing", "saving", "saved", "idle"

    // Update notes when dog changes
    useEffect(() => {
        const currentDog = dogs.find((d) => d.dog_id === parseInt(dogId));
        setNotes(currentDog?.dog_notes || "");
    }, [dogId, dogs]);

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Auto-resize textarea
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    // Adjust height on content change
    useEffect(() => {
        adjustTextareaHeight();
    }, [notes]);

    // Debounced save function
    const saveNotes = useCallback(
        async (value) => {
            try {
                setSaveStatus("saving");
                const parsedId = parseInt(dogId);
                const currentDog = dogs.find((d) => d.dog_id === parsedId);

                if (!currentDog) {
                    throw new Error("Dog not found");
                }

                const { error, data } = await supabase
                    .from("dogs")
                    .update({
                        dog_notes: value,
                    })
                    .eq("dog_id", parsedId)
                    .select("*")
                    .maybeSingle();

                if (error) {
                    console.error("Update error:", error);
                    throw error;
                }

                if (data === null) {
                    throw new Error("No data returned from update");
                }

                // Update local state with the returned data
                setNotes(data.dog_notes);
                setSaveStatus("saved");

                // Clear any existing timeout
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                }

                // Set new timeout to clear the saved status
                saveTimeoutRef.current = setTimeout(() => {
                    setSaveStatus("idle");
                }, 4000);
            } catch (error) {
                console.error("Error saving notes:", error);
                setSaveStatus("error");
            }
        },
        [dogId, dogs, saveTimeoutRef]
    );

    // Debounce the save function (1 second delay)
    const debouncedSave = useDebounce(saveNotes, 1000);

    // Handle text changes
    const handleNotesChange = (e) => {
        const value = e.target.value;
        setNotes(value);
        setSaveStatus("typing");
        debouncedSave(value);
    };

    // Convert dogId to number since it comes as string from URL params
    const dog = dogs.find((dog) => dog.dog_id === parseInt(dogId));

    // Add effect to log when recipes changes
    useEffect(() => {
        // console.log("DogProfilePage recipes changed:", recipes);
    }, [recipes]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!dog) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
                <div className="text-center h-72 text-muted flex flex-col gap-4 items-center justify-center">
                    <Dog width={85} height={85} />
                    <p className="text-lg text-muted-foreground/60 leading-6">
                        Dog not found
                    </p>
                </div>
            </div>
        );
    }

    const intakeGrams = Math.round(
        dog.weight_metric * 1000 * (dog.ratios_intake / 100)
    );

    const meatGrams = Math.round(intakeGrams * dog.ratios_muscle_meat);
    const plantGrams = Math.round(intakeGrams * dog.ratios_plant_matter);
    const organGrams = Math.round(intakeGrams * dog.ratios_secreting_organ);
    const liverGrams = Math.round(intakeGrams * dog.ratios_liver);

    return (
        <>
            <header className="flex h-[4.5rem] shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Dashboard
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem className="hidden md:block">
                                Your dogs
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{dog.dog_name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Card>
                    {dog.dog_cover && dog.dog_cover !== "NULL" && (
                        <img
                            src={dog.dog_cover}
                            alt="Dog cover image"
                            className="w-full h-72 object-cover rounded-b-lg ring-1 ring-border"
                        />
                    )}
                    <CardContent className="relative py-0">
                        <div
                            className={`flex flex-row gap-6 ${
                                dog.dog_cover && dog.dog_cover !== "NULL"
                                    ? "-mt-6 items-end pb-5"
                                    : "-mt-0 py-7"
                            }`}
                        >
                            <Avatar
                                className={`w-36 h-36 ring-4 ring-card [&>span]:border-border bg-card rounded-full ${
                                    dog.dog_cover && dog.dog_cover !== "NULL"
                                        ? ""
                                        : "w-28 h-28"
                                }`}
                            >
                                <AvatarImage src={dog.dog_avatar} />
                                <AvatarFallback className="text-muted-foreground/80 font-medium text-5xl">
                                    {dog.dog_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className={`flex-1 flex flex-row justify-between ${
                                    dog.dog_cover && dog.dog_cover !== "NULL"
                                        ? ""
                                        : "items-center"
                                }`}
                            >
                                <div
                                    className={`flex flex-col gap-1 text-sm ${
                                        dog.dog_cover &&
                                        dog.dog_cover !== "NULL"
                                            ? "pb-5"
                                            : "pb-0"
                                    }`}
                                >
                                    <p className="text-[1.375rem] font-medium mb-3">
                                        {dog.dog_name}
                                    </p>
                                    <div className="flex flex-row items-center gap-3">
                                        <DogOutline
                                            width={16}
                                            height={16}
                                            strokewidth={1.5}
                                            secondaryfill="hsl(var(--muted-foreground))"
                                        />
                                        <p className="text-muted-foreground">
                                            {dog.breed}
                                        </p>
                                    </div>
                                    <div className="flex flex-row items-center gap-3">
                                        <Party
                                            width={16}
                                            height={16}
                                            strokewidth={1.5}
                                            secondaryfill="hsl(var(--muted-foreground))"
                                        />
                                        <p className="text-muted-foreground">
                                            {new Date(
                                                dog.dob
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                            <span className="mx-2">•</span>
                                            {calculateAge(dog.dob)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="mb-auto"
                                    onClick={() => setShowEditDialog(true)}
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit profile
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Nutritional ratios</CardTitle>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditRatiosDialog(true)}
                        >
                            <Pencil className="w-4 h-4" />
                            Edit ratios
                        </Button>
                    </CardHeader>
                    <CardContent className="border-b py-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
                            <BadgeStack
                                icon={
                                    <Target
                                        strokewidth={1.5}
                                        secondaryfill="hsl(var(--muted-foreground))"
                                    />
                                }
                                label={
                                    dog.ratios_intake === 2.5
                                        ? "Maintain weight"
                                        : dog.ratios_intake === 3
                                        ? "Gain weight"
                                        : dog.ratios_intake === 2
                                        ? "Lose weight"
                                        : "Custom"
                                }
                                sublabel="Goal"
                                flipped={true}
                                className="order-1"
                            />
                            <BadgeStack
                                icon={
                                    <FoodScale
                                        strokewidth={1.5}
                                        secondaryfill="hsl(var(--muted-foreground))"
                                    />
                                }
                                label={`${dog.weight_metric}kg`}
                                sublabel="Current weight"
                                flipped={true}
                                className="order-2"
                            />
                            <div className="flex flex-col justify-between gap-2 h-full order-5 row-span-2 col-span-2  lg:order-3  text-xl font-normal text-muted-foreground/60 leading-relaxed align-top">
                                {dog.ratios_intake === 2.5 && (
                                    <p className="-mt-[0.2em] -mb-[0.15em]">
                                        To help maintain{" "}
                                        <span className="text-foreground">
                                            {dog.dog_name}'s
                                        </span>{" "}
                                        current weight of{" "}
                                        <span className="text-foreground">
                                            {dog.weight_metric}kg
                                        </span>
                                        , they should be fed{" "}
                                        <span className="whitespace-nowrap text-foreground">
                                            {new Intl.NumberFormat().format(
                                                intakeGrams
                                            )}
                                            g
                                        </span>{" "}
                                        per day.
                                    </p>
                                )}
                                {dog.ratios_intake === 3 && (
                                    <p className="-mt-[0.2em] -mb-[0.15em]">
                                        To help{" "}
                                        <span className="text-foreground">
                                            {dog.dog_name}
                                        </span>{" "}
                                        increase weight from their current
                                        weight of{" "}
                                        <span className="text-foreground">
                                            {dog.weight_metric}kg
                                        </span>
                                        , they should be fed{" "}
                                        <span className="whitespace-nowrap text-foreground">
                                            {new Intl.NumberFormat().format(
                                                intakeGrams
                                            )}
                                            g
                                        </span>{" "}
                                        per day.
                                    </p>
                                )}
                                {dog.ratios_intake === 2 && (
                                    <p className="-mt-[0.2em] -mb-[0.15em]">
                                        To help{" "}
                                        <span className="text-foreground">
                                            {dog.dog_name}
                                        </span>{" "}
                                        loose weight from their current weight
                                        of{" "}
                                        <span className="text-foreground">
                                            {dog.weight_metric}kg
                                        </span>
                                        , they should be fed{" "}
                                        <span className="whitespace-nowrap text-foreground">
                                            {new Intl.NumberFormat().format(
                                                intakeGrams
                                            )}
                                            g
                                        </span>{" "}
                                        per day.
                                    </p>
                                )}
                                {dog.ratios_intake !== 2.5 &&
                                    dog.ratios_intake !== 3 &&
                                    dog.ratios_intake !== 2 && (
                                        <p className="-mt-[0.2em] -mb-[0.15em]">
                                            To help{" "}
                                            <span className="text-foreground">
                                                {dog.dog_name}
                                            </span>{" "}
                                            reach your custom goal, you should
                                            feed{" "}
                                            <span className="whitespace-nowrap text-foreground">
                                                {new Intl.NumberFormat().format(
                                                    intakeGrams
                                                )}
                                                g
                                            </span>{" "}
                                            per day.
                                        </p>
                                    )}
                                <p className="">
                                    Total can be divided across meals.
                                </p>
                            </div>
                            <BadgeStack
                                icon={
                                    <ScaleUnbalanced2
                                        strokewidth={1.5}
                                        secondaryfill="hsl(var(--muted-foreground))"
                                    />
                                }
                                label={`${new Intl.NumberFormat().format(
                                    intakeGrams
                                )}g`}
                                sublabel="Daily intake (g)"
                                flipped={true}
                                className="order-3 lg:order-4"
                            />
                            <BadgeStack
                                icon={
                                    <Percentage
                                        strokewidth={1.5}
                                        secondaryfill="hsl(var(--muted-foreground))"
                                    />
                                }
                                label={`${dog.ratios_intake}%`}
                                sublabel="Daily intake (%)"
                                flipped={true}
                                className="order-4 lg:order-5"
                            />
                        </div>
                    </CardContent>
                    <CardContent className="py-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
                            <BadgeStack
                                variant="meat"
                                icon={<Ham strokewidth={1.5} />}
                                label="Meat and bone"
                                sublabel={`${new Intl.NumberFormat().format(
                                    meatGrams
                                )}g / ${Math.round(
                                    dog.ratios_muscle_meat * 100
                                )}%`}
                            />
                            <BadgeStack
                                variant="plant"
                                icon={<Leaf strokewidth={1.5} />}
                                label="Plant matter"
                                sublabel={`${new Intl.NumberFormat().format(
                                    plantGrams
                                )}g / ${Math.round(
                                    dog.ratios_plant_matter * 100
                                )}%`}
                            />
                            <BadgeStack
                                variant="liver"
                                icon={<Liver5 strokewidth={1.5} />}
                                label="Liver"
                                sublabel={`${new Intl.NumberFormat().format(
                                    liverGrams
                                )}g / ${Math.round(dog.ratios_liver * 100)}%`}
                            />
                            <BadgeStack
                                variant="organ"
                                icon={<Brain />}
                                label="Secreting organs"
                                sublabel={`${new Intl.NumberFormat().format(
                                    organGrams
                                )}g / ${Math.round(
                                    dog.ratios_secreting_organ * 100
                                )}%`}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{dog.dog_name}'s recipes</CardTitle>
                        <Button
                            variant="outline"
                            onClick={() => setSheetOpen(true)}
                        >
                            <PlusIcon className="w-4 h-4" />
                            Create recipe
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RecipeTable
                            dogId={parseInt(dogId)}
                            getDogName={(dogId) => {
                                const dog = dogs.find(
                                    (d) => d.dog_id === dogId
                                );
                                return dog?.dog_name || "Unknown Dog";
                            }}
                            open={sheetOpen}
                            onOpenChange={setSheetOpen}
                            showDog={false}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Profile notes</CardTitle>
                        <div className="flex items-center gap-2 h-4 pr-2">
                            {saveStatus === "saving" && (
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            )}
                            {saveStatus === "saved" && (
                                <CheckCheck className="w-6 h-6 text-success-foreground" />
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="">
                        <Textarea
                            placeholder="Add a note"
                            className="rounded-sm px-4 py-3 min-h-[100px] h-auto resize-none overflow-hidden"
                            ref={textareaRef}
                            value={notes}
                            onChange={handleNotesChange}
                        />
                    </CardContent>
                </Card>
            </div>
            <EditDogProfileDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                dog={dog}
            />
            <EditDogRatiosDialog
                open={showEditRatiosDialog}
                onOpenChange={setShowEditRatiosDialog}
                dog={dog}
            />
        </>
    );
}
