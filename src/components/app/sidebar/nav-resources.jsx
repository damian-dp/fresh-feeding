import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import Dog from "@/assets/icons/dog";
import DogOutline from "@/assets/icons/dog-outline";
import { Badge } from "@/components/ui/badge";
import DietApple from "@/assets/icons/diet-apple";
import BookOpen4 from "@/assets/icons/book-open-4";
import BasketShopping from "@/assets/icons/basket-shopping";

export function NavResources({ resources }) {
    const { pathname } = useLocation();

    return (
        <SidebarGroup className="block group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
            <SidebarMenu className="gap-0">
                {/* {resources.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                            tooltip={item.name}
                            asChild
                            className={pathname === item.url ? "bg-accent ring-1 ring-border" : ""}
                            
                        >
                            <Link to={item.url}>
                                <item.icon />
                                <span>{item.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))} */}

                <div className="flex text-sm flex-row items-center justify-between gap-2 p-3 whitespace-nowrap cursor-not-allowed opacity-60">
                    <div className="flex flex-row items-center gap-2.5">
                        <DietApple width={20} height={20} strokewidth={1.5} />
                        <span>Ingredients</span>
                    </div>
                    <Badge size="sm">Coming soon</Badge>
                </div>

                <div className="flex text-sm flex-row items-center justify-between gap-2 p-3 whitespace-nowrap cursor-not-allowed opacity-60">
                    <div className="flex flex-row items-center gap-2.5">
                        <BookOpen4 width={20} height={20} strokewidth={1.5} />
                        <span>Recipes</span>
                    </div>
                    <Badge size="sm">Coming soon</Badge>
                </div>
                <div className="flex text-sm flex-row items-center justify-between gap-2 p-3 whitespace-nowrap cursor-not-allowed opacity-60">
                    <div className="flex flex-row items-center gap-2.5">
                        <BasketShopping width={20} height={20} strokewidth={1.5} />
                        <span>Suppliers</span>
                    </div>
                    <Badge size="sm">Coming soon</Badge>
                </div>
            </SidebarMenu>
        </SidebarGroup>
    );
}
