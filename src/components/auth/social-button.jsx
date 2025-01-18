import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function SocialButton({ provider, icon, onClick, isLoading, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading || disabled}
            className={cn(
                "h-12 w-full bg-background hover:bg-secondary border rounded-sm transition-all duration-200 relative"
            )}
        >
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="icon"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                    >
                        {icon}
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
