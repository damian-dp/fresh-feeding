import {
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    PlusIcon,
    SearchIcon,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RecipeTable } from "@/components/app/recipes/recipe-table";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export function UserRecipesPage() {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <>
            <header className="flex h-[4.5rem] shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <Link to="/dashboard">
                                    <BreadcrumbLink>Dashboard</BreadcrumbLink>
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Your recipes</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
                <Card>
                    <CardHeader className="h-auto py-6 flex flex-col gap-6">
                        <div className="flex flex-row items-center justify-between">
                            <CardTitle>Your recipes</CardTitle>
                            <Button
                                variant="outline"
                                onClick={() => setSheetOpen(true)}
                            >
                                <PlusIcon className="w-4 h-4" />
                                Create recipe
                            </Button>
                        </div>
                        <div className="relative">
                            <Input
                                className="pl-9"
                                placeholder="Search recipes"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RecipeTable
                            open={sheetOpen}
                            onOpenChange={setSheetOpen}
                            searchQuery={searchQuery}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
