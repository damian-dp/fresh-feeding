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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    ArrowRight,
    Check,
    Dog,
    ImagePlus,
    Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
        fields: ["dog_name", "breed", "dog_avatar"],
    },
    {
        id: "Step 2",
        name: "Age & Weight",
        fields: ["dob", "weight_metric", "weight_imperial"],
    },
    {
        id: "Step 3",
        name: "Goals",
        fields: ["goal", "ratios_intake"],
    },
    { id: "Step 4", name: "Confirmation" },
];

export function AddDogDialog({ open, onOpenChange }) {
    const [step, setStep] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [contentHeight, setContentHeight] = useState("auto");
    const [isDialogReady, setIsDialogReady] = useState(false);
    const { profile } = useUser();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dog_name: "",
            breed: "",
            dog_avatar: "",
            weight_metric: 0,
            weight_imperial: 0,
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

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (data) => {
        setIsPending(true);
        try {
            let avatarUrl = null;

            // Upload avatar if selected
            if (avatarFile) {
                const fileExt = avatarFile.name.split(".").pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${profile.profile_id}/${fileName}`;

                const { error: uploadError, data: uploadData } =
                    await supabase.storage
                        .from("dog-avatars")
                        .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const {
                    data: { publicUrl },
                } = supabase.storage.from("dog-avatars").getPublicUrl(filePath);

                avatarUrl = publicUrl;
            }

            // Create dog profile
            const { error } = await supabase.from("dogs").insert({
                profile_id: profile.profile_id,
                dog_name: data.dog_name,
                breed: data.breed,
                dog_avatar: avatarUrl,
                dob: data.dob.toISOString(),
                weight_metric: data.weight_metric,
                weight_imperial: data.weight_imperial,
                goal: data.goal,
                ratios_intake:
                    data.goal === "custom" ? data.ratios_intake : 2.5,
                ratios_muscle_meat: 0.7,
                ratios_plant_matter: 0.1,
                ratios_secreting_organ: 0.1,
                ratios_liver: 0.1,
            });

            if (error) throw error;

            toast.success("Dog profile created successfully!");
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating dog profile:", error);
            toast.error("Failed to create dog profile");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <Form {...form}>
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle>Add a new dog</DialogTitle>
                        <DialogDescription className="hidden">
                            Add your dog's details to get personalized feeding
                            recommendations
                        </DialogDescription>
                    </DialogHeader>

                    <div className="overflow-hidden">
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
                                    initial={
                                        step === 0 ? false : { opacity: 0 }
                                    }
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    onBeforeLayoutMeasure={() => {
                                        const element =
                                            document.querySelector(
                                                ".step-content"
                                            );
                                        if (element) {
                                            setContentHeight(
                                                element.offsetHeight
                                            );
                                        }
                                    }}
                                    className="w-full absolute left-0 right-0"
                                >
                                    <div className="space-y-6 py-6 px-6 step-content">
                                        {step === 0 && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name="dog_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                />
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
                                                            <FormLabel>
                                                                Breed
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="dog_avatar"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Profile Picture
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="relative size-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                                                        {avatarPreview ? (
                                                                            <img
                                                                                src={
                                                                                    avatarPreview
                                                                                }
                                                                                alt="Avatar preview"
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <Dog className="size-12 text-muted-foreground" />
                                                                        )}
                                                                    </div>
                                                                    <Input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={
                                                                            handleAvatarChange
                                                                        }
                                                                        id="avatar-upload"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            document
                                                                                .getElementById(
                                                                                    "avatar-upload"
                                                                                )
                                                                                .click()
                                                                        }
                                                                    >
                                                                        <ImagePlus className="mr-2 size-4" />
                                                                        Upload
                                                                    </Button>
                                                                </div>
                                                            </FormControl>
                                                            <FormDescription>
                                                                Optional.
                                                                Maximum size
                                                                5MB.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </>
                                        )}

                                        {step === 1 && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name="dob"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>
                                                                Date of birth
                                                            </FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger
                                                                    asChild
                                                                >
                                                                    <FormControl>
                                                                        <Button
                                                                            variant={
                                                                                "outline"
                                                                            }
                                                                            className={cn(
                                                                                "w-full pl-3 text-left font-normal",
                                                                                !field.value &&
                                                                                    "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {field.value ? (
                                                                                format(
                                                                                    field.value,
                                                                                    "PPP"
                                                                                )
                                                                            ) : (
                                                                                <span>
                                                                                    Pick
                                                                                    a
                                                                                    date
                                                                                </span>
                                                                            )}
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent
                                                                    className="w-auto p-0"
                                                                    align="start"
                                                                >
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={
                                                                            field.value
                                                                        }
                                                                        onSelect={
                                                                            field.onChange
                                                                        }
                                                                        disabled={(
                                                                            date
                                                                        ) =>
                                                                            date >
                                                                            new Date()
                                                                        }
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="weight_metric"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Weight (kg)
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        {...field}
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleWeightChange(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                                "metric"
                                                                            )
                                                                        }
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="weight_imperial"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Weight (lbs)
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        {...field}
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleWeightChange(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                                "imperial"
                                                                            )
                                                                        }
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {step === 2 && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name="goal"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Weight goal
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                defaultValue={
                                                                    field.value
                                                                }
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a goal" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="maintain">
                                                                        Maintain
                                                                        weight
                                                                    </SelectItem>
                                                                    <SelectItem value="gain">
                                                                        Gain
                                                                        weight
                                                                    </SelectItem>
                                                                    <SelectItem value="lose">
                                                                        Lose
                                                                        weight
                                                                    </SelectItem>
                                                                    <SelectItem value="custom">
                                                                        Custom
                                                                        goal
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {form.watch("goal") ===
                                                    "custom" && (
                                                    <>
                                                        <Alert variant="warning">
                                                            <AlertCircle className="size-4" />
                                                            <AlertDescription>
                                                                Only experienced
                                                                feeders should
                                                                set a custom
                                                                intake ratio
                                                            </AlertDescription>
                                                        </Alert>

                                                        <FormField
                                                            control={
                                                                form.control
                                                            }
                                                            name="ratios_intake"
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Daily
                                                                        intake
                                                                        ratio
                                                                        (%)
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            step="0.1"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Percentage
                                                                        of body
                                                                        weight
                                                                        to feed
                                                                        daily
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </>
                                                )}
                                            </>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <h3 className="font-medium">
                                                        Confirm details
                                                    </h3>
                                                    <div className="text-sm text-muted-foreground space-y-2">
                                                        <p>
                                                            Name:{" "}
                                                            {form.getValues(
                                                                "dog_name"
                                                            )}
                                                        </p>
                                                        <p>
                                                            Breed:{" "}
                                                            {form.getValues(
                                                                "breed"
                                                            )}
                                                        </p>
                                                        <p>
                                                            Date of birth:{" "}
                                                            {format(
                                                                form.getValues(
                                                                    "dob"
                                                                ),
                                                                "PPP"
                                                            )}
                                                        </p>
                                                        <p>
                                                            Weight:{" "}
                                                            {form.getValues(
                                                                "weight_metric"
                                                            )}
                                                            kg /{" "}
                                                            {form.getValues(
                                                                "weight_imperial"
                                                            )}
                                                            lbs
                                                        </p>
                                                        <p>
                                                            Goal:{" "}
                                                            {form.getValues(
                                                                "goal"
                                                            )}
                                                        </p>
                                                        {form.getValues(
                                                            "goal"
                                                        ) === "custom" && (
                                                            <p>
                                                                Daily intake:{" "}
                                                                {form.getValues(
                                                                    "ratios_intake"
                                                                )}
                                                                %
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setStep(step - 1)}
                            disabled={step === 0}
                        >
                            Back
                        </Button>

                        {step < steps.length - 1 ? (
                            <Button
                                type="button"
                                onClick={() => setStep(step + 1)}
                            >
                                Next
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isPending}
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
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
