import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUser } from "@/components/providers/user-provider";
import {
    Apple,
    ArrowRight,
    ArrowUpRight,
    BoneIcon,
    Dog,
    DogIcon,
    FileTextIcon,
    Loader2,
    PlusIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DogProfileCard } from "@/components/app/dashboard/dog-profile-card";
import { RecipeTable } from "@/components/app/recipes/recipe-table";
import { Badge } from "@/components/ui/badge";
import { AddDogDialog } from "@/components/app/dashboard/add-dog-dialog";
import { useEffect, useState } from "react";
import { useAddDog } from "@/components/providers/add-dog-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import ShieldCheck from "@/assets/icons/shield-check";
import Users from "@/assets/icons/users";
import Page2 from "@/assets/icons/page-2";

export function DashboardPage() {
    const { profile, loading } = useUser();
    const { showAddDog, setShowAddDog } = useAddDog();
    const [sheetOpen, setSheetOpen] = useState(false);

    // Get first name for greeting
    const firstName = profile?.name?.split(" ")[0] || "there";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <header className="flex h-[4.5rem] shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                Dashboard
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="py-14 px-1">
                    <h1 className="text-4xl font-medium mb-1">
                        Hi {firstName},
                    </h1>
                    <h1 className="text-4xl font-medium">let's get started.</h1>
                </div>
                <div className="flex flex-col gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Your dogs</CardTitle>
                            <Button
                                variant="outline"
                                onClick={() => setShowAddDog(true)}
                            >
                                <PlusIcon className="w-4 h-4" />
                                Add dog
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <DogProfileCard />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent recipes</CardTitle>
                            <Button
                                variant="outline"
                                onClick={() => setSheetOpen(true)}
                            >
                                <PlusIcon className="w-4 h-4" />
                                Create recipe
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <RecipeTable
                                limit={5}
                                open={sheetOpen}
                                onOpenChange={setSheetOpen}
                                showNutritionStatus={true}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Helpful resources</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
                            <Card className="flex-1 rounded-sm hover:bg-background transition-colors duration-300">
                                <Link
                                    to="https://www.freshfoodtribe.com/how-to-start"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <CardContent className="p-4 px-5">
                                        <div className="flex flex-row items-center gap-4 text-sm [&>svg]:shrink-0 [&>svg]:size-8">
                                            <Page2
                                                strokeWidth={1.5}
                                                secondaryfill="hsl(var(--muted-foreground))"
                                            />
                                            <div className="flex flex-col gap-0">
                                                <p className="font-medium whitespace-nowrap">
                                                    Fresh feeding guide
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-regular text-muted-foreground group-hover:text-foreground group-hover:underline transition-colors">
                                                        Read now
                                                    </span>
                                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                            <Card className="flex-1 rounded-sm hover:bg-background transition-colors duration-300">
                                <Link
                                    to="https://www.freshfoodtribe.com/safety"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <CardContent className="p-4 px-5">
                                        <div className="flex flex-row items-center gap-4 text-sm [&>svg]:shrink-0 [&>svg]:size-8">
                                            <ShieldCheck
                                                strokeWidth={2}
                                                secondaryfill="hsl(var(--muted-foreground))"
                                            />
                                            <div className="flex flex-col gap-0">
                                                <p className="font-medium whitespace-nowrap">
                                                    Fresh feeding safety
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-regular text-muted-foreground group-hover:text-foreground group-hover:underline transition-colors">
                                                        View now
                                                    </span>
                                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                            <Card className="flex-1 rounded-sm hover:bg-background transition-colors duration-300">
                                <Link
                                    to="https://www.facebook.com/share/g/1F9fy5447T/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <CardContent className="p-4 px-5">
                                        <div className="flex flex-row items-center gap-4 text-sm [&>svg]:shrink-0 [&>svg]:size-8">
                                            <Users
                                                strokeWidth={1.5}
                                                secondaryfill="hsl(var(--muted-foreground))"
                                            />
                                            <div className="flex flex-col gap-0">
                                                <p className="font-medium whitespace-nowrap">
                                                    Facebook group
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-regular text-muted-foreground group-hover:text-foreground group-hover:underline transition-colors">
                                                        Join now
                                                    </span>
                                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
                <AddDogDialog open={showAddDog} onOpenChange={setShowAddDog} />
            </div>
        </>
    );
}
