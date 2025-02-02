import { Link, useLocation } from "react-router-dom";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingFooter() {
    const location = useLocation();
    console.log("Current pathname:", location.pathname);

    const linkClasses =
        "text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-[6px]";
    const activeLinkClasses =
        "text-sm text-foreground transition-colors underline underline-offset-[6px]";

    return (
        <footer className="">
            <div className="w-full mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <img
                            src="/logo-mark.svg"
                            alt="Fresh Food Feeding"
                            className="size-6"
                        />
                        <span className="text-sm text-muted-foreground pl-2">
                            © {new Date().getFullYear()} Fresh Food Feeding
                        </span>
                        <Dot className="size-5" />
                        <span className="text-sm text-muted-foreground">
                            Developed by{" "}
                            <a
                                href="https://damianpetrov.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground inline-flex items-center transition-colors border-b border-transparent hover:border-b hover:border-foreground pb-[2px] -mb-[2px]"
                            >
                                Damian Petrov
                                <span className="pl-[5px] -mb-[5px]">↗</span>
                            </a>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <a
                            href="mailto:hello@damianpetrov.com?subject=Support%20Enquiry%20%7C%20freshfeeding.com.au"
                            className={linkClasses}
                        >
                            Contact
                        </a>
                        <Link
                            to="/privacy-policy"
                            className={cn(
                                linkClasses,
                                location.pathname === "/privacy-policy" &&
                                    activeLinkClasses
                            )}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms-of-use"
                            className={cn(
                                linkClasses,
                                location.pathname === "/terms-of-use" &&
                                    activeLinkClasses
                            )}
                        >
                            Terms of Use
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
