import { createContext, useContext, useState } from 'react'

const AddDogContext = createContext()

export function AddDogProvider({ children }) {
    const [showAddDog, setShowAddDog] = useState(false)

    return (
        <AddDogContext.Provider value={{ showAddDog, setShowAddDog }}>
            {children}
        </AddDogContext.Provider>
    )
}

export function useAddDog() {
    const context = useContext(AddDogContext)
    if (!context) {
        throw new Error('useAddDog must be used within an AddDogProvider')
    }
    return context
} 