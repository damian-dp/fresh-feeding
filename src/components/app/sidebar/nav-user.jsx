"use client";

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Loader2,
    Sparkles,
    Settings2,
    HelpCircle,
} from "lucide-react";
import { useUser } from "@/components/providers/user-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { SettingsDialog } from "./settings-dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

export function NavUser() {
    const { isMobile } = useSidebar();
    const { profile, loading } = useUser();
    const { session } = useAuth();
    const [showSettings, setShowSettings] = useState(false);

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

    if (loading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="xl">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                                Loading...
                            </span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    // Use email from session as fallback
    const userEmail = profile?.email || session?.user?.email;
    const userName = profile?.name || userEmail?.split("@")[0];
    const userAvatar = profile?.user_avatar;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="xl"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={userAvatar} alt={userName} />
                                <AvatarFallback className="rounded-lg">
                                    {userName?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {userName}
                                </span>
                                <span className="truncate text-xs">
                                    {userEmail}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={userAvatar}
                                        alt={userName}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {userName?.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {userName}
                                    </span>
                                    <span className="truncate text-xs">
                                        {userEmail}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => setShowSettings(true)}
                            >
                                <Settings2 className="mr-2 h-4 w-4" />
                                Account Settings
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Get help
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <SettingsDialog
                    open={showSettings}
                    onOpenChange={setShowSettings}
                />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
