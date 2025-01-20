import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./user-provider";
import { useDogs } from "./dogs-provider";
import { useRecipes } from "./recipes-provider";
import { useIngredients } from "./ingredients-provider";

const LoadingContext = createContext({});

export function LoadingProvider({ children }) {
    const [isReady, setIsReady] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const { loading: userLoading, profile } = useUser();
    const { loading: dogsLoading, dogs } = useDogs();
    const { loading: recipesLoading } = useRecipes();
    const { loading: ingredientsLoading } = useIngredients();

    // Preload user and dog images
    useEffect(() => {
        if (dogsLoading || userLoading) return;

        const imagesToLoad = [];

        // Add user avatar if it exists
        if (profile?.avatar_url && profile.avatar_url !== "NULL") {
            imagesToLoad.push(profile.avatar_url);
        }

        // Add dog images
        dogs.forEach((dog) => {
            if (dog.dog_avatar && dog.dog_avatar !== "NULL") {
                imagesToLoad.push(dog.dog_avatar);
            }
            if (dog.dog_cover && dog.dog_cover !== "NULL") {
                imagesToLoad.push(dog.dog_cover);
            }
        });

        if (!imagesToLoad.length) {
            setImagesLoaded(true);
            return;
        }

        let loadedCount = 0;
        const totalImages = imagesToLoad.length;

        const preloadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        setImagesLoaded(true);
                    }
                    resolve();
                };
                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        setImagesLoaded(true);
                    }
                    // Still resolve on error to not block loading
                    resolve();
                };
            });
        };

        // Load all images concurrently
        Promise.all(imagesToLoad.map((src) => preloadImage(src))).catch(
            (error) => {
                console.error("Error preloading images:", error);
                // Set images as loaded even if there's an error
                setImagesLoaded(true);
            }
        );

        return () => {
            // Cleanup if component unmounts during loading
            setImagesLoaded(false);
        };
    }, [dogs, dogsLoading, profile, userLoading]);

    useEffect(() => {
        const allDataLoaded =
            !userLoading &&
            !dogsLoading &&
            !recipesLoading &&
            !ingredientsLoading &&
            imagesLoaded;

        if (allDataLoaded) {
            // Add a small delay to ensure all UI updates are complete
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 100);

            return () => clearTimeout(timer);
        }
        // Reset isReady if any provider starts loading again
        setIsReady(false);
    }, [
        userLoading,
        dogsLoading,
        recipesLoading,
        ingredientsLoading,
        imagesLoaded,
    ]);

    // Debug logging
    useEffect(() => {
        console.log("Loading states:", {
            user: userLoading,
            dogs: dogsLoading,
            recipes: recipesLoading,
            ingredients: ingredientsLoading,
            images: !imagesLoaded,
            isReady,
        });
    }, [
        userLoading,
        dogsLoading,
        recipesLoading,
        ingredientsLoading,
        imagesLoaded,
        isReady,
    ]);

    return (
        <LoadingContext.Provider value={{ isReady }}>
            {children}
        </LoadingContext.Provider>
    );
}

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};
