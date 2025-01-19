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
} from "lucide-react";

import { NavMain } from "@/components/app/sidebar/nav-main";
import { NavResources } from "@/components/app/sidebar/nav-resources";
import { NavUser } from "@/components/app/sidebar/nav-user";
import { TeamSwitcher } from "@/components/app/sidebar/team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

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
            icon: LayoutDashboard,
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
};

export function AppSidebar({ ...props }) {
    return (
        <Sidebar
            variant="floating"
            collapsible="icon"
            {...props}
        >
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain main={data.main} />
                <Separator className="hidden border-sidebar-border w-[60%] mx-auto group-data-[collapsible=icon]:block" />
                <NavResources resources={data.resources} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
