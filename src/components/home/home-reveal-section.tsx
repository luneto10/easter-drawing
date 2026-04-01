"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { RevealResponse, ViewState } from "@/components/home/home-types";
import { screenVariants } from "@/components/home/home-motion";

type Props = {
    view: ViewState;
    sectionKey: string;
    result: RevealResponse | null;
    error: string;
    onGoBack: () => void;
};

export function HomeRevealSection({
    view,
    sectionKey,
    result,
    error,
    onGoBack,
}: Props) {
    return (
        <motion.section
            key={sectionKey}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 z-20 flex items-center justify-center text-center"
        >
            <div className="mx-auto max-w-2xl px-6 py-24">
                {view === "loading" ? (
                    <div className="flex items-center justify-center gap-3 text-zinc-300">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
                        <p className="text-sm">Looking up your match...</p>
                    </div>
                ) : null}

                {view === "result" && result ? (
                    <div className="space-y-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                            Result
                        </p>

                        <div className="space-y-3">
                            <h2 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                                Hi, {result.giver.name}
                            </h2>

                            <p className="text-lg text-zinc-400 sm:text-xl">
                                You are giving a gift to
                            </p>

                            <p className="text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
                                {result.recipient.name}
                            </p>
                        </div>
                    </div>
                ) : null}

                {view === "error" ? (
                    <div className="space-y-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                            Error
                        </p>

                        <div className="space-y-3">
                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                                We could not load your match
                            </h2>

                            <p className="text-base leading-7 text-zinc-400 sm:text-lg">
                                {error ||
                                    "Something went wrong while loading your match."}
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Button type="button" variant="secondary" onClick={onGoBack}>
                                Go back
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </motion.section>
    );
}
