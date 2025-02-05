import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    CalendarDays,
    Check,
    Loader2,
    Pencil,
    X,
} from "lucide-react";
import Dog from "@/assets/icons/dog";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/user-provider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
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
import { ImageEditorDialog } from "@/components/app/dashboard/image-editor";
import DogOutline from "@/assets/icons/dog-outline";
import { AvatarFallback } from "@/components/ui/avatar";
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
import { parse, isValid, format as formatDate } from "date-fns";
import { parseDate } from "chrono-node";

// Form validation schema
const formSchema = z.object({
    dog_name: z.string().min(1, "Name is required"),
    breed: z.string().min(1, "Breed is required"),
    dog_avatar: z.string().optional(),
    dob: z
        .date({
            required_error: "Date of birth is required",
        })
        .max(new Date(), "Date of birth must be in the past"),
    weight_metric: z.number().min(0.1, "Weight must be greater than 0"),
    weight_imperial: z.number().min(0.1, "Weight must be greater than 0"),
    goal: z.enum(["maintain", "gain", "lose", "custom"]),
    ratios_intake: z.number().min(1).max(100).optional(),
});

const steps = [
    {
        id: "Step 1",
        name: "Basic Details",
        fields: ["dog_name", "breed", "dog_avatar", "dob", "weight_metric"],
    },
    {
        id: "Step 2",
        name: "Goals",
        fields: ["goal", "ratios_intake"],
    },
    {
        id: "Step 3",
        name: "Confirmation",
        fields: [],
    },
];

export function AddDogDialog({ open, onOpenChange }) {
    const [step, setStep] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [contentHeight, setContentHeight] = useState("auto");
    const [isDialogReady, setIsDialogReady] = useState(false);
    const { profile } = useUser();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dog_name: "",
            breed: "",
            dog_avatar: "",
            weight_metric: "",
            goal: "maintain",
            ratios_intake: 2.5, // Default percentage
        },
    });

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            // Small delay to let dialog open animation complete
            const timer = setTimeout(() => {
                setIsDialogReady(true);
            }, 150);
            return () => clearTimeout(timer);
        } else {
            setIsDialogReady(false);
        }
    }, [open]);

    // Handle weight conversion
    const handleWeightChange = (value, unit) => {
        // If value is empty or not a number, set both fields to 0
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

    // Handle avatar upload
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        // Check file type
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a JPG or PNG file");
            return;
        }

        setSelectedFile(file);
    };

    // Add handler for cropped image
    const handleCroppedImage = (blob) => {
        setAvatarFile(blob);
        setAvatarPreview(URL.createObjectURL(blob));
        setSelectedFile(null);
    };

    const [date, setDate] = useState(null);

    // Add this function to reset everything
    const resetForm = () => {
        form.reset({
            dog_name: "",
            breed: "",
            dog_avatar: "",
            weight_metric: 0,
            weight_imperial: 0,
            goal: "maintain",
            ratios_intake: 2.5,
        });
        setStep(0);
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarUrl(null);
        setHasUnsavedChanges(false);
    };

    // Add this function to handle discard confirmation
    const handleConfirmDiscard = () => {
        resetForm();
        setShowDiscardDialog(false);
        onOpenChange(false);
    };

    // Modify the onOpenChange prop to check for unsaved changes
    const handleOpenChange = (open) => {
        if (!open && hasUnsavedChanges) {
            setShowDiscardDialog(true);
            return;
        }
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    };

    // Add form change detection
    useEffect(() => {
        const subscription = form.watch(() => {
            setHasUnsavedChanges(true);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    // Add this function to clear field error when value is entered
    const clearFieldError = (fieldName) => {
        if (form.getFieldState(fieldName).error) {
            form.clearErrors(fieldName);
        }
    };

    // Modify the onSubmit function to reset form on success
    const onSubmit = async (data) => {
        setIsPending(true);
        try {
            let avatarUrl = null;

            // Create dog profile first to get the ID
            const { data: newDog, error: insertError } = await supabase
                .from("dogs")
                .insert({
                    profile_id: profile.profile_id,
                    dog_name: data.dog_name,
                    breed: data.breed,
                    dob: data.dob.toISOString(),
                    weight_metric: data.weight_metric,
                    goal: data.goal,
                    ratios_intake:
                        data.goal === "maintain"
                            ? 2.5
                            : data.goal === "gain"
                            ? 3
                            : data.goal === "lose"
                            ? 2
                            : data.ratios_intake,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Upload avatar if selected, now using the new dog's ID
            if (avatarFile) {
                const fileExt = avatarFile.type.split("/")[1] || "jpg";
                const fileName = `${profile.profile_id}/${
                    newDog.dog_id
                }-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("dog_avatars")
                    .upload(fileName, avatarFile, {
                        contentType: avatarFile.type,
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    throw new Error("Failed to upload avatar");
                }

                avatarUrl = `dog_avatars/${fileName}`;

                // Update the dog record with the avatar URL
                const { error: updateError } = await supabase
                    .from("dogs")
                    .update({ dog_avatar: avatarUrl })
                    .eq("dog_id", newDog.dog_id);

                if (updateError) throw updateError;
            }

            toast.success("Dog profile created successfully!");
            resetForm();
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating dog profile:", error);
            toast.error(error.message || "Failed to create dog profile");
        } finally {
            setIsPending(false);
        }
    };

    // Update the validateStep function
    const validateStep = () => {
        const currentFields = steps[step].fields;
        let isValid = true;

        currentFields.forEach((fieldName) => {
            // Skip validation for optional fields
            if (fieldName === "dog_avatar") return;

            const value = form.getValues(fieldName);
            if (!value) {
                form.setError(fieldName, {
                    type: "required",
                    message: "This field is required",
                });
                isValid = false;
            } else {
                clearFieldError(fieldName);
            }
        });

        return isValid;
    };

    // Modify the step navigation button click handler
    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const Content = (
        <Form {...form}>
            <div className="">
                <motion.div
                    layout
                    animate={{ height: contentHeight }}
                    transition={
                        isDialogReady
                            ? { duration: 0.3, ease: "easeInOut" }
                            : { duration: 0 }
                    }
                    className="relative"
                    initial={{ height: contentHeight }}
                >
                    <AnimatePresence
                        mode="wait"
                        onExitComplete={() => setContentHeight("auto")}
                    >
                        <motion.div
                            key={step}
                            initial={step === 0 ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            onBeforeLayoutMeasure={() => {
                                const element =
                                    document.querySelector(".step-content");
                                if (element) {
                                    setContentHeight(element.offsetHeight);
                                }
                            }}
                            className="w-full absolute left-0 right-0"
                        >
                            <div className="space-y-6 md:space-y-12 py-5 md:py-12 px-6 step-content flex flex-col w-full items-center justify-center">
                                {step === 0 && (
                                    <>
                                        <div className="hidden md:block">
                                            <h2 className="text-3xl font-medium">
                                                Add a new dog
                                            </h2>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="dog_avatar"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                type="button"
                                                                variant="ghost"
                                                                className="relative inline-flex py-0 pl-5 pr-4 h-auto w-auto bg-transparent border-none hover:bg-transparent items-end cursor-pointer"
                                                                onClick={() =>
                                                                    document
                                                                        .getElementById(
                                                                            "avatar-upload"
                                                                        )
                                                                        .click()
                                                                }
                                                            >
                                                                <div className="inline-flex w-12 h-12 z-10 absolute left-1 text-foreground items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                                                                    <Pencil className="size-5" />
                                                                </div>
                                                                <div className="relative w-32 h-32 rounded-full text-[hsl(var(--icon-muted))] overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
                                                                    {avatarPreview ? (
                                                                        <img
                                                                            src={
                                                                                avatarPreview
                                                                            }
                                                                            alt="Avatar preview"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <Dog
                                                                            width={
                                                                                75
                                                                            }
                                                                            height={
                                                                                85
                                                                            }
                                                                            className=""
                                                                            secondaryfill="hsl(var(--muted))"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <Input
                                                                    type="file"
                                                                    accept="image/jpeg, image/png, image/jpg"
                                                                    className="hidden"
                                                                    onChange={
                                                                        handleAvatarChange
                                                                    }
                                                                    id="avatar-upload"
                                                                />
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex flex-col gap-6 w-full px-6">
                                            <div className="flex flex-col sm:flex-row gap-6 w-full">
                                                <FormField
                                                    control={form.control}
                                                    name="dog_name"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>
                                                                Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    className={cn(
                                                                        "capitalize transition-colors duration-300",
                                                                        form
                                                                            .formState
                                                                            .errors
                                                                            .dog_name &&
                                                                            "border-destructive bg-destructive/10 text-destructive"
                                                                    )}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        field.onChange(
                                                                            e
                                                                        );
                                                                        if (
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) {
                                                                            clearFieldError(
                                                                                "dog_name"
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="breed"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>
                                                                Breed
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    className={cn(
                                                                        "capitalize transition-colors duration-300",
                                                                        form
                                                                            .formState
                                                                            .errors
                                                                            .breed &&
                                                                            "border-destructive bg-destructive/10 text-destructive"
                                                                    )}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        field.onChange(
                                                                            e
                                                                        );
                                                                        if (
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) {
                                                                            clearFieldError(
                                                                                "breed"
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex flex-row gap-6 w-full">
                                                <div className="flex flex-col sm:flex-row gap-6 w-full">
                                                    <FormField
                                                        control={form.control}
                                                        name="dob"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full">
                                                                <FormLabel>
                                                                    Date of
                                                                    birth
                                                                </FormLabel>
                                                                <Input
                                                                    placeholder="DD/MM/YYYY"
                                                                    value={
                                                                        field.value instanceof
                                                                        Date
                                                                            ? formatDate(
                                                                                  field.value,
                                                                                  "PP"
                                                                              )
                                                                            : field.value ||
                                                                              ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const input =
                                                                            e
                                                                                .target
                                                                                .value;
                                                                        field.onChange(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        );
                                                                    }}
                                                                    onBlur={(
                                                                        e
                                                                    ) => {
                                                                        const value =
                                                                            e
                                                                                .target
                                                                                .value;
                                                                        if (
                                                                            !value
                                                                        )
                                                                            return;

                                                                        // Try parsing as natural language first
                                                                        const naturalDate =
                                                                            parseDate(
                                                                                value
                                                                            );
                                                                        if (
                                                                            naturalDate &&
                                                                            isValid(
                                                                                naturalDate
                                                                            )
                                                                        ) {
                                                                            field.onChange(
                                                                                naturalDate
                                                                            );
                                                                            clearFieldError(
                                                                                "dob"
                                                                            );
                                                                            return;
                                                                        }

                                                                        // Try common date formats
                                                                        const formats =
                                                                            [
                                                                                "dd/MM/yyyy",
                                                                                "MM/dd/yyyy",
                                                                                "yyyy-MM-dd",
                                                                                "d/M/yyyy",
                                                                                "M/d/yyyy",
                                                                            ];

                                                                        for (const dateFormat of formats) {
                                                                            const parsedDate =
                                                                                parse(
                                                                                    value,
                                                                                    dateFormat,
                                                                                    new Date()
                                                                                );
                                                                            if (
                                                                                isValid(
                                                                                    parsedDate
                                                                                )
                                                                            ) {
                                                                                field.onChange(
                                                                                    parsedDate
                                                                                );
                                                                                clearFieldError(
                                                                                    "dob"
                                                                                );
                                                                                return;
                                                                            }
                                                                        }

                                                                        // If we couldn't parse it, show error
                                                                        form.setError(
                                                                            "dob",
                                                                            {
                                                                                type: "manual",
                                                                                message:
                                                                                    "Please enter a valid date",
                                                                            }
                                                                        );
                                                                    }}
                                                                    className={cn(
                                                                        "w-full",
                                                                        form
                                                                            .formState
                                                                            .errors
                                                                            .dob &&
                                                                            "border-destructive focus-visible:ring-destructive"
                                                                    )}
                                                                />
                                                                {form.formState
                                                                    .errors
                                                                    .dob && (
                                                                    <FormMessage>
                                                                        {
                                                                            form
                                                                                .formState
                                                                                .errors
                                                                                .dob
                                                                                .message
                                                                        }
                                                                    </FormMessage>
                                                                )}
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="weight_metric"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full">
                                                                <FormLabel>
                                                                    Weight (kg)
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        inputMode="decimal"
                                                                        className={cn(
                                                                            "transition-colors duration-300",
                                                                            form
                                                                                .formState
                                                                                .errors
                                                                                .weight_metric &&
                                                                                "border-destructive hover:bg-destructive/10 hover:text-destructive bg-destructive/10 text-destructive"
                                                                        )}
                                                                        onKeyDown={(
                                                                            e
                                                                        ) => {
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
                                                                                ].includes(
                                                                                    e.key
                                                                                ) ||
                                                                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                                                                ([
                                                                                    "a",
                                                                                    "c",
                                                                                    "v",
                                                                                    "x",
                                                                                ].includes(
                                                                                    e.key.toLowerCase()
                                                                                ) &&
                                                                                    (e.ctrlKey ||
                                                                                        e.metaKey))
                                                                            ) {
                                                                                // let it happen
                                                                                return;
                                                                            }
                                                                            // Block any non-number
                                                                            if (
                                                                                !/[0-9]/.test(
                                                                                    e.key
                                                                                )
                                                                            ) {
                                                                                e.preventDefault();
                                                                            }
                                                                        }}
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            // Handle weight conversion
                                                                            handleWeightChange(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                                "metric"
                                                                            );
                                                                            // Handle field validation
                                                                            field.onChange(
                                                                                e
                                                                            );
                                                                            if (
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            ) {
                                                                                clearFieldError(
                                                                                    "weight_metric"
                                                                                );
                                                                            }
                                                                        }}
                                                                        onBlur={(
                                                                            e
                                                                        ) => {
                                                                            const value =
                                                                                parseFloat(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                );
                                                                            if (
                                                                                !isNaN(
                                                                                    value
                                                                                )
                                                                            ) {
                                                                                const rounded =
                                                                                    roundToNearestHalf(
                                                                                        value
                                                                                    );
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
                                        </div>
                                    </>
                                )}

                                {step === 1 && (
                                    <>
                                        <div className="flex flex-col gap-1 justify-center items-center">
                                            <h2 className="text-3xl font-medium">
                                                What's your goal
                                            </h2>
                                            <h2 className="text-3xl font-medium">
                                                for {form.getValues("dog_name")}
                                                ?
                                            </h2>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="goal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="inline-flex flex-col items-center gap-6">
                                                        {[
                                                            {
                                                                value: "gain",
                                                                label: "Gain weight",
                                                            },
                                                            {
                                                                value: "maintain",
                                                                label: "Maintain weight",
                                                            },
                                                            {
                                                                value: "lose",
                                                                label: "Lose weight",
                                                            },
                                                        ].map((option) => (
                                                            <motion.div
                                                                key={
                                                                    option.value
                                                                }
                                                                layout
                                                                initial={false}
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    size="lgPill"
                                                                    variant={
                                                                        field.value ===
                                                                        option.value
                                                                            ? "selected"
                                                                            : "outline"
                                                                    }
                                                                    className="flex items-center gap-0"
                                                                    onClick={() =>
                                                                        field.onChange(
                                                                            option.value
                                                                        )
                                                                    }
                                                                >
                                                                    <motion.span
                                                                        layoutId={`text-${option.value}`}
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </motion.span>
                                                                    <AnimatePresence mode="sync">
                                                                        {field.value ===
                                                                            option.value && (
                                                                            <motion.div
                                                                                initial={{
                                                                                    width: 0,
                                                                                    marginLeft: 0,
                                                                                    opacity: 0,
                                                                                    scale: 0,
                                                                                }}
                                                                                animate={{
                                                                                    width: "auto",
                                                                                    marginLeft: 6,
                                                                                    opacity: 1,
                                                                                    scale: 1,
                                                                                }}
                                                                                exit={{
                                                                                    width: 0,
                                                                                    marginLeft: 0,
                                                                                    opacity: 0,
                                                                                    scale: 0,
                                                                                }}
                                                                                transition={{
                                                                                    duration: 0.2,
                                                                                }}
                                                                                className="overflow-hidden"
                                                                            >
                                                                                <Check className="size-4" />
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </Button>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        <div className=" flex flex-col gap-1 justify-center items-center">
                                            {form.getValues("goal") ===
                                                "maintain" && (
                                                <p className="text-xl px-4 font-normal text-muted-foreground/60 text-center leading-relaxed">
                                                    To help{" "}
                                                    <span className=" text-foreground">
                                                        {form.getValues(
                                                            "dog_name"
                                                        )}
                                                    </span>{" "}
                                                    maintain their current
                                                    weight of{" "}
                                                    <span className=" text-foreground">
                                                        {form.getValues(
                                                            "weight_metric"
                                                        )}
                                                        kg
                                                    </span>
                                                    , they should be fed{" "}
                                                    <span className=" text-foreground">
                                                        {Math.round(
                                                            (2.5 / 100) *
                                                                form.getValues(
                                                                    "weight_metric"
                                                                ) *
                                                                1000
                                                        )}
                                                        g
                                                    </span>{" "}
                                                    per day.
                                                </p>
                                            )}
                                            {form.getValues("goal") ===
                                                "gain" && (
                                                <p className="text-xl px-4 font-normal text-muted-foreground/60 text-center leading-relaxed">
                                                    To help{" "}
                                                    <span className=" text-foreground">
                                                        {form.getValues(
                                                            "dog_name"
                                                        )}
                                                    </span>{" "}
                                                    increase their current
                                                    weight of{" "}
                                                    <span className=" text-foreground">
                                                        {form.getValues(
                                                            "weight_metric"
                                                        )}
                                                        kg
                                                    </span>
                                                    , they should be fed{" "}
                                                    <span className=" text-foreground">
                                                        {Math.round(
                                                            (3 / 100) *
                                                                form.getValues(
                                                                    "weight_metric"
                                                                ) *
                                                                1000
                                                        )}
                                                        g
                                                    </span>{" "}
                                                    per day.
                                                </p>
                                            )}

                                            {form.getValues("goal") ===
                                                "lose" && (
                                                <p className="text-xl px-4 font-normal text-muted-foreground/60 text-center leading-relaxed">
                                                    To help{" "}
                                                    <span className=" text-foreground">
                                                        {form.getValues(
                                                            "dog_name"
                                                        )}
                                                    </span>{" "}
                                                    decrease their current
                                                    weight of{" "}
                                                    <span className=" text-foreground">
                                                        {form.getValues(
                                                            "weight_metric"
                                                        )}
                                                        kg
                                                    </span>
                                                    , they should be fed{" "}
                                                    <span className=" text-foreground">
                                                        {Math.round(
                                                            (2 / 100) *
                                                                form.getValues(
                                                                    "weight_metric"
                                                                ) *
                                                                1000
                                                        )}
                                                        g
                                                    </span>{" "}
                                                    per day.
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <div className="flex flex-col items-center gap-6 pt-6 pb-2">
                                            <div className="relative w-32 h-32 rounded-full text-muted-foreground overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
                                                {avatarPreview || avatarUrl ? (
                                                    <img
                                                        src={
                                                            avatarPreview ||
                                                            avatarUrl
                                                        }
                                                        alt="Avatar preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            console.error(
                                                                "Image load error:",
                                                                e
                                                            );
                                                            e.target.src = ""; // Or a fallback image
                                                            e.target.onerror =
                                                                null; // Prevent infinite loop
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="text-[2.5rem] font-medium">
                                                        {form
                                                            .getValues(
                                                                "dog_name"
                                                            )[0]
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 justify-center items-center">
                                                <h2 className="text-3xl font-medium">
                                                    Welcome to the
                                                </h2>
                                                <h2 className="text-3xl font-medium">
                                                    pack{" "}
                                                    {form.getValues("dog_name")}
                                                </h2>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </Form>
    );

    const FooterContent = (
        <div
            className={`w-full gap-2 flex ${
                step === 2 ? "justify-center" : "justify-end"
            }`}
        >
            <Button
                type="button"
                variant="ghost"
                onClick={() => {
                    if (step === 0) {
                        // If on first page, trigger the close dialog flow
                        handleOpenChange(false);
                    } else {
                        setStep(step - 1);
                    }
                }}
                className={`${step === 2 ? "hidden" : ""}`}
            >
                {step === 0 ? "Cancel" : "Back"}
            </Button>

            {step < steps.length - 1 ? (
                <Button type="button" variant="outline" onClick={handleNext}>
                    {step === 2 ? "Complete" : "Next"}
                    <ArrowRight className="ml-2 size-4" />
                </Button>
            ) : (
                <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isPending}
                    variant="outline"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 size-4" />
                            Create profile
                        </>
                    )}
                </Button>
            )}
        </div>
    );

    if (isDesktop) {
        return (
            <>
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogContent>
                        <DialogHeader className="hidden">
                            <DialogTitle>Add a new dog</DialogTitle>
                            <DialogDescription>
                                Add your dog's details to get personalized
                                feeding recommendations
                            </DialogDescription>
                        </DialogHeader>
                        {Content}
                        <DialogFooter>{FooterContent}</DialogFooter>
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
                    type="avatar"
                    className="sm:max-w-[325px]"
                />
            </>
        );
    }

    return (
        <>
            <Sheet open={open} onOpenChange={handleOpenChange}>
                <SheetContent
                    autoFocus={false}
                    className="focus:outline-none gap-0 bg-card flex flex-col h-full p-0"
                >
                    <div className="">
                        <SheetHeader className="">
                            <SheetTitle>Add a new dog</SheetTitle>
                            <SheetDescription className="hidden">
                                Add your dog's details to get personalized
                                feeding recommendations
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

                    <ScrollArea className="flex-1">{Content}</ScrollArea>
                    <div className="">
                        <SheetFooter className="flex px-6 flex-row">
                            {FooterContent}
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>
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
                type="avatar"
                className="sm:max-w-[325px]"
            />
        </>
    );
}

const roundToNearestHalf = (num) => {
    return Math.round(num * 2) / 2;
};
