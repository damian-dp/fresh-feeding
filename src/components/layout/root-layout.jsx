import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app/sidebar/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { OnboardingDialog } from "../app/dashboard/onboarding-dialog";
import { AddDogProvider } from "@/components/providers/add-dog-provider";
import { SettingsDialogProvider } from "@/components/providers/settings-dialog-provider";
import { CountriesProvider } from "@/components/providers/countries-provider";

export function RootLayout() {
    return (
        <AddDogProvider>
            <CountriesProvider>
                <div className="min-h-screen">
                    <SettingsDialogProvider>
                        <SidebarProvider>
                            <AppSidebar />
                            <SidebarInset className="max-w-7xl mx-auto w-full min-h-screen">
                                <div className="flex flex-col justify-between w-full min-h-screen">
                                    <Outlet />
                                    <footer className="py-6">
                                        <div className="max-w-7xl mx-auto px-4">
                                            <nav className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                                                <Link
                                                    to="/privacy"
                                                    className="hover:text-foreground transition-colors"
                                                >
                                                    Privacy Policy
                                                </Link>
                                                <span>•</span>
                                                <Link
                                                    to="/terms"
                                                    className="hover:text-foreground transition-colors"
                                                >
                                                    Terms of Use
                                                </Link>
                                                <span>•</span>
                                                <Link
                                                    to="/contact"
                                                    className="hover:text-foreground transition-colors"
                                                >
                                                    Contact
                                                </Link>
                                            </nav>
                                        </div>
                                    </footer>
                                </div>
                                <OnboardingDialog />
                            </SidebarInset>
                        </SidebarProvider>
                    </SettingsDialogProvider>
                </div>
            </CountriesProvider>
        </AddDogProvider>
    );
}
