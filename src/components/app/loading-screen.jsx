import { Loader2 } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="flex flex-col items-center gap-1">
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Loading your data...
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                        This might take a moment
                    </p>
                </div>
            </div>
        </div>
    );
}
