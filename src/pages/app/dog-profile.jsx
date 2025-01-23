import { useParams } from "react-router-dom";
import { useDogs } from "@/components/providers/dogs-provider";
import {
    Bone,
    Brain,
    CheckCheck,
    CheckIcon,
    Dog,
    Heart,
    Loader2,
    PartyPopper,
    Pencil,
    Percent,
    Scale,
    Target,
    Weight,
} from "lucide-react";
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

export function DogProfilePage() {
    const { dogId } = useParams();
    const { dogs, loading } = useDogs();
    const textareaRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const [showEditDialog, setShowEditDialog] = useState(false);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!dog) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                <h1 className="text-2xl font-semibold">Dog not found</h1>
                <p className="text-muted-foreground">
                    The dog profile you're looking for doesn't exist.
                </p>
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
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Building Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
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
                                <AvatarFallback>
                                    <Dog
                                        className={`text-muted-foreground ${
                                            dog.dog_cover &&
                                            dog.dog_cover !== "NULL"
                                                ? "w-20 h-20"
                                                : "w-14 h-14"
                                        }`}
                                    />
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
                                        <Dog className="w-4 h-4" />
                                        <p className="text-muted-foreground">
                                            {dog.breed}
                                        </p>
                                    </div>
                                    <div className="flex flex-row items-center gap-3">
                                        <PartyPopper className="w-4 h-4" />
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
                        <Button variant="outline" asChild>
                            <Link to="/recipes/new">
                                <Pencil className="w-4 h-4" />
                                Edit ratios
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="border-b py-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
                            <BadgeStack
                                icon={<Target />}
                                label={
                                    dog.goal === "maintain"
                                        ? "Maintain weight"
                                        : dog.goal === "gain"
                                        ? "Gain weight"
                                        : dog.goal === "lose"
                                        ? "Lose weight"
                                        : "Custom"
                                }
                                sublabel="Goal"
                                flipped={true}
                            />
                            <BadgeStack
                                icon={<Weight />}
                                label={`${dog.weight_metric}kg`}
                                sublabel="Current weight"
                                flipped={true}
                            />
                            <div className="flex flex-col col-span-2 justify-between h-full row-span-2 text-xl font-normal text-muted-foreground/60 lg:pr-20 leading-relaxed align-top">
                                {(dog.goal === "maintain" ||
                                    dog.goal === "custom") && (
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
                                        <span className="text-foreground">
                                            {intakeGrams}g
                                        </span>{" "}
                                        per day.
                                    </p>
                                )}
                                {dog.goal === "gain" && (
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
                                        <span className="text-foreground">
                                            {intakeGrams}g
                                        </span>{" "}
                                        per day.
                                    </p>
                                )}
                                {dog.goal === "lose" && (
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
                                        <span className="text-foreground">
                                            {intakeGrams}g
                                        </span>{" "}
                                        per day.
                                    </p>
                                )}
                                <p className="">
                                    Daily total can be divided across meals.
                                </p>
                            </div>
                            <BadgeStack
                                icon={<Scale />}
                                label={`${intakeGrams}g`}
                                sublabel="Daily intake (g)"
                                flipped={true}
                            />
                            <BadgeStack
                                icon={<Percent />}
                                label={`${dog.ratios_intake}%`}
                                sublabel="Daily intake (%)"
                                flipped={true}
                            />
                        </div>
                    </CardContent>
                    <CardContent className="py-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
                            <BadgeStack
                                variant="meat"
                                icon={<Bone />}
                                label="Meat and bone"
                                sublabel={`${meatGrams}g / ${
                                    dog.ratios_muscle_meat * 100
                                }%`}
                            />
                            <BadgeStack
                                variant="plant"
                                icon={<Bone />}
                                label="Plant matter"
                                sublabel={`${plantGrams}g / ${
                                    dog.ratios_plant_matter * 100
                                }%`}
                            />
                            <BadgeStack
                                variant="liver"
                                icon={<Heart />}
                                label="Liver"
                                sublabel={`${liverGrams}g / ${
                                    dog.ratios_liver * 100
                                }%`}
                            />
                            <BadgeStack
                                variant="organ"
                                icon={<Brain />}
                                label="Secreting organs"
                                sublabel={`${organGrams}g / ${
                                    dog.ratios_secreting_organ * 100
                                }%`}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent recipes</CardTitle>
                        <Button variant="outline" asChild>
                            <Link to="/recipes/new">
                                <PlusIcon className="w-4 h-4" />
                                Create recipe
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RecipeTable limit={5} />
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
        </>
    );
}
