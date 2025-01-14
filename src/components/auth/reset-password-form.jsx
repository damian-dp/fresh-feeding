import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
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
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);

        try {
            console.log("Updating password...");

            // Update the password directly
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            console.log("Password updated successfully");

            // Sign out after successful update
            await supabase.auth.signOut();

            navigate("/auth", {
                state: {
                    message:
                        "Password updated successfully! Please sign in with your new password.",
                    isSuccess: true,
                },
                replace: true,
            });
        } catch (error) {
            console.error("Password update error:", error);
            setIsLoading(false);
            toast.error(error.message);
        }
    };

    return (
        <Card className="border-0 shadow-none sm:border sm:shadow-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Reset password</CardTitle>
                <CardDescription>
                    Enter your new password below to reset your account password
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        <span className="text-xs text-muted-foreground">
                            Must be at least 6 characters long
                        </span>
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLoading ? "loading" : "idle"}
                                {...fadeAnimation}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Updating password...
                                    </div>
                                ) : (
                                    "Update password"
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 p-0 mt-6">
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
    );
}
