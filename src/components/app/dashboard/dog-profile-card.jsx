import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useDogs } from "@/components/providers/dogs-provider";
import { Link } from "react-router-dom";
import { ArrowUpRight, Loader2, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddDog } from "@/components/providers/add-dog-provider";
import Dog from "@/assets/icons/dog";
import {
  getCurrentIntakePercent,
  getDailyIntakeGrams,
  getDogAgeInMonths,
} from "@/utils/feeding";

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
      <div className="text-center h-72 text-muted flex flex-col gap-4 items-center justify-center">
        <Dog width={85} height={85} />
        <p className="text-lg text-muted-foreground/60 leading-6">
          You haven't added
          <br />
          any dogs yet
        </p>
      </div>
    );
  }

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
      {dogs.map((dog) => {
        const intakePercent = getCurrentIntakePercent(dog);
        const fallbackPercent =
          typeof dog.ratios_intake === "number" ? dog.ratios_intake : null;
        const normalizedPercent =
          typeof intakePercent === "number" && !Number.isNaN(intakePercent)
            ? intakePercent
            : fallbackPercent;
        const percentLabel =
          typeof normalizedPercent === "number" &&
          !Number.isNaN(normalizedPercent)
            ? `${
                normalizedPercent % 1 === 0
                  ? normalizedPercent
                  : normalizedPercent.toFixed(1)
              }%`
            : "—";
        const dailyIntakeGrams =
          typeof normalizedPercent === "number" &&
          !Number.isNaN(normalizedPercent)
            ? getDailyIntakeGrams(dog.weight_metric, normalizedPercent)
            : null;

        return (
          <Card
            key={dog.dog_id}
            className="group h-full hover:shadow-2xl rounded-sm hover:shadow-primary/10 transition-shadow duration-300 hover:cursor-pointer"
          >
            <Link to={`/dogs/${dog.dog_id}`}>
              <CardContent className="pt-6 pb-4 px-5 h-full flex flex-col justify-between">
                <div className="flex flex-col items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={dog.dog_avatar} alt={dog.dog_name} />
                    <AvatarFallback className="text-3xl">
                      {dog.dog_name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 px-1">
                    <h3 className="font-medium text-2xl">{dog.dog_name}</h3>
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
                          {percentLabel}
                          <span className="text-muted-foreground"> / </span>
                          {dailyIntakeGrams != null
                            ? `${dailyIntakeGrams}g`
                            : "—"}
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
        );
      })}
      {/* Add cards with responsive visibility */}
      {Array.from({
        length: Math.max(addCardsCount.lg, addCardsCount.md),
      }).map((_, index) => (
        <Card
          key={`add-dog-${index}`}
          className={cn(
            "border-border/50 rounded-sm",
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
          <CardContent className="p-0 h-full">
            <div
              onClick={() => setShowAddDog(true)}
              className="flex flex-col items-center cursor-pointer justify-center h-full min-h-[160px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="mb-3">
                <PlusIcon className="w-6 h-6" />
              </div>
              <p className="">Add a dog</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function calculateAge(dob) {
  const totalMonths = getDogAgeInMonths(dob);
  if (totalMonths == null) {
    return "Unknown";
  }

  if (totalMonths < 12) {
    const label = totalMonths === 1 ? "month" : "months";
    return `${totalMonths} ${label}`;
  }

  const years = Math.floor(totalMonths / 12);
  const label = years === 1 ? "year" : "years";
  return `${years} ${label}`;
}
