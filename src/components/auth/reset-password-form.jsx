import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
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

const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
};

export function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

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
                toast.success("Password updated successfully!");
                // Navigate to dashboard since we're already authenticated
                navigate("/dashboard", { replace: true });
            } else {
                // If somehow we don't have a session, redirect to auth
                navigate("/auth", {
                    state: {
                        message:
                            "Password updated successfully! Please sign in with your new password.",
                        isSuccess: true,
                    },
                    replace: true,
                });
            }
        } catch (error) {
            console.error("Password update error:", error);
            setIsLoading(false);
            toast.error(error.message || "Failed to update password");
        }
    };

    return (
        <div className="w-full max-w-[426px] mx-auto space-y-6">
            <Card className="flex flex-col items-center w-full border bg-card p-10">
                <CardHeader className="w-full space-y-1 p-0 mb-10 border-0 h-auto">
                    <CardTitle className="text-2xl text-center font-medium mb-2">
                        Reset password
                    </CardTitle>
                    <CardDescription className="text-center text-base">
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 w-full flex flex-col items-center">
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
                                        setConfirmPassword(e.target.value)
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
                            disabled={isLoading || password !== confirmPassword}
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
                <CardFooter className="flex flex-col w-full space-y-4 p-0 mt-4">
                    <Button
                        variant="ghost"
                        className="text-sm font-normal hover:bg-transparent hover:text-primary"
                        onClick={() => navigate("/auth")}
                    >
                        <AnimatePresence mode="wait">
                            <motion.span key="back" {...fadeAnimation}>
                                Back to sign in
                            </motion.span>
                        </AnimatePresence>
                    </Button>
                </CardFooter>
            </Card>
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
        </div>
    );
}
