import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export function LandingNavbar() {
    const { isAuthenticated, loading: authLoading } = useAuth();

    return (
        <header className="fixed top-3 w-full z-50 sm:px-6 lg:px-8">
            <nav className="container max-w-5xl border border-border bg-card/80 rounded-[24px] backdrop-blur-lg supports-[backdrop-filter]:bg-card/80  mx-auto  flex p-3  items-center justify-between">
                <Link to="/" className="">
                    <div className="flex items-center font-semibold gap-2 leading-none text-nowrap tracking-[-0.015em] text-[1.2rem] px-2">
                        <img
                            src="/logo-mark.svg"
                            alt="Logo"
                            className="size-6 group-data-[collapsible=icon]:size-7"
                        />
                        Fresh Food Feeding
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    {authLoading ? (
                        <Button disabled variant="ghost">
                            <Loader2 className="animate-spin" />
                            Loading
                        </Button>
                    ) : isAuthenticated ? (
                        <Button asChild variant="outline">
                            <Link to="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link to="/auth">Sign in</Link>
                            </Button>
                            <Button asChild variant="plant">
                                <Link to="/auth">Get started</Link>
                            </Button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
} 