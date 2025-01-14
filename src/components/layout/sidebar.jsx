import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
    Menu,
    LayoutDashboard,
    UtensilsCrossed,
    Dog as DogIcon,
    Apple as AppleIcon,
} from "lucide-react";
import { authService } from "@/lib/stores/auth-store";
import { useAuth } from "@/components/providers/auth-provider";

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Recipes",
        href: "/recipes",
        icon: UtensilsCrossed,
    },
    {
        name: "Dogs",
        href: "/dogs",
        icon: DogIcon,
    },
    {
        name: "Ingredients",
        href: "/ingredients",
        icon: AppleIcon,
    },
];

export function Sidebar({ preview }) {
    const { session } = useAuth();

    // Don't fetch real data in preview mode
    if (preview) {
        return (
            <div className="h-full p-4">
                <div className="font-semibold text-lg mb-8">Fresh Feeding</div>
                <nav className="space-y-2">
                    {navigation.map((item) => (
                        <Button
                            key={item.name}
                            variant="ghost"
                            className="w-full justify-start"
                        >
                            <item.icon className="mr-2 h-5 w-5" />
                            {item.name}
                        </Button>
                    ))}
                </nav>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon" className="lg:hidden">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                    <SheetHeader>
                        <SheetTitle>Fresh Food Feeding</SheetTitle>
                    </SheetHeader>
                    <Separator className="my-4" />
                    <nav className="flex flex-col space-y-1">
                        {navigation.map((item) => (
                            <Link key={item.name} to={item.href}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                >
                                    <item.icon className="mr-2 h-5 w-5" />
                                    {item.name}
                                </Button>
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0">
                <div className="flex flex-col flex-grow border-r bg-background">
                    <div className="flex h-16 items-center px-4 font-semibold">
                        Fresh Food Feeding
                    </div>
                    <Separator />
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => (
                            <Link key={item.name} to={item.href}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                >
                                    <item.icon className="mr-2 h-5 w-5" />
                                    {item.name}
                                </Button>
                            </Link>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
