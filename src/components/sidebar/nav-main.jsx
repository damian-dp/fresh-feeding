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
    useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({ main }) {
    const { isMobile } = useSidebar();
    const { dogs, loading } = useDogs();
    const { pathname } = useLocation();

    return (
        <SidebarGroup>
            <SidebarMenu>
                {main.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                            tooltip={item.name}
                            asChild
                            className={pathname === item.url ? "bg-accent" : ""}
                        >
                            <Link to={item.url}>
                                <item.icon />
                                <span>{item.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                <Collapsible asChild className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Dogs">
                                <DogIcon />
                                <span className="truncate">Your Dogs</span>
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
                                ) : dogs?.length === 0 ? (
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link to="/dogs/new">
                                                Add your first dog
                                            </Link>
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
                                                            ? "bg-accent"
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
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}
