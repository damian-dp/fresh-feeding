import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FormAlert({ alert }) {
    if (!alert) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full mb-6"
            >
                <Alert variant={alert.type}>
                    {alert.type === "error" ? (
                        <AlertTriangle className="" />
                    ) : alert.type === "warning" ? (
                        <AlertTriangle className="" />
                    ) : (
                        <CheckCircle2 className="" />
                    )}
                    <div className="flex flex-col gap-1.5">
                        <AlertTitle>{alert.title}</AlertTitle>
                        <AlertDescription>
                            {alert.message}
                            {alert.button ? (
                                <Button
                                    variant={alert.type}
                                    className="w-full mt-5"
                                    size=""
                                    onClick={alert.button.onClick}
                                    disabled={alert.button.disabled}
                                >
                                    {alert.button.loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {alert.button.text}
                                </Button>
                            ) : null}
                        </AlertDescription>
                    </div>
                </Alert>
            </motion.div>
        </AnimatePresence>
    );
}
