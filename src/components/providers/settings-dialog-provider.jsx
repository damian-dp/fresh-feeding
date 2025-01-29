import { createContext, useContext, useState } from "react";
import { SettingsDialog } from "@/components/app/sidebar/settings-dialog";

const SettingsDialogContext = createContext({});

export function SettingsDialogProvider({ children }) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <SettingsDialogContext.Provider value={{ setShowSettings }}>
            {children}
            <SettingsDialog
                open={showSettings}
                onOpenChange={setShowSettings}
            />
        </SettingsDialogContext.Provider>
    );
}

export const useSettingsDialog = () => {
    const context = useContext(SettingsDialogContext);
    if (!context) {
        throw new Error(
            "useSettingsDialog must be used within SettingsDialogProvider"
        );
    }
    return context;
};
