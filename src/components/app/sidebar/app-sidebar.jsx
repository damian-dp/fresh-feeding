import * as React from "react";
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
    DogIcon,
    LayoutDashboard,
    CookingPot,
    Apple,
    ShoppingBasket,
    LogOut,
} from "lucide-react";

import { NavMain } from "@/components/app/sidebar/nav-main";
import { NavResources } from "@/components/app/sidebar/nav-resources";
import { NavFooter } from "@/components/app/sidebar/nav-footer";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ViewAll from "@/assets/icons/view-all";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavAdmin } from "./nav-admin";
import { useUser } from "@/components/providers/user-provider";

// This is sample data.
const data = {
    user: {
        name: "User Name",
        email: "user@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
    main: [
        {
            name: "Dashboard",
            url: "/dashboard",
            icon: ViewAll,
        },
        {
            name: "Your Recipes",
            url: "/recipes",
            icon: CookingPot,
        },
    ],
    resources: [
        {
            name: "Ingredient Database",
            url: "/ingredients",
            icon: Apple,
        },
        {
            name: "Suppliers",
            url: "/suppliers",
            icon: ShoppingBasket,
        },
    ],
    account: [
        {
            name: "Account Settings",
            icon: Settings2,
        },
        {
            name: "Log out",
            icon: LogOut,
        },
    ],
};

export function AppSidebar({ ...props }) {
    const { isAdmin } = useUser();

    return (
        <Sidebar
            variant="floating"
            collapsible="icon"
            {...props}
            side={useIsMobile ? "bottom" : "left"}
        >
            <SidebarHeader className="hidden md:block">
                <div className="flex flex-row items-center gap-3 p-3 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
                    <img
                        src="/logo-mark.svg"
                        alt="Logo"
                        className="size-9 group-data-[collapsible=icon]:size-7"
                    />
                    <img
                        src="/logo-stack.svg"
                        alt="Logo"
                        className="h-9 group-data-[collapsible=icon]:hidden"
                    />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain main={data.main} />
                {/* <Separator className="hidden border-sidebar-border w-[60%] mx-auto group-data-[collapsible=icon]:block" /> */}
                <NavResources resources={data.resources} />

                {isAdmin && <NavAdmin />}
            </SidebarContent>
            <SidebarFooter>
                <NavFooter account={data.account} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
