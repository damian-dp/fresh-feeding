import { useEffect, useState } from "react";
import {
    CalendarDays,
    CheckCheck,
    ImagePlus,
    Loader2,
    Pencil,
    Trash,
    X,
} from "lucide-react";
import Dog from "@/assets/icons/dog";
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
    DrawerFooter,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/providers/user-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse, isValid, format as formatDate } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { ImageEditorDialog } from "@/components/app/dashboard/image-editor";
import { useDogs } from "@/components/providers/dogs-provider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import DogOutline from "@/assets/icons/dog-outline";
import PhotoPlus from "@/assets/icons/photo-plus";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as chrono from "chrono-node";
import { cn } from "@/lib/utils";

// Convert countries object to array format we need
const countryOptions = Object.entries(countries)
    .map(([code, country]) => ({
        value: code,
        label: country.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

// Form validation schema
const formSchema = z.object({
    dog_name: z.string().min(1, "Name is required"),
    breed: z.string().min(1, "Breed is required"),
    dob: z.date({
        required_error: "Date of birth is required",
    }),
    weight_metric: z.number().min(0, "Weight must be greater than 0"),
    weight_imperial: z.number().min(0, "Weight must be greater than 0"),
});

export function EditDogProfileDialog({ open, onOpenChange, dog }) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { profile, loading: profileLoading } = useUser();
    const { theme, setTheme } = useTheme();
    const [isPending, setIsPending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(dog?.dog_avatar || null);
    const [coverPreview, setCoverPreview] = useState(dog?.dog_cover || null);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { updateDog, deleteDog } = useDogs();
    const navigate = useNavigate();
    const { session } = useAuth();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dog_name: dog?.dog_name || "",
            breed: dog?.breed || "",
            dob: dog?.dob ? new Date(dog.dob) : undefined,
            weight_metric: dog?.weight_metric || 0,
            weight_imperial: dog?.weight_imperial || 0,
        },
        resetOptions: {
            keepDirtyValues: false,
            keepErrors: false,
        },
    });

    // Add clearFieldError function
    const clearFieldError = (fieldName) => {
        if (form.getFieldState(fieldName).error) {
            form.clearErrors(fieldName);
        }
    };

    // Track form changes
    const hasChanges = () => {
        // Check if any form values changed
        const formValues = form.getValues();
        const hasFormChanges =
            formValues.dog_name !== dog?.dog_name ||
            formValues.breed !== dog?.breed ||
            formValues.weight_metric !== dog?.weight_metric ||
            formValues.weight_imperial !== dog?.weight_imperial ||
            (formValues.dob &&
                dog?.dob &&
                new Date(formValues.dob).getTime() !==
                    new Date(dog.dob).getTime());

        // Check if files changed
        const hasFileChanges = avatarFile !== null || coverFile !== null;

        return hasFormChanges || hasFileChanges;
    };

    // Handle dialog close with unsaved changes
    const handleOpenChange = (isOpen) => {
        if (!isOpen && hasChanges()) {
            setShowDiscardDialog(true);
            return;
        }

        if (!isOpen) {
            resetForm();
        }

        onOpenChange(isOpen);
    };

    // Handle discard confirmation
    const handleConfirmDiscard = () => {
        form.reset();
        setAvatarFile(null);
        setCoverFile(null);
        setAvatarPreview(dog?.dog_avatar || null);
        setCoverPreview(dog?.dog_cover || null);
        setShowDiscardDialog(false);
        onOpenChange(false);
    };

    // Reset form when dog data changes
    useEffect(() => {
        if (dog) {
            form.reset({
                dog_name: dog.dog_name || "",
                breed: dog.breed || "",
                dob: dog.dob ? new Date(dog.dob) : undefined,
                weight_metric: dog.weight_metric || 0,
                weight_imperial: dog.weight_imperial || 0,
            });
            setAvatarPreview(dog.dog_avatar || null);
            setCoverPreview(dog.dog_cover || null);
            setAvatarFile(null);
            setCoverFile(null);
        }
    }, [dog, form.reset]);

    // Handle weight conversion
    const handleWeightChange = (value, unit) => {
        if (value === "" || isNaN(value)) {
            form.setValue("weight_metric", 0);
            form.setValue("weight_imperial", 0);
            return;
        }

        const numValue = parseFloat(value);
        if (unit === "metric") {
            form.setValue("weight_metric", numValue);
            form.setValue("weight_imperial", +(numValue * 2.20462).toFixed(2));
        } else {
            form.setValue("weight_imperial", numValue);
            form.setValue("weight_metric", +(numValue / 2.20462).toFixed(2));
        }
    };

    // Handle avatar change
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a JPG or PNG file");
            return;
        }

        setSelectedFile(file);
    };

    const handleCoverChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a JPG or PNG file");
            return;
        }

        setSelectedCoverFile(file);
    };

    const handleCroppedImage = (blob, type) => {
        if (type === "avatar") {
            setAvatarFile(blob);
            setAvatarPreview(URL.createObjectURL(blob));
            setSelectedFile(null);
        } else {
            setCoverFile(blob);
            setCoverPreview(URL.createObjectURL(blob));
            setSelectedCoverFile(null);
        }
    };

    const onSubmit = async (data) => {
        setIsPending(true);
        try {
            // Only include fields that have changed
            const updates = {
                dog_id: dog.dog_id,
            };

            // Only include avatar if it was changed
            if (avatarFile) {
                updates.dog_avatar = await uploadImage(
                    avatarFile,
                    "dog_avatars"
                );
            }

            // Only include cover if it was changed
            if (coverFile) {
                updates.dog_cover = await uploadImage(coverFile, "dog_covers");
            }

            // Add other fields if they've changed
            if (data.dog_name !== dog.dog_name)
                updates.dog_name = data.dog_name;
            if (data.dob !== dog.dob) updates.dob = data.dob;
            if (data.breed !== dog.breed) updates.breed = data.breed;
            if (data.weight_metric !== dog.weight_metric)
                updates.weight_metric = data.weight_metric;
            if (data.weight_imperial !== dog.weight_imperial)
                updates.weight_imperial = data.weight_imperial;

            await updateDog(updates);
            toast.success("Profile updated successfully");
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Error updating profile");
        } finally {
            setIsPending(false);
        }
    };

    // Add useEffect to detect any changes including images
    useEffect(() => {
        const subscription = form.watch(() => {
            setHasUnsavedChanges(true);
        });

        // Also watch for image changes
        if (avatarFile || coverFile) {
            setHasUnsavedChanges(true);
        }

        return () => subscription.unsubscribe();
    }, [form, avatarFile, coverFile]);

    // Add delete handler
    const handleDelete = async () => {
        setIsPending(true);
        try {
            await deleteDog(dog.dog_id);
            toast.success(`${dog.dog_name}'s profile has been deleted`);
            onOpenChange(false);
            navigate("/dashboard");
        } catch (error) {
            console.error("Error deleting dog:", error);
            toast.error(error.message || "Failed to delete dog profile");
        } finally {
            setIsPending(false);
            setShowDeleteDialog(false);
        }
    };

    // Helper function for image uploads
    const uploadImage = async (file, bucket) => {
        try {
            // Use extension based on the actual file type
            const extension = file.type === "image/webp" ? "webp" : "jpg";
            const fileName = `${dog.dog_id}-${Date.now()}.${extension}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(`${session.user.id}/${fileName}`, file, {
                    contentType: file.type, // Use the actual file type
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) throw error;

            return `${bucket}/${session.user.id}/${fileName}`;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
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
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 px-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="dog_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="capitalize" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="breed"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Breed</FormLabel>
                                <FormControl>
                                    <Input {...field} className="capitalize" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Date of birth</FormLabel>
                                <Input
                                    placeholder="DD/MM/YYYY"
                                    value={
                                        field.value instanceof Date
                                            ? formatDate(field.value, "PPP")
                                            : field.value || ""
                                    }
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        field.onChange(input);
                                    }}
                                    onBlur={(e) => {
                                        const value = e.target.value;
                                        if (!value) return;

                                        // Try parsing as natural language first
                                        const naturalDate =
                                            chrono.en.GB.parseDate(value);
                                        if (
                                            naturalDate &&
                                            isValid(naturalDate)
                                        ) {
                                            field.onChange(naturalDate);
                                            clearFieldError("dob");
                                            return;
                                        }

                                        // Try common date formats - prioritize Australian format
                                        const formats = [
                                            "dd/MM/yyyy", // Australian format (primary)
                                            "d/M/yyyy", // Australian format with single digits
                                            "yyyy-MM-dd", // ISO format
                                            "MM/dd/yyyy", // US format (last priority)
                                            "M/d/yyyy", // US format with single digits
                                        ];

                                        for (const dateFormat of formats) {
                                            const parsedDate = parse(
                                                value,
                                                dateFormat,
                                                new Date()
                                            );
                                            if (isValid(parsedDate)) {
                                                field.onChange(parsedDate);
                                                clearFieldError("dob");
                                                return;
                                            }
                                        }

                                        // If we couldn't parse it, show error
                                        form.setError("dob", {
                                            type: "manual",
                                            message:
                                                "Please enter a valid date (DD/MM/YYYY)",
                                        });
                                    }}
                                    className={cn(
                                        "w-full",
                                        form.formState.errors.dob &&
                                            "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                                {form.formState.errors.dob && (
                                    <FormMessage>
                                        {form.formState.errors.dob.message}
                                    </FormMessage>
                                )}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="weight_metric"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Weight (kg)</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        step="0.5"
                                        min="0.5"
                                        inputMode="decimal"
                                        onChange={(e) => {
                                            handleWeightChange(
                                                e.target.value,
                                                "metric"
                                            );
                                            field.onChange(e);
                                        }}
                                        onKeyDown={(e) => {
                                            // Allow: backspace, delete, tab, escape, enter, decimal point
                                            if (
                                                [
                                                    "Backspace",
                                                    "Delete",
                                                    "Tab",
                                                    "Escape",
                                                    "Enter",
                                                    ".",
                                                    "ArrowLeft",
                                                    "ArrowRight",
                                                    "ArrowUp",
                                                    "ArrowDown",
                                                ].includes(e.key) ||
                                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                                (["a", "c", "v", "x"].includes(
                                                    e.key.toLowerCase()
                                                ) &&
                                                    (e.ctrlKey || e.metaKey))
                                            ) {
                                                // let it happen
                                                return;
                                            }
                                            // Block any non-number
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = parseFloat(
                                                e.target.value
                                            );
                                            if (!isNaN(value)) {
                                                const rounded =
                                                    roundToNearestHalf(value);
                                                handleWeightChange(
                                                    rounded,
                                                    "metric"
                                                );
                                            }
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <Separator />

            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-10 px-8 py-2">
                <FormItem>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <div
                                type="button"
                                variant="ghost"
                                className="relative inline-flex py-0 pl-3 h-auto w-auto bg-transparent border-none hover:bg-transparent items-end cursor-pointer"
                                onClick={() =>
                                    document
                                        .getElementById("avatar-upload")
                                        .click()
                                }
                            >
                                <div className="inline-flex w-12 h-12 z-10 absolute left-0 -bottom-1 text-foreground items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                                    <Pencil className="size-5" />
                                </div>
                                <div className="relative w-32 h-32 rounded-full overflow-hidden text-[hsl(var(--icon-muted))] bg-muted/40 border border-border flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Dog
                                            width={70}
                                            height={70}
                                            className=""
                                            secondaryfill="hsl(var(--muted))"
                                        />
                                    )}
                                </div>
                                <Input
                                    type="file"
                                    accept="image/jpeg, image/png, image/jpg"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                    id="avatar-upload"
                                />
                            </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>

                <FormItem className="w-full">
                    <FormControl className="">
                        <div className="flex items-center gap-4 w-full">
                            <div
                                type="button"
                                variant="ghost"
                                className="relative inline-flex py-0 pl-4 w-full bg-transparent border-none hover:bg-transparent items-end cursor-pointer"
                                onClick={() =>
                                    document
                                        .getElementById("cover-upload")
                                        .click()
                                }
                            >
                                <div className="inline-flex w-12 h-12 z-10 absolute left-0 -bottom-1 text-foreground items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                                    <Pencil className="size-5" />
                                </div>
                                <div className="relative w-full h-32 rounded-sm overflow-hidden text-[hsl(var(--icon-muted))] bg-muted/40 border border-border flex items-center justify-center">
                                    {coverPreview ? (
                                        <img
                                            src={coverPreview}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <PhotoPlus
                                            width={75}
                                            height={85}
                                            className=""
                                            secondaryfill="hsl(var(--muted))"
                                        />
                                    )}
                                </div>
                                <Input
                                    type="file"
                                    accept="image/jpeg, image/png, image/jpg"
                                    className="hidden"
                                    onChange={handleCoverChange}
                                    id="cover-upload"
                                />
                            </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <>
                <Dialog
                    open={open}
                    onOpenChange={handleOpenChange}
                    initialFocus={false}
                    preventScroll
                >
                    <DialogContent
                        autoFocus={false}
                        className="focus:outline-none"
                    >
                        <DialogHeader className="flex flex-row items-center justify-between">
                            <DialogTitle>Edit dog profile</DialogTitle>
                            <DialogDescription className="hidden">
                                Update your dog's profile information
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="py-6"
                            >
                                {Content}
                            </form>
                        </Form>
                        <DialogFooter className="flex flex-row sm:justify-between">
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash className="h-4 w-4" />
                                Delete
                            </Button>
                            <div className="flex flex-row items-center gap-2">
                                <DialogClose asChild>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleOpenChange(false)}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="outline"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isPending || !hasChanges()}
                                >
                                    {isPending ? (
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

                <ImageEditorDialog
                    file={selectedFile}
                    onSave={(blob) => handleCroppedImage(blob, "avatar")}
                    onCancel={() => setSelectedFile(null)}
                    title="Edit Profile Picture"
                    aspectRatio={1}
                    shape="circle"
                    minZoom={1}
                    maxZoom={3}
                    initialZoom={1.2}
                    allowRotate={true}
                    className="sm:max-w-[325px]"
                />

                <ImageEditorDialog
                    file={selectedCoverFile}
                    onSave={(blob) => handleCroppedImage(blob, "cover")}
                    onCancel={() => setSelectedCoverFile(null)}
                    title="Edit Cover Image"
                    aspectRatio={3}
                    shape="rect"
                    minZoom={1}
                    maxZoom={3}
                    initialZoom={1.2}
                    allowRotate={true}
                    className="sm:max-w-[425px]"
                />

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
                                to discard them? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setShowDiscardDialog(false)}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={handleConfirmDiscard}
                            >
                                Discard changes
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Delete {dog?.dog_name}'s profile?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete {dog?.dog_name}'s
                                profile including their recipes and associated
                                data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    return (
        <>
            <Sheet
                open={open}
                onOpenChange={handleOpenChange}
                initialFocus={false}
            >
                <SheetContent
                    autoFocus={false}
                    className="focus:outline-none gap-0 bg-card flex flex-col h-full p-0"
                >
                    <div className="">
                        <SheetHeader>
                            <SheetTitle>Edit dog profile</SheetTitle>
                            <SheetDescription className="hidden">
                                Update your dog's profile information
                            </SheetDescription>
                            <SheetClose asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full [&_svg]:size-5 w-11 h-11"
                                >
                                    <X className="" />
                                </Button>
                            </SheetClose>
                        </SheetHeader>
                    </div>

                    <ScrollArea className="flex-1">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="py-6"
                            >
                                {Content}
                            </form>
                        </Form>
                    </ScrollArea>
                    <div className="">
                        <SheetFooter>
                            <div className="flex w-full flex-row items-center justify-between gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash className="h-4 w-4" />
                                    Delete
                                </Button>
                                <div className="flex flex-row items-center gap-1">
                                    <Button
                                        className="hidden sm:block"
                                        variant="ghost"
                                        onClick={() => handleOpenChange(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={form.handleSubmit(onSubmit)}
                                        disabled={isPending || !hasChanges()}
                                    >
                                        {isPending ? (
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
                            </div>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>

            <ImageEditorDialog
                file={selectedFile}
                onSave={(blob) => handleCroppedImage(blob, "avatar")}
                onCancel={() => setSelectedFile(null)}
                title="Edit Profile Picture"
                aspectRatio={1}
                shape="circle"
                minZoom={1}
                maxZoom={3}
                initialZoom={1.2}
                allowRotate={true}
                className="sm:max-w-[325px]"
            />

            <ImageEditorDialog
                file={selectedCoverFile}
                onSave={(blob) => handleCroppedImage(blob, "cover")}
                onCancel={() => setSelectedCoverFile(null)}
                title="Edit Cover Image"
                aspectRatio={3}
                shape="rect"
                minZoom={1}
                maxZoom={3}
                initialZoom={1.2}
                allowRotate={true}
                quality={1}
                mimeType="image/png"
                className="sm:max-w-[425px]"
            />

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
                        <AlertDialogCancel
                            onClick={() => setShowDiscardDialog(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleConfirmDiscard}
                        >
                            Discard changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete dog profile?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete {dog?.dog_name}'s profile and all associated
                            data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

const roundToNearestHalf = (num) => {
    return Math.round(num * 2) / 2;
};
