import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Toaster } from "sonner";

export function RootLayout() {
    return (
        <div className="min-h-screen">
            <Sidebar />
            <main className="lg:pl-64 p-8">
                <Outlet />
            </main>
            <Toaster position="bottom-right" richColors />
        </div>
    );
}
