import * as React from "react";
import { ChevronsUpDown, Plus, PawPrint, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DogSwitcher({
    dogs = [],
    onSelect,
    onAddDog,
    defaultSelectedDog = null,
}) {
    const [activeDog, setActiveDog] = React.useState(() => {
        // Initialize with default selected dog if provided
        return defaultSelectedDog
            ? dogs.find((d) => d.dog_id === defaultSelectedDog)
            : null;
    });

    // Update active dog when dogs list or default changes
    React.useEffect(() => {
        if (defaultSelectedDog) {
            // Convert to number if needed
            const targetId = Number(defaultSelectedDog);
            const findDog = () => dogs.find((d) => d.dog_id === targetId);

            // Immediate check
            const immediateMatch = findDog();
            if (immediateMatch) {
                setActiveDog(immediateMatch);
                return;
            }

            // Async check for loading data
            const timeoutId = setTimeout(() => {
                const newActive = findDog();
                if (newActive) {
                    setActiveDog(newActive);
                }
            }, 50);

            return () => clearTimeout(timeoutId);
        }
    }, [dogs, defaultSelectedDog]);

    const handleDogSelect = (dog) => {
        setActiveDog(dog);
        onSelect(dog.dog_id);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full h-14 flex items-center justify-between"
                >
                    {activeDog ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={activeDog.dog_avatar} />
                                <AvatarFallback>
                                    {activeDog.dog_name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="font-medium">
                                    {activeDog.dog_name}
                                </span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {activeDog.breed}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                    <PawPrint className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <span>Choose a dog</span>
                        </div>
                    )}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)]"
                align="start"
            >
                {dogs.map((dog) => (
                    <DropdownMenuItem
                        key={dog.dog_id}
                        onClick={() => handleDogSelect(dog)}
                        className="gap-2 p-2"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={dog.dog_avatar} />
                            <AvatarFallback>
                                {dog.dog_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-sm leading-tight">
                            <span className="font-medium">{dog.dog_name}</span>
                            <span className="text-xs text-muted-foreground">
                                {dog.breed}
                            </span>
                        </div>
                        {activeDog?.dog_id === dog.dog_id && (
                            <Check className="h-4 w-4" />
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onAddDog} className="gap-2 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border">
                        <Plus className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-muted-foreground">
                        Add new dog
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
