import {
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    PlusIcon,
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

export function UserRecipesPage() {
    const [sheetOpen, setSheetOpen] = useState(false);

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
                                    Dashboard
                                </BreadcrumbLink>
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
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Your recipes</CardTitle>
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
                            open={sheetOpen}
                            onOpenChange={setSheetOpen}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
