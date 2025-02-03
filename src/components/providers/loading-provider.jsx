import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./user-provider";
import { useDogs } from "./dogs-provider";
import { useRecipes } from "./recipes-provider";
import { useIngredients } from "./ingredients-provider";

const LoadingContext = createContext({});

export function LoadingProvider({ children }) {
    const [isReady, setIsReady] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
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
                    resolve();
                };
            });
        };

        Promise.all(imagesToLoad.map((src) => preloadImage(src))).catch(
            (error) => {
                console.error("Error preloading images:", error);
                setImagesLoaded(true);
            }
        );

        return () => {
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
            const timer = setTimeout(() => {
                setIsReady(true);
                setIsInitialLoad(false);
                console.log(
                    "[LoadingProvider] All data loaded, setting isReady"
                );
            }, 1000);

            return () => clearTimeout(timer);
        }

        setIsReady(false);
    }, [
        userLoading,
        dogsLoading,
        recipesLoading,
        ingredientsLoading,
        imagesLoaded,
    ]);

    return (
        <LoadingContext.Provider
            value={{
                isReady,
                isLoading: !isReady && isInitialLoad,
                isInitialLoad,
            }}
        >
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
