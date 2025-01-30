import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./auth-provider";

const DogsContext = createContext({});

// Helper function to get signed URL
const getSignedUrl = async (path) => {
    if (!path) return null;

    try {
        // Extract bucket and filename
        let bucket, filename;

        // If it's already a full signed URL, extract the path part
        if (path.includes("/storage/v1/object/sign/")) {
            const match = path.match(/\/sign\/([^/]+)\/(.+?)(?:\?|$)/);
            if (match) {
                bucket = match[1];
                filename = match[2];
            }
        } else if (path.includes("/")) {
            // Handle simple path format (e.g. "dog_covers/profile_id/filename")
            const parts = path.split("/");
            bucket = parts[0];
            filename = parts.slice(1).join("/");
        }

        if (!bucket || !filename) {
            console.error("Could not parse path:", path);
            return path;
        }

        // Clean up the filename
        filename = filename.split("?")[0];

        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filename, 3600 * 24); // 24 hours

        if (error) {
            console.error("Error creating signed URL:", error.message, {
                bucket,
                filename,
            });
            return path;
        }

        return data.signedUrl;
    } catch (error) {
        console.error("Error getting signed URL:", error, { path });
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

            // console.log("Dogs loaded:", dogsWithSignedUrls);
            setDogs(dogsWithSignedUrls);
        } catch (error) {
            console.error("Error fetching dogs:", error);
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
                    // console.log("Dogs changed:", payload);
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

    // Add a URL refresh mechanism
    useEffect(() => {
        if (!dogs.length) return;

        // Refresh cover URLs every 20 hours
        const interval = setInterval(async () => {
            const updatedDogs = await Promise.all(
                dogs.map(async (dog) => {
                    if (!dog.dog_cover) return dog;

                    const freshCoverUrl = await getSignedUrl(dog.dog_cover);
                    return {
                        ...dog,
                        dog_cover: freshCoverUrl,
                    };
                })
            );

            setDogs(updatedDogs);
        }, 3600000 * 20); // 20 hours

        return () => clearInterval(interval);
    }, [dogs]);

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
    const updateDog = async (data) => {
        try {
            // Check if this is a ratios-only update
            const isRatiosUpdate = Object.keys(data).every(
                (key) =>
                    key === "dog_id" ||
                    key.startsWith("ratios_") ||
                    key === "goal"
            );

            if (isRatiosUpdate) {
                // For ratio updates, just update the database
                const { data: updatedDog, error } = await supabase
                    .from("dogs")
                    .update(data)
                    .eq("dog_id", data.dog_id)
                    .select()
                    .single();

                if (error) throw error;

                // Update local state
                setDogs((prev) =>
                    prev.map((dog) =>
                        dog.dog_id === data.dog_id
                            ? { ...dog, ...updatedDog }
                            : dog
                    )
                );

                return { data: updatedDog };
            }

            // Get current dog data
            const currentDog = dogs.find((dog) => dog.dog_id === data.dog_id);
            if (!currentDog) throw new Error("Dog not found");

            // Start with just the dog_id
            const processedData = {
                dog_id: data.dog_id,
            };

            // Handle avatar update - only if it's being changed
            if (data.hasOwnProperty("dog_avatar")) {
                try {
                    // Clean up old avatar first if it exists
                    if (currentDog?.dog_avatar) {
                        await deleteStorageObject(currentDog.dog_avatar);
                    }

                    // Process new avatar
                    if (
                        data.dog_avatar &&
                        !data.dog_avatar.includes("https://")
                    ) {
                        const { data: exists } = await supabase.storage
                            .from(data.dog_avatar.split("/")[0])
                            .getPublicUrl(
                                data.dog_avatar.split("/").slice(1).join("/")
                            );

                        if (!exists) throw new Error("Avatar image not found");
                        processedData.dog_avatar = data.dog_avatar;
                    } else {
                        processedData.dog_avatar = null;
                    }
                } catch (error) {
                    console.error("Error processing avatar:", error);
                    processedData.dog_avatar = null;
                }
            }

            // Handle cover update - only if it's being changed
            if (data.hasOwnProperty("dog_cover")) {
                try {
                    // Clean up old cover first if it exists
                    if (currentDog?.dog_cover) {
                        await deleteStorageObject(currentDog.dog_cover);
                    }

                    // Process new cover
                    if (
                        data.dog_cover &&
                        !data.dog_cover.includes("https://")
                    ) {
                        const { data: exists } = await supabase.storage
                            .from(data.dog_cover.split("/")[0])
                            .getPublicUrl(
                                data.dog_cover.split("/").slice(1).join("/")
                            );

                        if (!exists) throw new Error("Cover image not found");
                        processedData.dog_cover = data.dog_cover;
                    } else {
                        processedData.dog_cover = null;
                    }
                } catch (error) {
                    console.error("Error processing cover:", error);
                    processedData.dog_cover = null;
                }
            }

            // Add other fields that are being updated
            Object.keys(data).forEach((key) => {
                if (
                    !["dog_avatar", "dog_cover"].includes(key) &&
                    key !== "dog_id"
                ) {
                    processedData[key] = data[key];
                }
            });

            // Update database
            const { data: updatedDog, error } = await supabase
                .from("dogs")
                .update(processedData)
                .eq("dog_id", data.dog_id)
                .select()
                .single();

            if (error) throw error;

            // Get fresh signed URLs for images if they exist
            const processedUpdatedDog = { ...updatedDog };
            if (processedUpdatedDog.dog_avatar) {
                processedUpdatedDog.dog_avatar = await getSignedUrl(
                    processedUpdatedDog.dog_avatar
                );
            }
            if (processedUpdatedDog.dog_cover) {
                processedUpdatedDog.dog_cover = await getSignedUrl(
                    processedUpdatedDog.dog_cover
                );
            }

            // Update local state
            setDogs(
                dogs.map((dog) =>
                    dog.dog_id === data.dog_id ? processedUpdatedDog : dog
                )
            );

            return processedUpdatedDog;
        } catch (error) {
            console.error("Error updating dog:", error);
            return { error };
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
