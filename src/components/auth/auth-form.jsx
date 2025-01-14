import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/auth-store";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
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
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import Facebook from "@/assets/icons/facebook";
import Apple from "@/assets/icons/apple-1";
import Google from "@/assets/icons/google";
import { SocialButton } from "./social-button";

const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
};

export function AuthForm() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const { signIn, signUp } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log("Attempting auth...", { isSignUp, isForgotPassword });

            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(
                    email,
                    {
                        redirectTo: `${window.location.origin}/reset-password`,
                    }
                );

                if (error) throw error;

                toast.success(
                    "If this email exists, a reset link will be sent."
                );

                setTimeout(() => {
                    setIsForgotPassword(false);
                    setEmail("");
                }, 2000);
            } else {
                const result = isSignUp
                    ? await signUp(email, password, name)
                    : await signIn(email, password);

                console.log("Auth result:", result);

                if (result) {
                    if (isSignUp) {
                        toast.success(
                            "Check your email for the confirmation link!"
                        );
                        setTimeout(() => setIsSignUp(false), 2000);
                    } else {
                        console.log("Navigating to dashboard...");
                        navigate("/dashboard", { replace: true });
                    }
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            if (error.message === "Invalid login credentials") {
                toast.error("Invalid email or password");
            } else if (error.message === "Email not confirmed") {
                toast.message("Email address not verified.", {
                    action: {
                        label: "Send new email",
                        onClick: async (e) => {
                            e.preventDefault();

                            const button = e.currentTarget;
                            const originalText = button.textContent;

                            button.disabled = true;
                            button.innerHTML = `
                                <div class="flex items-center gap-1">
                                    <div class="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                    Sending...
                                </div>
                            `;

                            try {
                                await useAuthStore
                                    .getState()
                                    .resendVerification(email);

                                toast.success("Verification email sent!");
                            } catch (err) {
                                toast.error(
                                    "Failed to resend verification email"
                                );
                            }
                        },
                    },
                });
            } else {
                toast.error(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialAuth = async (provider) => {
        setLoadingProvider(provider);
        try {
            await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo:
                        window.location.origin + window.location.pathname,
                },
            });
        } catch (error) {
            toast.error(error.message);
            setLoadingProvider(null);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                navigate("/dashboard");
            } else {
                toast.error("Failed to sign in");
                setLoadingProvider(null);
            }
        };

        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
            checkSession();
        }
    }, [navigate]);

    const handleModeSwitch = () => {
        setIsSignUp(!isSignUp);
        setIsForgotPassword(false);
        setEmail("");
        setPassword("");
        setName("");
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        setIsForgotPassword(true);
        setIsSignUp(false);
        setEmail("");
        setPassword("");
        setName("");
    };

    return (
        <div className="w-full max-w-[426px] mx-auto space-y-6">
            <Card className="w-full border bg-card p-10">
                <CardHeader className="space-y-1 p-0 mb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={
                                isForgotPassword
                                    ? "forgot"
                                    : isSignUp
                                    ? "signup"
                                    : "signin"
                            }
                            {...fadeAnimation}
                        >
                            <CardTitle className="text-2xl text-center font-medium mb-2">
                                {isForgotPassword
                                    ? "Forgot your password?"
                                    : isSignUp
                                    ? "Get started"
                                    : "Welcome back"}
                            </CardTitle>
                            <CardDescription className="text-center text-base">
                                {isForgotPassword
                                    ? "Request a password reset link."
                                    : isSignUp
                                    ? "Join the fresh food revolution!"
                                    : "Sign in to your account"}
                            </CardDescription>
                        </motion.div>
                    </AnimatePresence>
                </CardHeader>
                <CardContent className="p-0">
                    {!isForgotPassword && (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                <SocialButton
                                    provider="facebook"
                                    icon={<Facebook width="24" height="24" />}
                                    onClick={() => handleSocialAuth("facebook")}
                                    isLoading={loadingProvider === "facebook"}
                                    disabled={loadingProvider !== null}
                                />
                                <SocialButton
                                    provider="apple"
                                    icon={<Apple width="24" height="24" />}
                                    onClick={() => handleSocialAuth("apple")}
                                    isLoading={loadingProvider === "apple"}
                                    disabled={loadingProvider !== null}
                                />
                                <SocialButton
                                    provider="google"
                                    icon={<Google width="24" height="24" />}
                                    onClick={() => handleSocialAuth("google")}
                                    isLoading={loadingProvider === "google"}
                                    disabled={loadingProvider !== null}
                                />
                            </div>
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        or
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence>
                            {isSignUp && !isForgotPassword && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="space-y-2 mb-4">
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            required={isSignUp}
                                            placeholder="Name"
                                            className="h-12 px-4 text-base"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email"
                                className="h-12 px-4 text-base"
                            />

                            <AnimatePresence>
                                {!isForgotPassword && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required={!isForgotPassword}
                                            placeholder="Password"
                                            className="h-12 px-4 text-base"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {!isSignUp && !isForgotPassword && (
                            <div className="flex justify-center">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                    onClick={handleForgotPassword}
                                >
                                    Forgot password?
                                </Button>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className={cn(
                                "w-full h-12 text-base transition-all duration-200",
                                isLoading && "w-12 px-0"
                            )}
                            disabled={isLoading}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLoading ? "loader" : "text"}
                                    {...fadeAnimation}
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : isForgotPassword ? (
                                        "Send link"
                                    ) : isSignUp ? (
                                        "Sign up"
                                    ) : (
                                        "Sign in"
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
                        onClick={handleModeSwitch}
                    >
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isSignUp ? "signin" : "signup"}
                                {...fadeAnimation}
                            >
                                {isSignUp
                                    ? "Already have an account? Sign in"
                                    : "Don't have an account? Sign up"}
                            </motion.span>
                        </AnimatePresence>
                    </Button>
                    <p className="text-center text-xs text-muted-foreground leading-relaxed">
                        By continuing, you agree to Fresh Feeding's{" "}
                        <a
                            href="/terms"
                            className="underline hover:text-primary transition-colors"
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="/privacy"
                            className="underline hover:text-primary transition-colors"
                        >
                            Privacy Policy
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
