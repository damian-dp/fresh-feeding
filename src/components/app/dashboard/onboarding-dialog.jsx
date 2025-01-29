import { useState } from "react";
import { useUser } from "@/components/providers/user-provider";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

export function OnboardingDialog() {
    const { profile, completeOnboarding } = useUser();
    const [step, setStep] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Only show if user is new
    const open = profile?.new_user ?? false;

    const handleComplete = async () => {
        try {
            setIsPending(true);
            await completeOnboarding();
        } catch (error) {
            console.error("Error completing onboarding:", error);
        } finally {
            setIsPending(false);
        }
    };

    const handleSkip = async () => {
        await handleComplete();
    };

    const Content = (
        <div className="flex flex-col gap-6">
            {/* Add your onboarding content here */}
            <div className="space-y-4">
                <h2 className="text-2xl font-medium">
                    Welcome to Fresh Food Feeding
                </h2>
                <p className="text-muted-foreground">
                    Let's get you set up with everything you need to feed your
                    dog fresh, healthy food.
                </p>
            </div>
        </div>
    );

    const FooterContent = (
        <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={handleSkip}>
                Skip
            </Button>
            <Button onClick={handleComplete} disabled={isPending}>
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                    </>
                ) : (
                    <>
                        Get started
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Welcome</DialogTitle>
                        <DialogDescription>
                            Let's get you started with Fresh Food Feeding
                        </DialogDescription>
                    </DialogHeader>
                    {Content}
                    <DialogFooter>{FooterContent}</DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Welcome</DrawerTitle>
                    <DrawerDescription>
                        Let's get you started with Fresh Food Feeding
                    </DrawerDescription>
                </DrawerHeader>
                {Content}
                <DrawerFooter>{FooterContent}</DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
