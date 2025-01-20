import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./user-provider";
import { useDogs } from "./dogs-provider";
import { useRecipes } from "./recipes-provider";
import { useIngredients } from "./ingredients-provider";

const LoadingContext = createContext({});

export function LoadingProvider({ children }) {
    const [isReady, setIsReady] = useState(false);
    const { loading: userLoading } = useUser();
    const { loading: dogsLoading } = useDogs();
    const { loading: recipesLoading } = useRecipes();
    const { loading: ingredientsLoading } = useIngredients();

    useEffect(() => {
        const allDataLoaded =
            !userLoading &&
            !dogsLoading &&
            !recipesLoading &&
            !ingredientsLoading;

        if (allDataLoaded) {
            // Add a small delay to ensure all UI updates are complete
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 100);

            return () => clearTimeout(timer);
        }
        // Reset isReady if any provider starts loading again
        setIsReady(false);
    }, [userLoading, dogsLoading, recipesLoading, ingredientsLoading]);

    // Debug logging
    useEffect(() => {
        console.log("Loading states:", {
            user: userLoading,
            dogs: dogsLoading,
            recipes: recipesLoading,
            ingredients: ingredientsLoading,
            isReady,
        });
    }, [userLoading, dogsLoading, recipesLoading, ingredientsLoading, isReady]);

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
