import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/components/providers/user-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { AlertCircle, CheckCheck, Loader2, Trash, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const countries = [
    { value: "AU", label: "Australia" },
    { value: "NZ", label: "New Zealand" },
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "GB", label: "United Kingdom" },
    // Add more countries as needed
];

export function SettingsDialog({ open, onOpenChange }) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { profile, loading: profileLoading } = useUser();
    const { theme, setTheme } = useTheme();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [sendingVerification, setSendingVerification] = useState(false);
    const [country, setCountry] = useState("");
    const [postcode, setPostcode] = useState("");
    const [unitMetric, setUnitMetric] = useState(true);
    const [openCountry, setOpenCountry] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setEmail(profile?.email || "");
            setCountry(profile.country || "");
            setPostcode(profile.postcode || "");
            setUnitMetric(profile.unit_metric);
        }
    }, [profile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        let emailError = null;

        try {
            // Handle email change separately
            if (email !== profile.email) {
                const { error } = await supabase.auth.updateUser({
                    email,
                });
                if (error) {
                    emailError = error;
                    // Show error but continue with other updates
                    if (error.message.includes("already registered")) {
                        toast.error("This email is already registered");
                    } else {
                        toast.error(error.message || "Failed to update email");
                    }
                }
            }

            const { error } = await supabase
                .from("profiles")
                .update({
                    name,
                    country,
                    postcode,
                    unit_metric: unitMetric,
                })
                .eq("profile_id", profile.profile_id);

            if (error) throw error;

            // Show appropriate success message
            if (!emailError) {
                toast.success(
                    email !== profile.email
                        ? "Settings updated and verification email sent"
                        : "Settings updated successfully"
                );
            } else {
                toast.success("Settings updated but email change failed");
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const handleResendVerification = async () => {
        if (sendingVerification) return;
        setSendingVerification(true);
        try {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email: profile.email,
            });
            if (error) {
                if (error.message.includes("Email rate limit exceeded")) {
                    toast.error(
                        "Please wait a few minutes before trying again"
                    );
                } else {
                    toast.error(
                        error.message || "Failed to send verification email"
                    );
                }
            } else {
                toast.success("Verification email sent!");
            }
        } catch (error) {
            console.error("Error sending verification:", error);
            toast.error("Failed to send verification email");
        } finally {
            setSendingVerification(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    const Content = (
        <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6 px-6">
                <p className="font-medium">Personal details</p>
                <div className="flex flex-row gap-6">
                    <div className="space-y-2 w-full">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 w-full">
                        <Label htmlFor="email">
                            Email
                            {!profile?.email_confirmed_at && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <AlertCircle className="h-4 w-4 text-warning" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Email not verified.{" "}
                                                <button
                                                    onClick={
                                                        handleResendVerification
                                                    }
                                                    className="underline font-medium hover:text-primary"
                                                    disabled={
                                                        sendingVerification
                                                    }
                                                >
                                                    {sendingVerification
                                                        ? "Sending..."
                                                        : "Send again"}
                                                </button>
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </Label>

                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-row gap-6">
                    <div className="space-y-2 w-full">
                        <Label htmlFor="country">Country</Label>
                        <Popover
                            open={openCountry}
                            onOpenChange={setOpenCountry}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCountry}
                                    className="w-full justify-between"
                                >
                                    {country
                                        ? countries.find(
                                              (c) => c.value === country
                                          )?.label
                                        : "Select country..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            No country found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {countries.map((c) => (
                                                <CommandItem
                                                    key={c.value}
                                                    value={c.value}
                                                    onSelect={(
                                                        currentValue
                                                    ) => {
                                                        setCountry(
                                                            currentValue ===
                                                                country
                                                                ? ""
                                                                : currentValue
                                                        );
                                                        setOpenCountry(false);
                                                    }}
                                                >
                                                    {c.label}
                                                    <Check
                                                        className={cn(
                                                            "ml-auto",
                                                            country === c.value
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2 w-full">
                        <Label htmlFor="postcode">Postcode</Label>
                        <Input
                            id="postcode"
                            value={postcode}
                            onChange={(e) => setPostcode(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <Separator />
            <div className="space-y-6 px-6">
                <p className="font-medium">App preferences</p>
                <div className="flex flex-row gap-6">
                    <div className="space-y-2 w-full">
                        <Label htmlFor="measurement">Measurement system</Label>
                        <Select
                            value={unitMetric ? "metric" : "imperial"}
                            onValueChange={(value) =>
                                setUnitMetric(value === "metric")
                            }
                        >
                            <SelectTrigger className="">
                                <SelectValue placeholder="Select measurement system" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="metric">
                                        Metric{" "}
                                        <span className="text-muted-foreground">
                                            (kg, g)
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="imperial">
                                        Imperial{" "}
                                        <span className="text-muted-foreground">
                                            (lb, oz)
                                        </span>
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 w-full">
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">
                                        System
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </form>
    );

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle>Account Settings</DialogTitle>
                        <DialogDescription className="hidden">
                            Update your account preferences.
                        </DialogDescription>
                        <Avatar className="size-12 mt-0">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback className="text-lg">
                                {profile?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                        </Avatar>
                    </DialogHeader>
                    <div className="py-6">{Content}</div>
                    <DialogFooter>
                        <div className="flex flex-row items-center gap-2">
                            <DialogClose asChild>
                                <Button variant="link">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="outline"
                                form="settings-form"
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="mr-2 h-4 w-4" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Account Settings</DrawerTitle>
                    <DrawerDescription>
                        Update your account preferences.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">{Content}</div>
            </DrawerContent>
        </Drawer>
    );
}
