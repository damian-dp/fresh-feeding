import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "hover:bg-error bg-background text-error-foreground hover:bg-error-foreground/15 border border-error-foreground",
                warning:
                    "hover:bg-warning bg-warning-foreground/5 text-warning-foreground hover:bg-warning-foreground/10 border border-warning-foreground",
                success:
                    "hover:bg-success bg-success-foreground/5 text-success-foreground hover:bg-success-foreground/10 border border-success-foreground",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                plant: "border border-plant-border bg-plant hover:bg-plant/30 text-plant-foreground hover:text-plant-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                selected:
                    "bg-success text-success-foreground border border-success-border",
            },
            size: {
                default: "h-10 px-4 py-2 [&_svg]:size-4 [&_svg]:shrink-0",
                sm: "h-9 text-xs gap-1.5 rounded-sm px-2.5 [&_svg]:size-4 [&_svg]:shrink-0",
                lg: "text-base h-12 px-4 [&_svg]:size-5 [&_svg]:shrink-0",
                lgPill: "text-base rounded-full h-12 px-4 [&_svg]:size-5 [&_svg]:shrink-0",
                icon: "h-10 w-10 [&_svg]:size-4 [&_svg]:shrink-0",
                sidebar: "h-10 w-10 [&_svg]:size-5 [&_svg]:shrink-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
