import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function BadgeStack({
    variant,
    icon,
    label,
    avatar,
    avatarImage,
    sublabel,
    className,
    flipped = false,
    showSublabel = true,
    ...props
}) {
    const labelContent = (
        <div className="flex flex-col -mt-0.5">
            {flipped ? (
                <>
                    {showSublabel && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {sublabel}
                        </span>
                    )}
                    <span
                        className={cn("font-medium whitespace-nowrap", {
                            "text-sm":
                                sublabel != "" &&
                                sublabel != null &&
                                sublabel != undefined,
                            "text-success-foreground": variant === "success",
                            "text-warning-foreground": variant === "warning",
                            "text-error-foreground": variant === "error",
                            "text-base":
                                sublabel === "" ||
                                sublabel === null ||
                                sublabel === undefined,
                        })}
                    >
                        {label}
                    </span>
                </>
            ) : (
                <>
                    <span
                        className={cn("text-sm font-medium whitespace-nowrap", {
                            "text-sm":
                                sublabel != "" &&
                                sublabel != null &&
                                sublabel != undefined,
                            "text-success-foreground": variant === "success",
                            "text-warning-foreground": variant === "warning",
                            "text-error-foreground": variant === "error",
                            "text-base":
                                sublabel === "" ||
                                sublabel === null ||
                                sublabel === undefined,
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
            {avatar ? (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarImage} alt={label} />
                    <AvatarFallback className="text-base">
                        {label[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <Badge variant={variant} size="icon" className="p-0">
                    {icon}
                </Badge>
            )}
            {labelContent}
        </div>
    );
}
