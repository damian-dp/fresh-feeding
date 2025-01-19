import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center gap-2 rounded-full border text-sm font-medium transition-colors focus:outline-none focus:ring-0 [&_svg]:pointer-events-none [&_svg]:size-[1.125rem] [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-background border-border",
                meat: "bg-meat border-meat-border text-meat-foreground",
                plant: "bg-plant border-plant-border text-plant-foreground",
                organ: "bg-organ border-organ-border text-organ-foreground",
                liver: "bg-liver border-liver-border text-liver-foreground",
                warning:
                    "bg-warning border-warning-border text-warning-foreground",
                error: "bg-error border-error-border text-error-foreground",
                success:
                    "bg-success border-success-border text-success-foreground",
            },
            size: {
                default: "h-9 px-3 py-1",
                sm: "h-6 px-2 py-0.5",
                icon: "h-10 w-10 justify-center [&_svg]:size-5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Badge({ className, variant, size, ...props }) {
    return (
        <div
            className={cn(badgeVariants({ variant, size }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
