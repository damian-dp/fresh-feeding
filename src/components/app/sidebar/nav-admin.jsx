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
import ViewAll from "@/assets/icons/view-all";
import { useIsMobile } from "@/hooks/use-mobile";
export function NavAdmin() {
    const { pathname } = useLocation();
    const { toggleSidebar } = useSidebar();
    const { isMobile } = useIsMobile();

    return (
        <>
            <SidebarGroup className="block group-data-[collapsible=icon]:hidden">
                <SidebarGroupLabel>Admin & Beta</SidebarGroupLabel>
                <SidebarMenu className="">
                    <SidebarMenuButton
                        tooltip="Admin Dashboard"
                        asChild
                        className={
                            pathname === "/admin-dashboard"
                                ? "bg-sidebar-accent ring-1 ring-border/50"
                                : ""
                        }
                        onClick={
                            isMobile
                                ? () => {
                                      toggleSidebar();
                                  }
                                : undefined
                        }
                    >
                        <Link to="/admin-dashboard">
                            <ViewAll
                                width={20}
                                height={20}
                                strokewidth={1.5}
                                secondaryfill="hsl(var(--muted-foreground))"
                            />
                            <span>Admin Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}
