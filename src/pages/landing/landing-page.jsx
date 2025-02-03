import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Dog, Dot, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturePills } from "@/components/landing-page/feature-pills";
import { AppDemoScreen } from "@/components/landing-page/app-demo-screen";
import { TestimonialsGrid } from "@/components/landing-page/testimonials-grid";
import { useLoading } from "@/hooks/use-loading";
import { useAuth } from "@/components/providers/auth-provider";
import DogOutline from "@/assets/icons/dog-outline";
import { LandingNavbar } from "@/components/landing-page/landing-navbar";
import { LandingFooter } from "@/components/landing-page/landing-footer";

export function LandingPage() {
    const isLoading = useLoading();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [activeFeature, setActiveFeature] = useState("Recipes");

    // Only wait for page load
    if (isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
        >
            <LandingNavbar />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="pt-[4.7rem]">
                    <div className="container max-w-[82rem] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center md:min-h-[28rem] flex flex-col justify-center py-14 sm:py-20 md:py-24">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight sm:leading-[1.1] md:leading-[1.1] lg:leading-[1.1] mb-8"
                            >
                                Welcome to the fresh <br /> feeding revolution
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 max-w-xs sm:max-w-lg md:max-w-xl mx-auto"
                            >
                                Create balanced, species-appropriate raw food
                                recipes for your dogs. Get customised ratios,
                                track nutrients and manage multiple pets.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex justify-center gap-4"
                            >
                                <Button variant="plant" size="lg" asChild>
                                    <Link
                                        to={
                                            isAuthenticated
                                                ? "/dashboard"
                                                : "/auth"
                                        }
                                    >
                                        Get started
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        {/* <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-14"
                        >
                            <FeaturePills
                                activeFeature={activeFeature}
                                setActiveFeature={setActiveFeature}
                            />
                        </motion.div>

                        <AppDemoScreen activeFeature={activeFeature} /> */}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className=" w-full rounded-sm md:rounded-lg overflow-hidden border border-border/35 ring-4 md:ring-8 ring-white/50 ring-backdrop-blur-sm ring-offset-background bg-background shadow-2xl"
                        >
                            <img
                                src="/landing-demo-screen.svg"
                                className="w-full"
                            />
                        </motion.div>
                    </div>
                </section>

                <section className="py-20 sm:py-28 md:py-32">
                    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-center mb-10 sm:mb-12 md:mb-14 max-w-sm sm:max-w-[30rem] md:max-w-xl mx-auto">
                            The tools you need to make raw and fresh
                            feeding achievable
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-[52rem] mx-auto">
                            <motion.div
                                key="1"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="bg-card rounded-lg border border-border p-8 pt-4 pb-7">
                                    <div className="flex items-center justify-center w-full h-72">
                                        <div className="relative z-20 inline-flex py-0 pl-4 h-auto w-auto bg-transparent border-none items-end">
                                            <div className="inline-flex w-12 h-12 z-10 absolute left-0 text-foreground items-center justify-center rounded-full  border border-border bg-background ">
                                                <Pencil className="size-5" />
                                            </div>
                                            <div className="relative w-32 h-32 rounded-full text-muted-foreground overflow-hidden bg-background border border-border flex items-center justify-center">
                                                <DogOutline
                                                    width={70}
                                                    height={70}
                                                    secondaryColor="var(--muted)"
                                                />
                                            </div>
                                        </div>
                                        <div className="relative z-10 -ml-[4rem] inline-flex w-auto bg-transparent border-none items-end">
                                            <div className="relative w-32 h-32 rounded-full text-muted-foreground overflow-hidden bg-background border border-border flex items-center justify-center">
                                                <DogOutline
                                                    width={70}
                                                    height={70}
                                                    secondaryColor="var(--muted)"
                                                />
                                            </div>
                                        </div>
                                        <div className="relative z-0 -ml-[4rem] inline-flex w-auto bg-transparent border-none items-end">
                                            <div className="relative w-32 h-32 rounded-full text-muted-foreground overflow-hidden bg-background border border-border flex items-center justify-center">
                                                <DogOutline
                                                    width={70}
                                                    height={70}
                                                    secondaryColor="var(--muted)"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-medium mb-2">
                                        Manage your dogs profiles
                                    </h3>
                                    <p className="text-muted-foreground text-sm sm:text-[.95rem] leading-[1.6] sm:leading-[1.6] ">
                                        Get optimal feeding ratios by providing
                                        your pup's details and setting goals
                                        like maintaining, losing, or gaining
                                        weight.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                key="2"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="bg-card rounded-lg border border-border p-8 pt-4 pb-7">
                                    <div className="flex flex-col gap-4 scale-90 items-center justify-center w-full h-72">
                                        <img src="/goals/pill-2.svg" />
                                        <img src="/goals/pill-1.svg" />
                                        <img src="/goals/pill-3.svg" />
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-medium mb-2">
                                        Manage your dogs profiles
                                    </h3>
                                    <p className="text-muted-foreground text-sm sm:text-[.95rem] leading-[1.6] sm:leading-[1.6] ">
                                        Get optimal feeding ratios by providing
                                        your pup's details and setting goals
                                        like maintaining, losing, or gaining
                                        weight.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                key="3"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="bg-card rounded-lg border border-border p-8 pt-4 pb-7">
                                    <div className="flex flex-col gap-4 scale-[.85] items-center justify-center w-full h-72">
                                        <img src="/goals/ratios.svg" />
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-medium mb-2">
                                        Manage your dogs profiles
                                    </h3>
                                    <p className="text-muted-foreground text-sm sm:text-[.95rem] leading-[1.6] sm:leading-[1.6] ">
                                        Get optimal feeding ratios by providing
                                        your pup's details and setting goals
                                        like maintaining, losing, or gaining
                                        weight.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                key="4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="bg-card rounded-lg border border-border p-8 pt-4 pb-7">
                                    <div className="flex flex-col gap-4 scale-[.95] pt-6 items-center justify-center w-full h-72">
                                        <img src="/goals/table.svg" />
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-medium mb-2">
                                        Manage your dogs profiles
                                    </h3>
                                    <p className="text-muted-foreground text-sm sm:text-[.95rem] leading-[1.6] sm:leading-[1.6] ">
                                        Get optimal feeding ratios by providing
                                        your pup's details and setting goals
                                        like maintaining, losing, or gaining
                                        weight.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                {/* <section className="py-24 bg-muted/50">
                    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">
                                Loved by dog parents worldwide
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                See what our customers have to say about Fresh
                                Feeding
                            </p>
                        </div>
                        <TestimonialsGrid />
                    </div>
                </section> */}
            </main>
            <div className="w-full pb-8 pt-6 px-2 max-w-5xl border-t border-border mx-auto">
                <LandingFooter />
            </div>
        </motion.div>
    );
}
