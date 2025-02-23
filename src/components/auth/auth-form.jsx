import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/lib/stores/auth-store";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
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
    const [isResendingVerification, setIsResendingVerification] =
        useState(false);
    const [showVerificationAlert, setShowVerificationAlert] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Reset verification alert when changing modes or when user starts typing
    useEffect(() => {
        setShowVerificationAlert(false);
    }, [isSignUp, isForgotPassword]);

    useEffect(() => {
        // Check for verification state from navigation
        if (location.state?.showVerification) {
            setShowVerificationAlert(true);
            setEmail(location.state.email || "");
        }
    }, [location.state]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setShowVerificationAlert(false);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setShowVerificationAlert(false);
    };

    const handleResendVerification = async () => {
        setIsResendingVerification(true);
        try {
            await authService.resendVerification(email);
            toast.success("Verification email sent!");
        } catch (err) {
            toast.error("Failed to resend verification email");
        } finally {
            setIsResendingVerification(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log("Attempting auth...", { isSignUp, isForgotPassword });

            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(
                    email,
                    {
                        redirectTo: `${window.location.origin}/auth/update-password`,
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
                    ? await authService.signUp(email, password, name)
                    : await authService.signIn(email, password);

                if (result) {
                    if (isSignUp) {
                        toast.success(
                            "Check your email for the confirmation link!"
                        );
                        setTimeout(() => setIsSignUp(false), 2000);
                    } else {
                        // Check if email is verified before redirecting
                        if (result.user?.email_confirmed_at) {
                            setTimeout(() => {
                                navigate("/dashboard", { replace: true });
                            }, 100);
                        } else {
                            setShowVerificationAlert(true);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            if (error.message === "Invalid login credentials") {
                toast.error("Invalid email or password");
            } else if (error.message === "Email not confirmed") {
                setShowVerificationAlert(true);
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
            // Configure provider-specific options
            const providerOptions = {
                google: {
                    scopes: "email profile",
                    queryParams: {
                        prompt: "select_account",
                        access_type: "offline",
                    },
                },
                facebook: {
                    scopes: "email public_profile",
                    queryParams: {
                        display: "popup",
                    },
                },
                // Add other providers here if needed
            };

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    ...(providerOptions[provider] || {}),
                },
            });

            if (error) throw error;

            if (!data?.url) {
                throw new Error("Failed to get authorization URL");
            }

            // Redirect to the provider's auth page
            window.location.href = data.url;
        } catch (error) {
            console.error("Social auth error:", error);
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
            <Card className="flex flex-col items-center w-full border bg-card p-10">
                <CardHeader className="w-full space-y-1 p-0 mb-10 border-0 h-auto">
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
                <CardContent className="p-0 w-full flex flex-col items-center">
                    {!isForgotPassword && (
                        <>
                            <div className="grid grid-cols-3 gap-3 w-full">
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
                            <div className="relative my-8 w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        or
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className={`w-full flex flex-col items-center ${
                            isSignUp ? "space-y-8" : "space-y-4"
                        }`}
                    >
                        <div className="space-y-4 w-full">
                            <AnimatePresence>
                                {isSignUp && !isForgotPassword && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full"
                                    >
                                        <div className="space-y-2 w-full">
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

                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
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
                                            onChange={handlePasswordChange}
                                            required={!isForgotPassword}
                                            placeholder="Password"
                                            className="h-12 px-4 text-base w-full"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {showVerificationAlert && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Alert
                                            variant={
                                                location.state?.isExpired
                                                    ? "error"
                                                    : "warning"
                                            }
                                            className="mt-2"
                                        >
                                            <AlertTriangle className="h-4 w-4" />
                                            <div className="flex flex-col gap-2">
                                                <AlertTitle>
                                                    {location.state?.isExpired
                                                        ? "Verification link expired"
                                                        : "Email not verified"}
                                                </AlertTitle>
                                                <AlertDescription className="flex flex-col gap-2">
                                                    {location.state
                                                        ?.isExpired ? (
                                                        <p>
                                                            This verification
                                                            link has expired.
                                                            Please sign in to
                                                            request a new one.
                                                        </p>
                                                    ) : (
                                                        <p>
                                                            Please check your
                                                            email (including
                                                            your spam folder)
                                                            for the verification
                                                            link.
                                                        </p>
                                                    )}
                                                    {!location.state
                                                        ?.isExpired && (
                                                        <Button
                                                            variant="warning"
                                                            className="w-full mt-2"
                                                            size=""
                                                            onClick={
                                                                handleResendVerification
                                                            }
                                                            disabled={
                                                                isResendingVerification
                                                            }
                                                        >
                                                            {isResendingVerification ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Sending...
                                                                </>
                                                            ) : (
                                                                "Resend verification email"
                                                            )}
                                                        </Button>
                                                    )}
                                                </AlertDescription>
                                            </div>
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {!isSignUp && !isForgotPassword && (
                            <div className="flex justify-center w-full">
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
                                isLoading && "w-12 px-0 rounded-full"
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
                <CardFooter className="flex flex-col w-full space-y-4 p-0 mt-4">
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
