"use client";

import { ChevronRight, DogIcon, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useDogs } from "@/components/providers/dogs-provider";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import Dog from "@/assets/icons/dog";
import DogOutline from "@/assets/icons/dog-outline";
import ViewAll from "@/assets/icons/view-all";
import Diet from "@/assets/icons/diet";

export function NavMain({ main }) {
    const { isMobile } = useSidebar();
    const { dogs, loading } = useDogs();
    const { pathname } = useLocation();

    return (
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        tooltip="Dashboard"
                        asChild
                        className={
                            pathname === "/dashboard"
                                ? "bg-sidebar-accent ring-1 ring-border/50"
                                : ""
                        }
                    >
                        <Link to="/dashboard">
                            <ViewAll
                                width={20}
                                height={20}
                                strokewidth={1.5}
                                secondaryfill="hsl(var(--muted-foreground))"
                            />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        tooltip="Your Recipes"
                        asChild
                        className={
                            pathname === "/recipes"
                                ? "bg-sidebar-accent ring-1 ring-border/50"
                                : ""
                        }
                    >
                        <Link to="/recipes">
                            <Diet
                                width={20}
                                height={20}
                                strokewidth={1.5}
                                secondaryfill="hsl(var(--muted-foreground))"
                            />
                            <span>Your recipes</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block">
                    <SidebarTrigger
                        icon="dog"
                        className="[&>svg]:size-8 [&>svg]:width-8 [&>svg]:height-8"
                    />
                </SidebarMenuItem>
                <Collapsible
                    asChild
                    defaultOpen
                    className="group/collapsible group-data-[collapsible=icon]:hidden"
                >
                    {dogs?.length > 0 && (
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Your Dogs">
                                <DogOutline
                                    width={20}
                                    height={20}
                                    strokeWidth={1.5}
                                    secondaryFill="hsl(var(--muted-foreground))"
                                />
                                <span className="truncate">Your dogs</span>
                                <ChevronRight className="absolute right-3 transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {loading ? (
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton disabled>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            <span>Loading...</span>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ) : (
                                    <>
                                        {dogs.map((dog) => (
                                            <SidebarMenuSubItem
                                                key={dog.dog_id}
                                            >
                                                <SidebarMenuSubButton
                                                    asChild
                                                    className={
                                                        pathname ===
                                                        `/dogs/${dog.dog_id}`
                                                            ? "bg-sidebar-accent ring-1 ring-border/50"
                                                            : ""
                                                    }
                                                >
                                                    <Link
                                                        to={`/dogs/${dog.dog_id}`}
                                                    >
                                                        {dog.dog_name}
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </>
                                )}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                    )}
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}
