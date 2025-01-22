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
    Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DogProfileCard } from "@/components/app/dashboard/dog-profile-card";
import { RecipeTable } from "@/components/app/recipes/recipe-table";
import { Badge } from "@/components/ui/badge";
import { AddDogDialog } from "@/components/app/dashboard/add-dog-dialog";
import { useState } from "react";

export function DashboardPage() {
    const { profile, loading } = useUser();
    const [showAddDog, setShowAddDog] = useState(false);


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
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Building Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
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
                            <Button variant="outline" onClick={() => setShowAddDog(true)}>
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
                            <Button variant="outline" asChild>
                                <Link to="/recipes/new">
                                    <PlusIcon className="w-4 h-4" />
                                    Create recipe
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <RecipeTable limit={5} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Helpful resources</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="flex-1 rounded-sm hover:bg-background transition-colors duration-300">
                                <Link to="/ingredients">
                                    <CardContent className="p-4">
                                        <div className="flex flex-row items-center gap-4 text-sm">
                                            <Apple className="w-9 h-9" />
                                            <div className="flex flex-col gap-0">
                                                <p className="font-medium">
                                                    Ingredients database
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-regular text-muted-foreground group-hover:text-foreground group-hover:underline transition-colors">
                                                        View now
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>

                            <Card className="flex-1 rounded-sm hover:bg-background transition-colors duration-300">
                                <Link to="/ingredients">
                                    <CardContent className="p-4">
                                        <div className="flex flex-row items-center gap-4 text-sm">
                                            <FileTextIcon className="w-9 h-9" />
                                            <div className="flex flex-col gap-0">
                                                <p className="font-medium">
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
                                <Link to="/ingredients">
                                    <CardContent className="p-4">
                                        <div className="flex flex-row items-center gap-4 text-sm">
                                            <Users className="w-9 h-9" />
                                            <div className="flex flex-col gap-0">
                                                <p className="font-medium">
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
