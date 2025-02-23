import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./user-provider";
import { useDogs } from "./dogs-provider";
import { useRecipes } from "./recipes-provider";
import { useIngredients } from "./ingredients-provider";
import { useAuth } from "./auth-provider";

const LoadingContext = createContext({});

export function LoadingProvider({ children }) {
    const [isReady, setIsReady] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const { loading: authLoading, isAuthenticated } = useAuth();
    const { loading: userLoading, profile } = useUser();
    const { loading: dogsLoading, dogs } = useDogs();
    const { loading: recipesLoading } = useRecipes();
    const { loading: ingredientsLoading } = useIngredients();

    // Log loading states
    useEffect(() => {
        console.log("[LoadingProvider] Loading states:", {
            authLoading,
            userLoading,
            dogsLoading,
            recipesLoading,
            ingredientsLoading,
            imagesLoaded,
            isAuthenticated,
            isInitialLoad,
            isReady,
            path: window.location.pathname,
        });
    }, [
        authLoading,
        userLoading,
        dogsLoading,
        recipesLoading,
        ingredientsLoading,
        imagesLoaded,
        isAuthenticated,
        isInitialLoad,
        isReady,
    ]);

    // Handle auth state first
    useEffect(() => {
        if (!authLoading) {
            console.log("[LoadingProvider] Auth state resolved:", {
                isAuthenticated,
                path: window.location.pathname,
            });

            // If not authenticated, we can be ready immediately
            if (!isAuthenticated) {
                setIsReady(true);
                setIsInitialLoad(false);
            }
        }
    }, [authLoading, isAuthenticated]);

    // Preload user and dog images only if authenticated
    useEffect(() => {
        if (!isAuthenticated || dogsLoading || userLoading) {
            return;
        }

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
    }, [dogs, dogsLoading, profile, userLoading, isAuthenticated]);

    // Handle data loading for authenticated users
    useEffect(() => {
        // Skip if auth is still loading or user is not authenticated
        if (authLoading || !isAuthenticated) {
            return;
        }

        // Check if all required data is loaded
        const allDataLoaded =
            !userLoading &&
            !dogsLoading &&
            !recipesLoading &&
            !ingredientsLoading &&
            imagesLoaded;

        if (allDataLoaded) {
            console.log("[LoadingProvider] All data loaded, setting isReady");
            setIsReady(true);
            setIsInitialLoad(false);
        }
    }, [
        authLoading,
        isAuthenticated,
        userLoading,
        dogsLoading,
        recipesLoading,
        ingredientsLoading,
        imagesLoaded,
    ]);

    const value = {
        isReady,
        isLoading: !isReady && isInitialLoad,
        isInitialLoad,
    };

    // Add debug log for final state
    useEffect(() => {
        if (isReady) {
            console.log("[LoadingProvider] Ready state achieved:", {
                isReady,
                isLoading: !isReady && isInitialLoad,
                isInitialLoad,
                path: window.location.pathname,
            });
        }
    }, [isReady, isInitialLoad]);

    return (
        <LoadingContext.Provider value={value}>
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
