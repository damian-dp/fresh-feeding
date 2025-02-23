import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/lib/stores/auth-store";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertTriangle,
    CheckCircle2,
    Loader2,
    X,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
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

// Update AlertController component
function AlertController({
    onTrigger,
    handleResendVerification,
    isResendingVerification,
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const alerts = {
        "Sign Up": {
            type: "success",
            title: "Account created",
            message: "Check your email for the verification link!",
        },
        "Invalid Login": {
            type: "error",
            title: "Invalid credentials",
            message: "Invalid email or password",
        },
        "Password reset sent": {
            type: "success",
            title: "Password reset link sent",
            message:
                "If an account exists with this email, a reset link will be sent.",
        },
        "Link Expired": {
            type: "error",
            title: "Verification link expired",
            message:
                "This verification link has expired. Please sign in to request a new one.",
        },
        "Not Verified": {
            type: "warning",
            title: "Email not verified",
            message:
                "Please check your email for the verification link or request a new one.",
            button: {
                text: "Resend verification email",
                loadingText: "Sending...",
                onClick: handleResendVerification,
                disabled: isResendingVerification,
                loading: isResendingVerification,
            },
        },
        "General Error": {
            type: "error",
            title: "Something went wrong",
            message:
                "An unexpected error occurred. Please try again later. If the problem persists, please contact support.",
        },
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <Card className="w-[280px] shadow-lg border-dashed">
                <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-0">
                        <CardTitle className="text-base">Alert Tester</CardTitle>
                        <CardDescription className="text-sm">
                            Dev tools
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className=""
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronDown className="" />
                        ) : (
                            <ChevronUp className="" />
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
                                        size=""
                                        onClick={() => onTrigger(alert)}
                                        className="justify-start"
                                    >
                                        {alert.type === "error" && (
                                            <AlertTriangle className="text-destructive" />
                                        )}
                                        {alert.type === "success" && (
                                            <CheckCircle2 className="text-success-foreground" />
                                        )}
                                        {alert.type === "warning" && (
                                            <AlertTriangle className="text-warning-foreground" />
                                        )}
                                        <span className="">{name}</span>
                                    </Button>
                                ))}
                                <Button
                                    variant="destructive"
                                    size=""
                                    onClick={() => onTrigger(null)}
                                    className="justify-start bg-destructive/10"
                                >
                                    <X className="" />
                                    <span className="">Clear</span>
                                </Button>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}

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
    const [formAlert, setFormAlert] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Sync URL with form mode
    useEffect(() => {
        const path = location.pathname;
        if (path === "/sign-up") {
            setIsSignUp(true);
            setIsForgotPassword(false);
        } else if (path === "/forgot-password") {
            setIsForgotPassword(true);
            setIsSignUp(false);
        } else {
            setIsSignUp(false);
            setIsForgotPassword(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        if (location.state?.formAlert) {
            setFormAlert(location.state.formAlert);
            // Clear the navigation state
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setFormAlert(null);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setFormAlert(null);
    };

    const handleResendVerification = async () => {
        console.log("Starting verification resend...");
        setIsResendingVerification(true);

        // Update the alert immediately to show loading state
        setFormAlert((prev) => ({
            ...prev,
            button: {
                ...prev.button,
                loading: true,
                disabled: true,
                text: prev.button.text,
                loadingText: prev.button.loadingText,
            },
        }));

        try {
            await authService.resendVerification(email);
            console.log("Verification email sent successfully");
            setFormAlert({
                type: "success",
                title: "Verification email sent",
                message: "Please check your email for the verification link.",
            });
        } catch (err) {
            console.error("Failed to send verification:", err);
            setFormAlert({
                type: "error",
                title: "Failed to send verification email",
                message: err.message,
            });
        } finally {
            setIsResendingVerification(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFormAlert(null);

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

                setFormAlert({
                    type: "success",
                    title: "Reset link sent",
                    message: "If this email exists, a reset link will be sent.",
                });

                setTimeout(() => {
                    setIsForgotPassword(false);
                    setEmail("");
                }, 8000);
            } else {
                const result = isSignUp
                    ? await authService.signUp(email, password, name)
                    : await authService.signIn(email, password);

                if (result) {
                    if (isSignUp) {
                        setFormAlert({
                            type: "success",
                            title: "Account created",
                            message:
                                "Check your email for the confirmation link!",
                        });
                        setTimeout(() => setIsSignUp(false), 8000);
                    } else {
                        // Check if email is verified before redirecting
                        if (result.user?.email_confirmed_at) {
                            setTimeout(() => {
                                navigate("/dashboard", { replace: true });
                            }, 100);
                        } else {
                            setFormAlert({
                                type: "warning",
                                title: "Email not verified",
                                message:
                                    "Please check your email for the verification link or request a new one.",
                                button: {
                                    text: "Resend verification email",
                                    loadingText: "Sending...",
                                    onClick: handleResendVerification,
                                    disabled: isResendingVerification,
                                    loading: isResendingVerification,
                                },
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            if (error.message === "Invalid login credentials") {
                setFormAlert({
                    type: "error",
                    title: "Invalid credentials",
                    message: "Invalid email or password",
                });
            } else if (error.message === "Email not confirmed") {
                setFormAlert({
                    type: "warning",
                    title: "Email not verified",
                    message:
                        "Please check your email for the verification link or request a new one.",
                    button: {
                        text: "Resend verification email",
                        loadingText: "Sending...",
                        onClick: handleResendVerification,
                        disabled: isResendingVerification,
                        loading: isResendingVerification,
                    },
                });
            } else {
                setFormAlert({
                    type: "error",
                    title: "Authentication error",
                    message: error.message,
                });
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
            setFormAlert({
                type: "error",
                title: "Social login error",
                message: error.message,
            });
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
                setFormAlert({
                    type: "error",
                    title: "Authentication failed",
                    message: "Failed to sign in with social provider",
                });
                setLoadingProvider(null);
            }
        };

        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
            checkSession();
        }
    }, [navigate]);

    const handleModeSwitch = () => {
        if (isSignUp) {
            navigate("/sign-in", { replace: true });
        } else {
            navigate("/sign-up", { replace: true });
        }
        setEmail("");
        setPassword("");
        setName("");
        setFormAlert(null);
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        navigate("/forgot-password", { replace: true });
        setEmail("");
        setPassword("");
        setName("");
        setFormAlert(null);
    };

    const handleBackToSignIn = (e) => {
        e.preventDefault();
        navigate("/sign-in", { replace: true });
        setEmail("");
        setPassword("");
        setName("");
        setFormAlert(null);
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

                    <AnimatePresence mode="wait">
                        {formAlert && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full mb-6"
                            >
                                <Alert variant={formAlert.type}>
                                    {formAlert.type === "error" ? (
                                        <AlertTriangle className="" />
                                    ) : formAlert.type === "warning" ? (
                                        <AlertTriangle className="" />
                                    ) : (
                                        <CheckCircle2 className="" />
                                    )}
                                    <div className="flex flex-col gap-1.5">
                                        <AlertTitle>
                                            {formAlert.title}
                                        </AlertTitle>
                                        <AlertDescription>
                                            {formAlert.message}
                                            {formAlert.button && (
                                                <Button
                                                    variant={formAlert.type}
                                                    className="w-full mt-5"
                                                    size=""
                                                    onClick={
                                                        formAlert.button.onClick
                                                    }
                                                    disabled={
                                                        formAlert.button
                                                            .disabled ||
                                                        formAlert.button.loading
                                                    }
                                                >
                                                    {formAlert.button.loading ||
                                                    isResendingVerification ? (
                                                        <>
                                                            <Loader2 className="animate-spin" />
                                                            {
                                                                formAlert.button
                                                                    .loadingText
                                                            }
                                                        </>
                                                    ) : (
                                                        formAlert.button.text
                                                    )}
                                                </Button>
                                            )}
                                        </AlertDescription>
                                    </div>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

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

            {/* Add AlertController only in development */}
            {import.meta.env.DEV && (
                <AlertController
                    onTrigger={setFormAlert}
                    handleResendVerification={handleResendVerification}
                    isResendingVerification={isResendingVerification}
                />
            )}
        </div>
    );
}
