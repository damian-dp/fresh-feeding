import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { FormAlert } from "./form-alert";
import {
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    X,
    AlertTriangle,
    CheckCircle2,
    Loader2,
} from "lucide-react";

const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
};

// Add AlertController component
function AlertController({ onTrigger }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const alerts = {
        "Password Updated": {
            type: "success",
            title: "Password updated",
            message:
                "Your password has been updated successfully! Redirecting you now...",
        },
        "Invalid Password": {
            type: "error",
            title: "Invalid password",
            message: "Your new password must be at least 6 characters long. Ideally longer.",
        },
        "Passwords Mismatch": {
            type: "error",
            title: "Passwords do not match",
            message: "Please ensure both passwords match",
        },
        "Update Error": {
            type: "error",
            title: "Failed to update password",
            message:
                "An unexpected error occurred while updating your password. Please try again.",
        },
        "Link Expired": {
            type: "error",
            title: "Reset link expired",
            message:
                "This reset link has expired. Please request a new one from the login page.",
        },
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <Card className="w-[280px] shadow-lg border-dashed">
                <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-0">
                        <CardTitle className="text-sm">Alert Tester</CardTitle>
                        <CardDescription className="text-xs">
                            Dev tools
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </Button>
                </CardHeader>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CardContent className="grid grid-cols-1 gap-2 p-3">
                                {Object.entries(alerts).map(([name, alert]) => (
                                    <Button
                                        key={name}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onTrigger(alert)}
                                        className="justify-start h-8"
                                    >
                                        {alert.type === "error" && (
                                            <AlertTriangle className="h-3 w-3 text-destructive mr-2" />
                                        )}
                                        {alert.type === "success" && (
                                            <CheckCircle2 className="h-3 w-3 text-success mr-2" />
                                        )}
                                        {alert.type === "warning" && (
                                            <AlertTriangle className="h-3 w-3 text-warning mr-2" />
                                        )}
                                        <span className="text-xs">{name}</span>
                                    </Button>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onTrigger(null)}
                                    className="h-8"
                                >
                                    <X className="h-3 w-3 mr-2" />
                                    <span className="text-xs">Clear</span>
                                </Button>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}

export function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formAlert, setFormAlert] = useState(null);
    const [isFormReady, setIsFormReady] = useState(false);
    const navigate = useNavigate();

    // Add form ready state
    useEffect(() => {
        setIsFormReady(false);
        setTimeout(() => setIsFormReady(true), 100);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords
        if (password.length < 6) {
            setFormAlert({
                type: "error",
                title: "Invalid password",
                message: "Password must be at least 6 characters long",
            });
            return;
        }

        if (password !== confirmPassword) {
            setFormAlert({
                type: "error",
                title: "Passwords do not match",
                message: "Please ensure both passwords match",
            });
            return;
        }

        setIsLoading(true);
        setFormAlert(null);

        try {
            console.log("Updating password...");

            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            console.log("Password updated successfully");

            // Instead of signing out, get the current session
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                setFormAlert({
                    type: "success",
                    title: "Password updated",
                    message: "Your password has been updated successfully!",
                });
                // Navigate to dashboard after showing success message
                setTimeout(() => {
                    navigate("/dashboard", { replace: true });
                }, 5000);
            } else {
                // If somehow we don't have a session, redirect to auth
                setFormAlert({
                    type: "success",
                    title: "Password updated",
                    message: "Please sign in with your new password.",
                });
                setTimeout(() => {
                    navigate("/sign-in", {
                        replace: true,
                    });
                }, 5000);
            }
        } catch (error) {
            console.error("Password update error:", error);
            setFormAlert({
                type: "error",
                title: "Failed to update password",
                message: error.message || "An unexpected error occurred",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[426px] mx-auto space-y-6">
            <Card className="flex flex-col items-center w-full border bg-card p-10">
                {!isFormReady ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Loading...
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <CardHeader className="w-full space-y-1 p-0 mb-10 border-0 h-auto relative">
                            <CardTitle className="text-2xl text-center font-medium mb-2">
                                Reset password
                            </CardTitle>
                            <CardDescription className="text-center text-base">
                                Enter your new password below
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 w-full flex flex-col items-center">
                            <FormAlert alert={formAlert} />
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-8 w-full flex flex-col items-center"
                            >
                                <div className="space-y-4 w-full">
                                    <div className="space-y-2">
                                        <Input
                                            type="password"
                                            placeholder="New password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                            minLength={6}
                                            className="h-12 px-4 text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                            minLength={6}
                                            className="h-12 px-4 text-base"
                                        />
                                        {confirmPassword &&
                                            password !== confirmPassword && (
                                                <span className="text-xs text-destructive">
                                                    Passwords do not match
                                                </span>
                                            )}
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className={cn(
                                        "w-full h-12 text-base transition-all duration-200",
                                        isLoading && "w-12 px-0 rounded-full"
                                    )}
                                    disabled={
                                        isLoading ||
                                        password !== confirmPassword
                                    }
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isLoading ? "loading" : "idle"}
                                            {...fadeAnimation}
                                        >
                                            {isLoading ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            ) : (
                                                "Update password"
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </Button>
                            </form>
                        </CardContent>
                    </>
                )}
            </Card>
            {isFormReady && (
                <div>
                    <p className="text-center text-xs text-muted-foreground leading-relaxed">
                        By continuing, you agree to Fresh Feeding's{" "}
                        <Link
                            to="/terms-of-use"
                            className="underline hover:text-primary transition-colors"
                        >
                            Terms of Service
                        </Link>
                    </p>
                    <p className="text-center text-xs text-muted-foreground leading-relaxed">
                        and{" "}
                        <Link
                            to="/privacy-policy"
                            className="underline hover:text-primary transition-colors"
                        >
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            )}

            {/* Add AlertController only in development */}
            {import.meta.env.DEV && (
                <AlertController onTrigger={(alert) => setFormAlert(alert)} />
            )}
        </div>
    );
}
