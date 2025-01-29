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

export function NavResources({ resources }) {
    const { pathname } = useLocation();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
            <SidebarMenu>
                {resources.map((item) => (
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
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
