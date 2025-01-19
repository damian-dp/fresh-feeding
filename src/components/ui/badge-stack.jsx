import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BadgeStack({
    variant,
    icon,
    label,
    sublabel,
    className,
    flipped = false,
    showSublabel = true,
    ...props
}) {
    const labelContent = (
        <div className="flex flex-col">
            {flipped ? (
                <>
                    {showSublabel && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {sublabel}
                        </span>
                    )}
                    <span
                        className={cn("text-sm font-medium whitespace-nowrap", {
                            "text-success-foreground": variant === "success",
                            "text-warning-foreground": variant === "warning",
                            "text-error-foreground": variant === "error",
                        })}
                    >
                        {label}
                    </span>
                </>
            ) : (
                <>
                    <span
                        className={cn("text-sm font-medium whitespace-nowrap", {
                            "text-success-foreground": variant === "success",
                            "text-warning-foreground": variant === "warning",
                            "text-error-foreground": variant === "error",
                        })}
                    >
                        {label}
                    </span>
                    {showSublabel && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {sublabel}
                        </span>
                    )}
                </>
            )}
        </div>
    );

    return (
        <div className={cn("flex items-center gap-2", className)} {...props}>
            <Badge variant={variant} size="icon">
                {icon}
            </Badge>
            {labelContent}
        </div>
    );
}
