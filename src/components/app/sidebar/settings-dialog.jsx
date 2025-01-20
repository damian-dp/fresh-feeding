import { useEffect, useState, useRef } from "react";
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
import { countries } from "countries-list";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Convert countries object to array format we need
const countryOptions = Object.entries(countries)
    .map(([code, country]) => ({
        value: code,
        label: country.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

export function SettingsDialog({ open, onOpenChange }) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { profile, loading: profileLoading } = useUser();
    const { theme, setTheme } = useTheme();
    // Initialize state with profile data or empty strings
    const [name, setName] = useState(profile?.name || "");
    const [email, setEmail] = useState(profile?.email || "");
    const [sendingVerification, setSendingVerification] = useState(false);
    const [country, setCountry] = useState(profile?.country || "");
    const [postcode, setPostcode] = useState(profile?.postcode || "");
    const [unitMetric, setUnitMetric] = useState(profile?.unit_metric ?? true);
    const [openCountry, setOpenCountry] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Track initial values to detect changes
    const initialValues = useRef({
        name: profile?.name || "",
        email: profile?.email || "",
        country: profile?.country || "",
        postcode: profile?.postcode || "",
        unitMetric: profile?.unit_metric ?? true,
    });

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!profile) return;

        if (open) {
            const values = {
                name: profile.name || "",
                email: profile.email || "",
                country: profile.country || "",
                postcode: profile.postcode || "",
                unitMetric: profile.unit_metric,
            };

            setName(values.name);
            setEmail(values.email);
            setCountry(values.country);
            setPostcode(values.postcode);
            setUnitMetric(values.unitMetric);
            initialValues.current = { ...values };
            setHasUnsavedChanges(false);
        }
    }, [open, profile]);

    // Check for changes during editing
    useEffect(() => {
        if (!open || !profile) return;

        const currentValues = {
            name,
            email,
            country,
            postcode,
            unitMetric,
        };

        const hasChanges = Object.keys(currentValues).some(
            (key) => currentValues[key] !== initialValues.current[key]
        );

        setHasUnsavedChanges(hasChanges);
    }, [name, email, country, postcode, unitMetric, open, profile]);

    // Handle dialog close
    const handleOpenChange = (isOpen) => {
        if (!isOpen && hasUnsavedChanges) {
            setShowDiscardDialog(true);
            return;
        }
        onOpenChange(isOpen);
    };

    // Handle confirming discard
    const handleConfirmDiscard = () => {
        setShowDiscardDialog(false);
        // Reset form to initial values
        setName(initialValues.current.name);
        setEmail(initialValues.current.email);
        setCountry(initialValues.current.country);
        setPostcode(initialValues.current.postcode);
        setUnitMetric(initialValues.current.unitMetric);
        // Close the dialog
        onOpenChange(false);
    };

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
                    postcode:
                        postcode.trim() === "" ? profile.postcode : postcode,
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
                        <Select value={country} onValueChange={setCountry}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent
                                className="max-h-[200px] w-[var(--radix-select-trigger-width)]"
                                side="bottom"
                                position="popper"
                                align="start"
                            >
                                <SelectGroup>
                                    {countryOptions.map((c) => (
                                        <SelectItem
                                            key={c.value}
                                            value={c.value}
                                            className="break-words hyphens-auto py-2 pr-2 [word-wrap:break-word]"
                                            style={{ maxWidth: "100%" }}
                                        >
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 w-full">
                        <Label htmlFor="postcode">Postcode</Label>
                        <Input
                            id="postcode"
                            value={postcode}
                            placeholder="Your postcode"
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
            <>
                <Dialog open={open} onOpenChange={handleOpenChange}>
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
                                    disabled={saving || !hasUnsavedChanges}
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

                <AlertDialog
                    open={showDiscardDialog}
                    onOpenChange={setShowDiscardDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Discard changes?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                You have unsaved changes. Are you sure you want
                                to discard them?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={handleConfirmDiscard}
                            >
                                Discard changes
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    return (
        <>
            <Drawer open={open} onOpenChange={handleOpenChange}>
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

            <AlertDialog
                open={showDiscardDialog}
                onOpenChange={setShowDiscardDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to
                            discard them?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleConfirmDiscard}
                        >
                            Discard changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
