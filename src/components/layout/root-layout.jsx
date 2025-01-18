import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export function RootLayout() {
    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
            <Toaster position="bottom-right" richColors />
        </div>
    );
}
