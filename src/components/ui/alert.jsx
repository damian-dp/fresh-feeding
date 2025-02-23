import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
    "flex items-start gap-3 w-full rounded-md border p-5 [&>svg]:text-foreground [&>svg]:size-5 [&>svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground",
                error:
                    "border-error-border bg-error/60 text-error-foreground [&>svg]:text-error-foreground",
                warning:
                    "border-warning-border bg-warning text-warning-foreground [&>svg]:text-warning-foreground",
                success:
                    "border-success-border bg-success text-success-foreground [&>svg]:text-success-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
    />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn(
            "font-medium text-base leading-none mt-0.5",
            className
        )}
        {...props}
    />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm font-normal leading-relaxed", className)}
        {...props}
    />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
