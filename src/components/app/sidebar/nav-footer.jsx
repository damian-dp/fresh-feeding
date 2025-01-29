import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useSettingsDialog } from "@/components/providers/settings-dialog-provider";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

export function NavFooter({ account }) {
    const { setShowSettings } = useSettingsDialog();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Error logging out:", error);
            toast.error("Error logging out");
        }
    };

    return (
        <SidebarGroup>
            <SidebarMenu>
                {account.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                            tooltip={item.name}
                            
                            onClick={
                                item.name === "Account Settings"
                                    ? () => setShowSettings(true)
                                    : handleLogout
                            }
                            className={
                                item.name !== "Account Settings"
                                    ? "hover:bg-error hover:text-error-foreground hover:ring-error-border"
                                    : ""
                            }
                        >
                            <item.icon />
                            <span>{item.name}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
