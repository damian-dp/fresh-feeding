import { createContext, useContext } from "react";

// Hard-code the most common countries first, then add others
const COUNTRIES = [
    { value: "AU", label: "Australia" },
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "NZ", label: "New Zealand" },
    { value: "CA", label: "Canada" },
    // Add other countries alphabetically
    { value: "AF", label: "Afghanistan" },
    { value: "AL", label: "Albania" },
    { value: "AR", label: "Argentina" },
    { value: "AT", label: "Austria" },
    { value: "BE", label: "Belgium" },
    { value: "BR", label: "Brazil" },
    { value: "CN", label: "China" },
    { value: "DE", label: "Germany" },
    { value: "DK", label: "Denmark" },
    { value: "ES", label: "Spain" },
    { value: "FI", label: "Finland" },
    { value: "FR", label: "France" },
    { value: "IE", label: "Ireland" },
    { value: "IN", label: "India" },
    { value: "IT", label: "Italy" },
    { value: "JP", label: "Japan" },
    { value: "MX", label: "Mexico" },
    { value: "NL", label: "Netherlands" },
    { value: "NO", label: "Norway" },
    { value: "PL", label: "Poland" },
    { value: "PT", label: "Portugal" },
    { value: "RU", label: "Russia" },
    { value: "SE", label: "Sweden" },
    { value: "SG", label: "Singapore" },
    { value: "ZA", label: "South Africa" },
].sort((a, b) => a.label.localeCompare(b.label));

const CountriesContext = createContext(COUNTRIES);

export function CountriesProvider({ children }) {
    return (
        <CountriesContext.Provider value={COUNTRIES}>
            {children}
        </CountriesContext.Provider>
    );
}

export const useCountries = () => {
    const context = useContext(CountriesContext);
    if (!context) {
        throw new Error("useCountries must be used within CountriesProvider");
    }
    return context;
};
