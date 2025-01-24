import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./auth-provider";

const DogsContext = createContext({});

// Helper function to get signed URL
const getSignedUrl = async (path) => {
    if (!path) return null;

    try {
        // If it's already a signed URL, return it
        if (path.includes("token=")) {
            return path;
        }

        // Extract bucket and filename from various URL formats
        let bucket, filename;

        if (path.includes("/storage/v1/object/public/")) {
            // Handle full Supabase URL format
            const matches = path.match(/public\/([^/]+)\/(.+)$/);
            if (matches) {
                [, bucket, filename] = matches;
            }
        } else if (path.includes("/")) {
            // Handle our standard path format: "bucket/profile_id/dog_id-timestamp.ext"
            const parts = path.split("/");
            bucket = parts[0];
            // Join the rest of the parts to preserve the full path including profile_id folder
            filename = parts.slice(1).join("/");
        } else {
            console.warn("Invalid path format:", path);
            return path;
        }

        if (!bucket || !filename) {
            console.warn("Could not parse path:", path);
            return path;
        }

        // Clean up the filename (remove any query parameters or tokens)
        filename = filename.split("?")[0];

        // Create a fresh signed URL
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filename, 60 * 60); // 1 hour expiry

        if (error) {
            console.warn("Error creating signed URL:", error);
            return path;
        }

        return data.signedUrl;
    } catch (error) {
        console.error("Error getting signed URL:", error);
        return path;
    }
};

// Update the deleteStorageObject function
const deleteStorageObject = async (path) => {
    if (!path) return;

    try {
        let bucket, filename;

        // Extract the actual path from the signed URL
        if (path.includes("/storage/v1/object/sign/")) {
            const match = path.match(/\/sign\/([^/]+)\/(.+?)(?:\?|$)/);
            if (match) {
                bucket = match[1];
                filename = match[2];
            }
        } else if (path.includes("/")) {
            // Handle our standard path format: "bucket_name/profile_id/dog_id-timestamp.ext"
            const parts = path.split("/");
            if (parts.length >= 2) {
                bucket = parts[0];
                filename = parts.slice(1).join("/");
            }
        }

        if (!bucket || !filename) {
            console.warn("Could not parse storage path:", path);
            return;
        }

        // Clean up the filename
        filename = filename.split("?")[0];

        console.log("Deleting from bucket:", bucket, "filename:", filename);

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filename]);

        if (error) {
            console.error("Error deleting file:", error);
            throw error;
        }
    } catch (error) {
        console.error("Error in deleteStorageObject:", error, "Path:", path);
    }
};

export function DogsProvider({ children }) {
    const { session, isAuthenticated } = useAuth();
    const [dogs, setDogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modify fetchDogs to include signed URLs for both avatar and cover
    const fetchDogs = async () => {
        try {
            if (!isAuthenticated || !session?.user?.id) {
                setDogs([]);
                return;
            }

            const { data, error } = await supabase
                .from("dogs")
                .select("*")
                .eq("profile_id", session.user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Get signed URLs for all dogs' avatars and covers
            const dogsWithSignedUrls = await Promise.all(
                data.map(async (dog) => {
                    const processedDog = { ...dog };

                    // Handle avatar URL
                    if (dog.dog_avatar && typeof dog.dog_avatar === "string") {
                        processedDog.dog_avatar = await getSignedUrl(
                            dog.dog_avatar
                        );
                    } else {
                        processedDog.dog_avatar = null;
                    }

                    // Handle cover URL
                    if (
                        dog.dog_cover &&
                        typeof dog.dog_cover === "string" &&
                        dog.dog_cover !== "NULL"
                    ) {
                        processedDog.dog_cover = await getSignedUrl(
                            dog.dog_cover
                        );
                    } else {
                        processedDog.dog_cover = null;
                    }

                    return processedDog;
                })
            );

            console.log("Dogs loaded:", dogsWithSignedUrls);
            setDogs(dogsWithSignedUrls);
        } catch (error) {
            console.error("Error loading dogs:", error);
            setDogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDogs();

        // Modify the subscription handler to include signed URLs
        const channel = supabase
            .channel(`dogs:${session?.user?.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "dogs",
                    filter: `profile_id=eq.${session?.user?.id}`,
                },
                async (payload) => {
                    console.log("Dogs changed:", payload);
                    if (payload.eventType === "DELETE") {
                        setDogs((prev) =>
                            prev.filter(
                                (dog) => dog.dog_id !== payload.old.dog_id
                            )
                        );
                    } else if (payload.eventType === "INSERT") {
                        const newDog = {
                            ...payload.new,
                            dog_avatar: payload.new.dog_avatar
                                ? await getSignedUrl(payload.new.dog_avatar)
                                : null,
                            dog_cover: payload.new.dog_cover
                                ? await getSignedUrl(payload.new.dog_cover)
                                : null,
                        };
                        setDogs((prev) => [...prev, newDog]);
                    } else if (payload.eventType === "UPDATE") {
                        const updatedDog = {
                            ...payload.new,
                            dog_avatar: payload.new.dog_avatar
                                ? await getSignedUrl(payload.new.dog_avatar)
                                : null,
                            dog_cover: payload.new.dog_cover
                                ? await getSignedUrl(payload.new.dog_cover)
                                : null,
                        };
                        setDogs((prev) =>
                            prev.map((dog) =>
                                dog.dog_id === updatedDog.dog_id
                                    ? updatedDog
                                    : dog
                            )
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user?.id, isAuthenticated]);

    const addDog = async (dogData) => {
        try {
            const { data, error } = await supabase
                .from("dogs")
                .insert([{ ...dogData, profile_id: session.user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error adding dog:", error);
            throw error;
        }
    };

    // Update the updateDog function to handle image cleanup and refresh URLs
    const updateDog = async (dogData) => {
        try {
            // Get the current dog data to compare with new data
            const currentDog = dogs.find(
                (dog) => dog.dog_id === dogData.dog_id
            );

            const { data, error } = await supabase
                .from("dogs")
                .update(dogData)
                .eq("dog_id", dogData.dog_id)
                .select()
                .single();

            if (error) throw error;

            // Clean up old images if they've been changed
            if (currentDog) {
                if (
                    currentDog.dog_avatar &&
                    currentDog.dog_avatar !== dogData.dog_avatar
                ) {
                    await deleteStorageObject(currentDog.dog_avatar);
                }
                if (
                    currentDog.dog_cover &&
                    currentDog.dog_cover !== dogData.dog_cover
                ) {
                    await deleteStorageObject(currentDog.dog_cover);
                }
            }

            // Get fresh signed URLs for the updated dog
            const processedDog = { ...data };

            // Handle avatar URL
            if (data.dog_avatar && typeof data.dog_avatar === "string") {
                processedDog.dog_avatar = await getSignedUrl(data.dog_avatar);
            } else {
                processedDog.dog_avatar = null;
            }

            // Handle cover URL
            if (
                data.dog_cover &&
                typeof data.dog_cover === "string" &&
                data.dog_cover !== "NULL"
            ) {
                processedDog.dog_cover = await getSignedUrl(data.dog_cover);
            } else {
                processedDog.dog_cover = null;
            }

            // Update local state with processed URLs
            setDogs(
                dogs.map((dog) =>
                    dog.dog_id === data.dog_id ? processedDog : dog
                )
            );

            return processedDog;
        } catch (error) {
            console.error("Error updating dog:", error);
            throw error;
        }
    };

    // Update the deleteDog function
    const deleteDog = async (dogId) => {
        try {
            // Get the dog data before deletion to access image paths
            const dogToDelete = dogs.find((dog) => dog.dog_id === dogId);

            if (!dogToDelete) {
                throw new Error("Dog not found");
            }

            // Verify ownership
            if (dogToDelete.profile_id !== session.user.id) {
                throw new Error("Unauthorized to delete this dog");
            }

            // Delete images first - get raw paths from database
            const { data: dogData } = await supabase
                .from("dogs")
                .select("dog_avatar, dog_cover")
                .eq("dog_id", dogId)
                .single();

            if (dogData?.dog_avatar) {
                await deleteStorageObject(dogData.dog_avatar);
            }
            if (dogData?.dog_cover) {
                await deleteStorageObject(dogData.dog_cover);
            }

            // Delete the dog record
            const { error: deleteError } = await supabase
                .from("dogs")
                .delete()
                .match({
                    dog_id: dogId,
                    profile_id: session.user.id,
                });

            if (deleteError) {
                console.error("Delete error:", deleteError);
                throw deleteError;
            }

            // Update local state
            setDogs(dogs.filter((dog) => dog.dog_id !== dogId));

            return true;
        } catch (error) {
            console.error("Error deleting dog:", error);
            throw error;
        }
    };

    const value = {
        dogs,
        loading,
        error,
        addDog,
        updateDog,
        deleteDog,
    };

    return (
        <DogsContext.Provider value={value}>{children}</DogsContext.Provider>
    );
}

export const useDogs = () => {
    const context = useContext(DogsContext);
    if (!context) {
        throw new Error("useDogs must be used within a DogsProvider");
    }
    return context;
};
