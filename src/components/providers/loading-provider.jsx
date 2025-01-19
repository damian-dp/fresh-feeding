import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { useUser } from "./user-provider";
import { useDogs } from "./dogs-provider";
import { useIngredients } from "./ingredients-provider";

const LoadingContext = createContext({});

export function LoadingProvider({ children }) {
    const [isReady, setIsReady] = useState(false);
    const { loading: authLoading } = useAuth();
    const { loading: userLoading } = useUser();
    const { loading: dogsLoading } = useDogs();
    const { loading: ingredientsLoading } = useIngredients();

    useEffect(() => {
        // Check if all providers are ready
        if (
            !authLoading &&
            !userLoading &&
            !dogsLoading &&
            !ingredientsLoading
        ) {
            // Add a small delay to ensure smooth transition
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [authLoading, userLoading, dogsLoading, ingredientsLoading]);

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
