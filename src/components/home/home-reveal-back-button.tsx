"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { backButtonVariants } from "@/components/home/home-motion";

type Props = {
    show: boolean;
    screenKey: string;
    isRouting: boolean;
    onBack: () => void;
};

export function HomeRevealBackButton({
    show,
    screenKey,
    isRouting,
    onBack,
}: Props) {
    return (
        <AnimatePresence mode="wait" initial={false}>
            {show ? (
                <motion.div
                    key={`back-${screenKey}`}
                    variants={backButtonVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute left-4 top-4 z-30 sm:left-6 sm:top-6"
                >
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={onBack}
                        disabled={isRouting}
                        className="rounded-full"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
