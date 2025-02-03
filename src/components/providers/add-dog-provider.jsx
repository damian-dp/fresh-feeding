import { createContext, useContext, useState, useCallback } from "react";

const AddDogContext = createContext();

export function AddDogProvider({ children }) {
    const [showAddDog, setShowAddDog] = useState(false);
    const [onSuccessCallback, setOnSuccessCallback] = useState(null);

    const openAddDog = useCallback((callback) => {
        setShowAddDog(true);
        if (callback) {
            setOnSuccessCallback(() => callback);
        }
    }, []);

    const handleSuccess = useCallback(
        (newDog) => {
            if (onSuccessCallback) {
                onSuccessCallback(newDog);
                setOnSuccessCallback(null);
            }
            setShowAddDog(false);
        },
        [onSuccessCallback]
    );

    return (
        <AddDogContext.Provider
            value={{
                showAddDog,
                setShowAddDog,
                openAddDog,
                onSuccess: handleSuccess,
            }}
        >
            {children}
        </AddDogContext.Provider>
    );
}

export function useAddDog() {
    const context = useContext(AddDogContext);
    if (!context) {
        throw new Error("useAddDog must be used within an AddDogProvider");
    }
    return context;
}
