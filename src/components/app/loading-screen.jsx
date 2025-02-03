import { Loader2 } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        </div>
    );
}
