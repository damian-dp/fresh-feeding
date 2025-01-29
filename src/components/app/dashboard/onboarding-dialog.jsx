import { useState, useEffect } from "react";
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

import { motion, AnimatePresence } from "framer-motion";
import FoodDog from "@/assets/icons/food-dog";
import DogHouse from "@/assets/icons/dog-house";
import TargetFull from "@/assets/icons/target-full";
import RecipeCreate from "@/assets/icons/recipe-create";
import DietFood from "@/assets/icons/diet-food";
import Discount from "@/assets/icons/discount";
import { Badge } from "@/components/ui/badge";

export function OnboardingDialog() {
    const { profile, completeOnboarding } = useUser();
    const [step, setStep] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [contentHeight, setContentHeight] = useState("auto");
    const [isDialogReady, setIsDialogReady] = useState(false);

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

    const FooterContent = (
        <div className="flex justify-center gap-2 w-full mt-5">
            <Button
                variant="ghost"
                onClick={step === 0 ? handleSkip : () => setStep(step - 1)}
            >
                {step === 0 ? "Skip" : "Back"}
            </Button>
            <Button
                variant="outline"
                onClick={step === 4 ? handleComplete : () => setStep(step + 1)}
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        Setting up
                        <Loader2 className="animate-spin" />

                    </>
                ) : (
                    <>
                        {step === 4 && "Get started"}
                        {step === 3 && "Next"}
                        {step === 2 && "Next"}
                        {step === 1 && "Next"}
                        {step === 0 && "Take a tour"}
                        <ArrowRight className="" />
                    </>
                )}
            </Button>
        </div>
    );

    const Content = (
        <motion.div
            layout
            animate={{ height: contentHeight }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative"
            initial={false}
        >
            <AnimatePresence
                mode="wait"
                onExitComplete={() => setContentHeight("auto")}
            >
                <motion.div
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                    onLayoutMeasure={(info) => {
                        setContentHeight(info.height);
                    }}
                >
                    <div className="step-content flex flex-col items-center justify-center">
                        {step === 0 && (
                            <>
                                <div className="flex flex-col gap-6 items-center justify-center pt-2">
                                    <div className="bg-organ text-organ-foreground border-2 border-organ-border rounded-full p-12 mb-8 [&>svg]:-translate-y-0.5">
                                        <FoodDog
                                            width={130}
                                            height={130}
                                            secondaryfill="hsl(var(--organ-border))"
                                        />
                                    </div>

                                    <h2 className="text-[2rem] font-medium text-center leading-[1.2]">
                                        Welcome to the fresh <br />
                                        feeding revolution
                                    </h2>
                                    <p className="text-center text-sm leading-relaxed font-normal text-muted-foreground max-w-sm">
                                        Empowering dog parents to create
                                        balanced, species appropriate meals for
                                        healthier, happier pups
                                    </p>
                                    {FooterContent}
                                </div>
                            </>
                        )}

                        {step === 1 && (
                            <>
                                <div className="flex flex-col gap-6 items-center justify-center pt-2">
                                    <div className="bg-plant text-plant-foreground border-2 border-plant-border rounded-full p-12 mb-8 [&>svg]:translate-y-1">
                                        <TargetFull
                                            width={130}
                                            height={130}
                                            secondaryfill="hsl(var(--plant-border))"
                                        />
                                    </div>

                                    <h2 className="text-[2rem] font-medium text-center leading-[1.2]">
                                        Create your pup’s profile <br />
                                        and set their goals
                                    </h2>
                                    <p className="text-center text-sm leading-relaxed font-normal text-muted-foreground max-w-sm">
                                        Get optimal feeding ratios by providing
                                        your pup’s details and setting goals
                                        like maintaining, losing, or gaining
                                        weight.
                                    </p>
                                    {FooterContent}
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="flex flex-col gap-6 items-center justify-center pt-2">
                                    <div className="bg-meat text-meat-foreground/70 border-2 border-meat-border rounded-full p-12 mb-8 [&>svg]:translate-x-1">
                                        <RecipeCreate
                                            width={130}
                                            height={130}
                                            secondaryfill="hsl(var(--meat-border))"
                                        />
                                    </div>

                                    <h2 className="text-[2rem] font-medium text-center leading-[1.2]">
                                        Create, edit and share recipes <br />
                                        with nutritional insights
                                    </h2>
                                    <p className="text-center text-sm leading-relaxed font-normal text-muted-foreground max-w-[27rem]">
                                        Craft recipes tailored to your dogs, get
                                        portion recommendations, track how long
                                        each batch will last, and identify
                                        nutritional gaps.
                                    </p>
                                    {FooterContent}
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="flex flex-col gap-6 items-center justify-center pt-2">
                                    <div className="bg-plant text-plant-foreground/60 border-2 border-plant-border rounded-full p-12 mb-8 [&>svg]:-translate-x-1">
                                        <DietFood
                                            width={130}
                                            height={130}
                                            secondaryfill="hsl(var(--plant-border))"
                                        />
                                    </div>

                                    <Badge size="sm" className="-mb-3">
                                        Coming soon
                                    </Badge>

                                    <h2 className="text-[2rem] font-medium text-center leading-[1.2]">
                                        Explore nutritionist-curated <br />
                                        ingredients and recipes
                                    </h2>
                                    <p className="text-center text-sm leading-relaxed font-normal text-muted-foreground max-w-[27rem]">
                                        Search our extensive ingredient database
                                        with detailed nutrient information, or
                                        browse recipes crafted by nutritionists.
                                    </p>
                                    {FooterContent}
                                </div>
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <div className="flex flex-col gap-6 items-center justify-center pt-2">
                                    <div className="bg-organ text-organ-foreground/60 border-2 border-organ-border rounded-full p-12 mb-8 [&>svg]:-translate-x-0">
                                        <Discount
                                            width={130}
                                            height={130}
                                            secondaryfill="hsl(var(--organ-border))"
                                        />
                                    </div>

                                    <Badge size="sm" className="-mb-3">
                                        Coming soon
                                    </Badge>

                                    <h2 className="text-[2rem] font-medium text-center leading-[1.2]">
                                        Find suppliers and <br />
                                        exclusive discounts
                                    </h2>
                                    <p className="text-center text-sm leading-relaxed font-normal text-muted-foreground max-w-[22rem]">
                                        Access fresh feeding suppliers around
                                        you, offering high-quality ingredients
                                        and exclusive discount codes.
                                    </p>
                                    {FooterContent}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );

    useEffect(() => {
        const element = document.querySelector(".step-content");
        if (element) {
            setContentHeight(element.offsetHeight);
        }
    }, [step]);

    if (isDesktop) {
        return (
            <Dialog open={open}>
                <DialogContent className="max-w-[38rem] py-16 px-8">
                    <DialogHeader className="hidden">
                        <DialogTitle>Welcome</DialogTitle>
                        <DialogDescription>
                            Let's get you started with Fresh Food Feeding
                        </DialogDescription>
                    </DialogHeader>
                    {Content}
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
            </DrawerContent>
        </Drawer>
    );
}
