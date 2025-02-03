import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { OnboardingDialog } from "../app/dashboard/onboarding-dialog";
import {
    AddDogProvider,
    useAddDog,
} from "@/components/providers/add-dog-provider";
import { SettingsDialogProvider } from "@/components/providers/settings-dialog-provider";
import { CountriesProvider } from "@/components/providers/countries-provider";
import { LandingFooter } from "../landing-page/landing-footer";
import { AddDogDialog } from "@/components/app/dashboard/add-dog-dialog";

// Create a wrapper component to use the hook
function AddDogWrapper() {
    const { showAddDog, setShowAddDog, onSuccess } = useAddDog();
    return (
        <AddDogDialog
            open={showAddDog}
            onOpenChange={setShowAddDog}
            onSuccess={onSuccess}
        />
    );
}

export function RootLayout() {
    return (
        <AddDogProvider>
            <CountriesProvider>
                <div className="min-h-screen">
                    <SettingsDialogProvider>
                        <SidebarProvider>
                            <AppSidebar />
                            <SidebarInset className="max-w-7xl mx-auto w-full min-h-screen">
                                <div className="flex flex-col w-full min-h-screen">
                                    <Outlet />
                                    <div
                                        className="px-6 pb-6 pt-2
                                    "
                                    >
                                        <LandingFooter />
                                    </div>
                                </div>
                                <OnboardingDialog />
                                <AddDogWrapper />
                            </SidebarInset>
                        </SidebarProvider>
                    </SettingsDialogProvider>
                </div>
            </CountriesProvider>
        </AddDogProvider>
    );
}
