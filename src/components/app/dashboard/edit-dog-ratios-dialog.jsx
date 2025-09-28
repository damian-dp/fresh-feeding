import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCheck,
  Dog,
  Loader2,
  Pencil,
  Trash,
  X,
  Info,
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
import { toast } from "sonner";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDogs } from "@/components/providers/dogs-provider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Switch } from "@/components/ui/switch";
import {
  getDogAgeInMonths,
  getCurrentIntakePercent,
  getDailyIntakeGrams,
} from "@/utils/feeding";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Add these default values at the top of the file
const DEFAULT_RATIOS = {
  ratios_muscle_meat: 0.55,
  ratios_bone: 0.1,
  ratios_plant_matter: 0.25,
  ratios_liver: 0.05,
  ratios_secreting_organ: 0.05,
};

// Form validation schema
const formSchema = z.object({
  dog_name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  dob: z.date({
    required_error: "Date of birth is required",
  }),
  weight_metric: z.number().min(0, "Weight must be greater than 0"),
  weight_imperial: z.number().min(0, "Weight must be greater than 0"),
  ratios_intake: z.number().min(0).max(100),
  ratios_muscle_meat: z.number().min(0).max(1),
  ratios_bone: z.number().min(0).max(1),
  ratios_liver: z.number().min(0).max(1),
  ratios_secreting_organ: z.number().min(0).max(1),
  ratios_plant_matter: z.number().min(0).max(1),
  goal: z.enum(["maintain", "gain", "lose", "custom"]),
  use_puppy_guidelines: z.boolean().optional(),
});

// Update the RatioInput component to accept form prop
const RatioInput = ({ field, label, form }) => {
  const [inputValue, setInputValue] = useState(
    field.value === 0 ? "" : (field.value * 100).toFixed(0)
  );

  useEffect(() => {
    setInputValue(field.value === 0 ? "" : (field.value * 100).toFixed(0));
  }, [field.value]);

  return (
    <FormItem>
      <div className="flex flex-col gap-4 w-full">
        <Label>{label}</Label>
        <div className="relative flex flex-row items-center gap-1">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.]/g, "");

              // Update the displayed value immediately
              setInputValue(value);

              if (value === "") {
                field.onChange(0);
              } else {
                const parsed = parseFloat(value);
                if (!isNaN(parsed)) {
                  const decimalValue = parsed / 100;

                  field.onChange(decimalValue);

                  // Force form validation update
                  form.trigger();
                }
              }
            }}
            onBlur={() => {
              // Format the value properly on blur
              if (inputValue === "") {
                setInputValue("");
                field.onChange(0);
              } else {
                const parsed = parseFloat(inputValue);
                if (!isNaN(parsed)) {
                  setInputValue(parsed.toFixed(0));
                  field.onChange(parsed / 100);

                  // Force form validation update
                  form.trigger();
                }
              }
            }}
            className="pr-8"
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
                (["a", "c", "v", "x"].includes(e.key.toLowerCase()) &&
                  (e.ctrlKey || e.metaKey))
              ) {
                return;
              }
              // Block any non-number
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
          <span className="absolute right-2 text-sm text-muted-foreground w-4">
            %
          </span>
        </div>
      </div>
    </FormItem>
  );
};

// Update getGoalFromIntake to handle the actual values
const getGoalFromIntake = (intake) => {
  // Compare with actual values since we're not dividing by 100 anymore
  if (intake === 2.5) return "maintain";
  if (intake === 3) return "gain";
  if (intake === 2) return "lose";
  return "custom";
};

// Update getIntakeFromGoal to return actual values
const getIntakeFromGoal = (goal) => {
  switch (goal) {
    case "maintain":
      return 2.5;
    case "gain":
      return 3;
    case "lose":
      return 2;
    default:
      return 2.5; // Default to maintain
  }
};

export function EditDogRatiosDialog({ open, onOpenChange, dog }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { profile, loading: profileLoading } = useUser();
  const [isPending, setIsPending] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
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
      ratios_intake: dog?.ratios_intake || 0,
      ratios_muscle_meat: dog?.ratios_muscle_meat || 0,
      ratios_bone: dog?.ratios_bone || 0,
      ratios_liver: dog?.ratios_liver || 0,
      ratios_secreting_organ: dog?.ratios_secreting_organ || 0,
      ratios_plant_matter: dog?.ratios_plant_matter || 0,
      goal: dog?.ratios_intake
        ? getGoalFromIntake(dog.ratios_intake)
        : "maintain",
      use_puppy_guidelines: dog?.use_puppy_guidelines ?? true,
    },
  });

  // Track form changes
  const isDirty = form.formState.isDirty;

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
        ratios_intake: dog.ratios_intake || 0,
        ratios_muscle_meat: dog.ratios_muscle_meat || 0,
        ratios_bone: dog.ratios_bone || 0,
        ratios_liver: dog.ratios_liver || 0,
        ratios_secreting_organ: dog.ratios_secreting_organ || 0,
        ratios_plant_matter: dog.ratios_plant_matter || 0,
        goal: dog.ratios_intake
          ? getGoalFromIntake(dog.ratios_intake)
          : "maintain",
        use_puppy_guidelines: dog.use_puppy_guidelines ?? true,
      });
    }
  }, [open, dog, form.reset]);

  const onSubmit = async (data) => {
    // Check if ratios total 100 before proceeding
    const total = (
      (data.ratios_muscle_meat +
        data.ratios_bone +
        data.ratios_liver +
        data.ratios_secreting_organ +
        data.ratios_plant_matter) *
      100
    ).toFixed(1);

    if (Math.abs(parseFloat(total) - 100) >= 0.01) {
      toast.error("Ingredient ratios must total 100%");
      return;
    }

    setIsPending(true);
    try {
      const updatedData = {
        dog_id: dog.dog_id,
      };

      const { dirtyFields } = form.formState;

      // Only include ratio fields
      if (dirtyFields.ratios_intake) {
        // Convert ratios_intake to number if it's a string
        updatedData.ratios_intake =
          typeof data.ratios_intake === "string"
            ? parseFloat(data.ratios_intake)
            : data.ratios_intake;
      }
      if (dirtyFields.ratios_muscle_meat)
        updatedData.ratios_muscle_meat = data.ratios_muscle_meat;
      if (dirtyFields.ratios_bone) updatedData.ratios_bone = data.ratios_bone;
      if (dirtyFields.ratios_liver)
        updatedData.ratios_liver = data.ratios_liver;
      if (dirtyFields.ratios_secreting_organ)
        updatedData.ratios_secreting_organ = data.ratios_secreting_organ;
      if (dirtyFields.ratios_plant_matter)
        updatedData.ratios_plant_matter = data.ratios_plant_matter;
      if (dirtyFields.goal) updatedData.goal = data.goal;
      if (dirtyFields.use_puppy_guidelines) {
        updatedData.use_puppy_guidelines = !!data.use_puppy_guidelines;
      }

      // Only update if there are changes
      if (Object.keys(dirtyFields).length > 0) {
        const result = await updateDog(updatedData);
        if (result.error) {
          throw new Error(result.error.message || "Failed to update ratios");
        }
        toast.success("Ratios updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating ratios:", error);
      toast.error(error.message || "Failed to update ratios");
    } finally {
      setIsPending(false);
    }
  };

  // Add useEffect to detect any changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const Content = (
    <div className="flex flex-col">
      <div className="flex flex-col gap-6 p-6 border-b border-border">
        {/* <p className="font-medium">Intake goal</p> */}
        {(() => {
          const ageMonths = getDogAgeInMonths(dog.dob);
          const showSwitch = ageMonths != null && ageMonths < 12;
          if (!showSwitch) return null;
          return (
            <Label className="border border-input bg-background hover:bg-background/50 items-start gap-3 rounded-xl p-4 has-[[aria-checked=true]]:border-input has-[[aria-checked=true]]:bg-background transition-colors">
              <Switch
                checked={form.watch("use_puppy_guidelines")}
                onCheckedChange={(checked) => {
                  form.setValue("use_puppy_guidelines", checked, {
                    shouldDirty: true,
                  });
                }}
              />
              <div className="grid gap-1.5 font-normal">
                <div className="flex items-center gap-2">
                  <p className="text-base text-foreground leading-none font-medium">
                    Use recommended intake for puppies
                  </p>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Info
                            className="h-4 w-4"
                            aria-label="Puppy intake guidelines"
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-[280px] whitespace-pre-line"
                      >
                        <p className="text-sm text-primary font-medium">
                          Daily intake:
                        </p>
                        <span>2–4 months: 10% of body weight</span>
                        <br />
                        <span>4–6 months: 8% of body weight</span>
                        <br />
                        <span>6–8 months: 6% of body weight</span>
                        <br />
                        <span>8–12 months: 4% of body weight</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-muted-foreground text-sm">
                  Puppies (including small/working breeds) may need adjustments
                  during growth spurts. Monitor body condition and adjust as
                  needed.
                </p>
              </div>
            </Label>
          );
        })()}
        {(() => {
          const ageMonths = getDogAgeInMonths(dog.dob);
          const autoOn = form.watch("use_puppy_guidelines");
          if (ageMonths != null && ageMonths < 12 && autoOn) return null;
          return (
            <div className="flex flex-row gap-6">
              <div className="flex flex-col gap-4 w-full">
                <FormField
                  control={form.control}
                  name="ratios_intake"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col gap-4 w-full">
                        <Label>Daily intake</Label>
                        <div className="relative flex flex-row items-center gap-1">
                          <Input
                            type="text"
                            value={
                              field.value === "" || field.value === 0
                                ? ""
                                : typeof field.value === "string"
                                ? field.value
                                : field.value.toFixed(1)
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^\d.]/g,
                                ""
                              );
                              if (value === "") {
                                field.onChange("");
                              } else {
                                const parsed = parseFloat(value);
                                if (!isNaN(parsed)) {
                                  // Keep as string while typing
                                  field.onChange(value);
                                  // Update goal only if it's a complete number
                                  if (!/\.$/.test(value)) {
                                    const newGoal = getGoalFromIntake(parsed);
                                    form.setValue("goal", newGoal);
                                  }
                                }
                              }
                            }}
                            onBlur={(e) => {
                              // Format to one decimal on blur
                              const value = e.target.value;
                              if (value !== "") {
                                const parsed = parseFloat(value);
                                if (!isNaN(parsed)) {
                                  field.onChange(parsed);
                                }
                              }
                            }}
                            className="pr-8"
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
                                return;
                              }
                              // Block any non-number
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                          <span className="absolute right-2 text-sm text-muted-foreground w-4">
                            %
                          </span>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-4 w-full">
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col gap-4 w-full">
                        <Label>Weight goal</Label>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value !== "custom") {
                              const newIntake = getIntakeFromGoal(value);
                              // Set the intake value and mark it as dirty
                              form.setValue("ratios_intake", newIntake, {
                                shouldDirty: true, // Add this to mark the field as dirty
                                shouldTouch: true, // Optional: marks the field as touched
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-sm">
                            <SelectItem value="maintain">Maintain</SelectItem>
                            <SelectItem value="gain">Gain weight</SelectItem>
                            <SelectItem value="lose">Lose weight</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          );
        })()}
      </div>

      <div className="flex flex-col gap-6 p-6">
        <p className="font-medium">Ingredient ratios</p>

        <Alert variant="warning">
          <AlertDescription>
            Any changes here may put your meals out of balance. Use the goal
            presets above to change daily intake.
          </AlertDescription>
        </Alert>
        <div className="flex flex-row gap-6">
          <div className="flex flex-col gap-4 w-full">
            <FormField
              control={form.control}
              name="ratios_muscle_meat"
              render={({ field }) => (
                <RatioInput field={field} label="Muscle meat" form={form} />
              )}
            />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <FormField
              control={form.control}
              name="ratios_bone"
              render={({ field }) => (
                <RatioInput field={field} label="Bone" form={form} />
              )}
            />
          </div>
        </div>

        <div className="flex flex-row gap-6">
          <div className="flex flex-col gap-4 w-full">
            <FormField
              control={form.control}
              name="ratios_plant_matter"
              render={({ field }) => (
                <RatioInput field={field} label="Plant matter" form={form} />
              )}
            />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <FormField
              control={form.control}
              name="ratios_liver"
              render={({ field }) => (
                <RatioInput field={field} label="Liver" form={form} />
              )}
            />
          </div>
        </div>
        <div className="flex flex-row gap-6">
          <div className="flex flex-col gap-4 w-full">
            <FormField
              control={form.control}
              name="ratios_secreting_organ"
              render={({ field }) => (
                <RatioInput
                  field={field}
                  label="Secreting organs"
                  form={form}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <Label className="text-card">Total</Label>
            <div className="flex flex-row items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="font-normal w-full"
                onClick={() => {
                  form.setValue(
                    "ratios_muscle_meat",
                    DEFAULT_RATIOS.ratios_muscle_meat,
                    { shouldDirty: true }
                  );
                  form.setValue("ratios_bone", DEFAULT_RATIOS.ratios_bone, {
                    shouldDirty: true,
                  });
                  form.setValue(
                    "ratios_plant_matter",
                    DEFAULT_RATIOS.ratios_plant_matter,
                    { shouldDirty: true }
                  );
                  form.setValue("ratios_liver", DEFAULT_RATIOS.ratios_liver, {
                    shouldDirty: true,
                  });
                  form.setValue(
                    "ratios_secreting_organ",
                    DEFAULT_RATIOS.ratios_secreting_organ,
                    { shouldDirty: true }
                  );
                  // Trigger form validation after setting values
                  form.trigger();
                }}
              >
                Reset all ratios
              </Button>
              <FormMessage />
            </div>
          </div>
        </div>
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
          <DialogContent autoFocus={false} className="focus:outline-none">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle>Edit {dog.dog_name}'s ratios</DialogTitle>
              <DialogDescription className="hidden">
                Update your dog's nutritional ratios
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>{Content}</form>
            </Form>
            <DialogFooter className="flex flex-row sm:justify-between items-center">
              <span
                className={cn(
                  "font-normal",
                  getTotalPercentage(form.getValues()) > 100 ||
                    getTotalPercentage(form.getValues()) < 100
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                Total: {getTotalPercentage(form.getValues())}%
              </span>

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

        <AlertDialog
          open={showDiscardDialog}
          onOpenChange={setShowDiscardDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard changes?</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to discard them?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDiscardDialog(false)}>
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
      </>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange} initialFocus={false}>
        <SheetContent
          autoFocus={false}
          className="focus:outline-none gap-0 bg-card flex flex-col h-full p-0"
        >
          <div className="">
            <SheetHeader>
              <SheetTitle>Edit dog ratios</SheetTitle>
              <SheetDescription className="hidden">
                Update your dog's nutritional ratios
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
                className="flex flex-col gap-6"
              >
                {Content}
              </form>
            </Form>
          </ScrollArea>

          <div className="">
            <SheetFooter className="flex flex-row justify-between items-center">
              <span
                className={cn(
                  "font-normal",
                  getTotalPercentage(form.getValues()) > 100 ||
                    getTotalPercentage(form.getValues()) < 100
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                Total: {getTotalPercentage(form.getValues())}%
              </span>

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
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDiscardDialog(false)}>
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
    </>
  );
}

// Update helper function to calculate total
function getTotalPercentage(values) {
  const total =
    ((values.ratios_muscle_meat || 0) +
      (values.ratios_bone || 0) +
      (values.ratios_liver || 0) +
      (values.ratios_secreting_organ || 0) +
      (values.ratios_plant_matter || 0)) *
    100;

  const formatted = total.toFixed(1);

  return formatted;
}
