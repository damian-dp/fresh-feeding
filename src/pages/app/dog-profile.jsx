import { useParams } from "react-router-dom";
import { useDogs } from "@/components/providers/dogs-provider";
import { Loader2 } from "lucide-react";

export function DogProfilePage() {
    const { dogId } = useParams();
    const { dogs, loading } = useDogs();

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

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{dog.dog_name}</h1>
                    <p className="text-muted-foreground">
                        Profile details and feeding information
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Basic Information
                        </h2>
                        <div className="grid gap-2">
                            {dog.breed && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Breed
                                    </span>
                                    <p>{dog.breed}</p>
                                </div>
                            )}
                            {dog.dob && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Date of Birth
                                    </span>
                                    <p>
                                        {new Date(dog.dob).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {dog.weight_metric && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Weight
                                    </span>
                                    <p>{dog.weight_metric} kg</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            Feeding Ratios
                        </h2>
                        <div className="grid gap-2">
                            {dog.ratios_muscle_meat && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Muscle Meat
                                    </span>
                                    <p>{dog.ratios_muscle_meat}%</p>
                                </div>
                            )}
                            {dog.ratios_liver && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Liver
                                    </span>
                                    <p>{dog.ratios_liver}%</p>
                                </div>
                            )}
                            {dog.ratios_secreting_organ && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Secreting Organs
                                    </span>
                                    <p>{dog.ratios_secreting_organ}%</p>
                                </div>
                            )}
                            {dog.ratios_plant_matter && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Plant Matter
                                    </span>
                                    <p>{dog.ratios_plant_matter}%</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {dog.dog_notes && (
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Notes</h2>
                        <p className="text-muted-foreground">{dog.dog_notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
