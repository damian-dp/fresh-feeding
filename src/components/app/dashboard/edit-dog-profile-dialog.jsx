import { useEffect, useState } from "react";
import {
    CalendarDays,
    CheckCheck,
    Dog,
    ImagePlus,
    Loader2,
    Pencil,
    Trash,
} from "lucide-react";
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
import { format } from "date-fns";
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
    });

    // Track form changes
    const isDirty =
        form.formState.isDirty || avatarFile !== null || coverFile !== null;

    // Handle dialog close with unsaved changes
    const handleOpenChange = (open) => {
        if (!open && isDirty) {
            setShowDiscardDialog(true);
        } else {
            onOpenChange(open);
        }
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

    // Reset form when dialog opens with new dog data
    useEffect(() => {
        if (open && dog) {
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
    }, [open, dog, form.reset]);

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
            // Get the form's dirty fields
            const dirtyFields = form.formState.dirtyFields;

            // Start with the original dog data
            const updatedData = {
                dog_id: dog.dog_id,
                ...dog, // Include all original data
            };

            // Update only the fields that have changed
            if (dirtyFields.dog_name) updatedData.dog_name = data.dog_name;
            if (dirtyFields.breed) updatedData.breed = data.breed;
            if (dirtyFields.dob) updatedData.dob = data.dob;
            if (dirtyFields.weight_metric)
                updatedData.weight_metric = data.weight_metric;
            if (dirtyFields.weight_imperial)
                updatedData.weight_imperial = data.weight_imperial;

            // Handle avatar and cover image uploads
            if (avatarFile) {
                updatedData.dog_avatar = await uploadImage(
                    avatarFile,
                    "dog_avatars"
                );
            }
            if (coverFile) {
                updatedData.dog_cover = await uploadImage(
                    coverFile,
                    "dog_covers"
                );
            }

            // Only update if there are changes
            if (
                Object.keys(dirtyFields).length > 0 ||
                avatarFile ||
                coverFile
            ) {
                await updateDog(updatedData);
                toast.success("Profile updated successfully");
                onOpenChange(false);
            }
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
        if (!session) {
            throw new Error("No authenticated session");
        }

        // Ensure we get the correct file extension
        const fileExt = file.type.split("/")[1] || "jpg"; // Fallback to jpg if no extension found
        const fileName = `${session.user.id}/${
            dog.dog_id
        }-${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("Upload error:", error);
            throw error;
        }

        return `${bucket}/${fileName}`;
    };

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    const Content = (
        <div className="flex flex-col gap-6">
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
                            <FormItem>
                                <FormLabel>Date of birth</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarDays className="size-4" />
                                                {field.value ? (
                                                    format(field.value, "PP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() ||
                                                date < new Date("1990-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
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

            <div className="flex flex-row gap-10 px-8 py-2">
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
                                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted/60 flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Dog className="size-16 text-muted-foreground" />
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
                                <div className="relative w-full h-32 rounded-sm overflow-hidden bg-muted/60 flex items-center justify-center">
                                    {coverPreview ? (
                                        <img
                                            src={coverPreview}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ImagePlus className="size-16 text-muted-foreground" />
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
                                    disabled={isPending || !isDirty}
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
                                to discard them?
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
                                Delete dog profile?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete {dog?.dog_name}'s profile and
                                all associated data.
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
            <Drawer
                open={open}
                onOpenChange={handleOpenChange}
                initialFocus={false}
            >
                <DrawerContent autoFocus={false} className="focus:outline-none">
                    <DrawerHeader>
                        <DrawerTitle>Edit dog profile</DrawerTitle>
                        <DrawerDescription>
                            Update your dog's profile information
                        </DrawerDescription>
                    </DrawerHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="p-4"
                        >
                            {Content}
                        </form>
                    </Form>
                    <DrawerFooter>
                        <div className="flex flex-row items-center gap-2">
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash className="h-4 w-4" />
                                Delete
                            </Button>
                            <Button
                                variant="outline"
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isPending || !isDirty}
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
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

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
