import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDogs } from "@/components/providers/dogs-provider";
import { Link } from "react-router-dom";
import {
    ArrowUpRight,
    ArrowUpRightIcon,
    Loader2,
    PlusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAddDog } from "@/components/providers/add-dog-provider";

export function DogProfileCard() {
    const { dogs, loading } = useDogs();
    const { setShowAddDog } = useAddDog();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (dogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <p className="text-muted-foreground mb-4">
                    You haven't added any dogs yet
                </p>
                <Button variant="outline" onClick={() => setShowAddDog(true)}>
                    Add dog
                </Button>
            </div>
        );
    }

    const AddDogCard = () => (
        <Card
            className={cn(
                "border-dashed",
                // Hide on mobile (1 column)
                "hidden",
                // On medium screens (2 columns)
                "md:block",
                // On large screens (3 columns)
                "lg:block"
            )}
        >
            <CardContent className="pt-6 h-full">
                <div
                    onClick={() => setShowAddDog(true)}
                    className="flex flex-col items-center cursor-pointer justify-center h-full min-h-[160px] text-muted-foreground hover:text-foreground transition-colors"
                >
                    <div className="rounded-full border-2 border-dashed p-4 mb-4">
                        <PlusIcon className="w-6 h-6" />
                    </div>
                    <p className="font-medium">Add another dog</p>
                </div>
            </CardContent>
        </Card>
    );

    // Calculate how many add cards we need for each breakpoint
    const getAddCardsCount = () => {
        const totalDogs = dogs.length;

        // For 3 columns (lg)
        const lgAddCards =
            totalDogs % 3 === 0
                ? 0
                : totalDogs < 3
                ? 3 - totalDogs
                : totalDogs > 3
                ? 6 - totalDogs
                : 0;

        // For 2 columns (md)
        // Only add cards if they would complete the current row
        const mdAddCards = totalDogs % 2 === 0 ? 0 : 1;

        return {
            lg: lgAddCards,
            md: mdAddCards,
        };
    };

    const addCardsCount = getAddCardsCount();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => (
                <Card
                    key={dog.dog_id}
                    className="group h-full hover:shadow-2xl rounded-sm hover:shadow-primary/10 transition-shadow duration-300 hover:cursor-pointer"
                >
                    <Link to={`/dogs/${dog.dog_id}`}>
                        <CardContent className="pt-6 pb-4 px-5 h-full flex flex-col justify-between">
                            <div className="flex flex-col items-start gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage
                                        src={dog.dog_avatar}
                                        alt={dog.dog_name}
                                    />
                                    <AvatarFallback className="text-2xl font-medium text-muted-foreground">
                                        {dog.dog_name[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1 px-1">
                                    <h3 className="font-medium text-2xl">
                                        {dog.dog_name}
                                    </h3>
                                    <div className="text-sm tracking-[0.01em] leading-6">
                                        <p className="flex flex-wrap gap-x-2">
                                            <span className="mr-1">
                                                <span className="text-muted-foreground whitespace-nowrap">
                                                    Age:{" "}
                                                </span>
                                                <span className="whitespace-nowrap">
                                                    {calculateAge(dog.dob)}
                                                </span>
                                            </span>
                                            <span>
                                                <span className="text-muted-foreground whitespace-nowrap">
                                                    Weight:{" "}
                                                </span>
                                                <span className="whitespace-nowrap">
                                                    {dog.weight_metric}kg
                                                </span>
                                            </span>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground whitespace-nowrap">
                                                Daily intake:{" "}
                                            </span>
                                            <span className="whitespace-nowrap">
                                                {dog.ratios_intake}%{" "}
                                                <span className="text-muted-foreground">
                                                    {" "}
                                                    /{" "}
                                                </span>
                                                {Math.round(
                                                    dog.weight_metric *
                                                        1000 *
                                                        (dog.ratios_intake /
                                                            100)
                                                )}
                                                g
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground group-hover:text-foreground group-hover:underline transition-colors">
                                    View profile
                                </span>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            ))}
            {/* Add cards with responsive visibility */}
            {Array.from({
                length: Math.max(addCardsCount.lg, addCardsCount.md),
            }).map((_, index) => (
                <Card
                    key={`add-dog-${index}`}
                    className={cn(
                        "border-dashed rounded-sm",
                        // Hide on mobile
                        "hidden",
                        // On medium screens, only show first card if needed
                        index === 0 ? "md:block" : "md:hidden",
                        // On large screens, show cards based on total dogs
                        dogs.length % 3 === 0 ? "lg:hidden" : "lg:block",
                        // Hide all cards when we have full rows on medium
                        dogs.length % 2 === 0 && "md:hidden"
                    )}
                >
                    <CardContent className="pt-6 h-full">
                        <div
                            onClick={() => setShowAddDog(true)}
                            className="flex flex-col items-center cursor-pointer justify-center h-full min-h-[160px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <div className="rounded-full border-2 border-dashed p-4 mb-4">
                                <PlusIcon className="w-6 h-6" />
                            </div>
                            <p className="font-medium">Add another dog</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    // If less than 1 year, show months
    if (age === 0) {
        const months = monthDiff + 12;
        return `${months} ${months === 1 ? "month" : "months"}`;
    }

    return `${age} ${age === 1 ? "year" : "years"}`;
}
