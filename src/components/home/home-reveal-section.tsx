"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DesiredItemDto } from "@/types/desired-item";
import type { RevealResponse, ViewState } from "@/types/home";
import { screenVariants } from "@/components/home/home-motion";
import { AppApiClient } from "@/lib/api/app-api-client";
import { cn } from "@/lib/utils";

type Props = {
    view: ViewState;
    sectionKey: string;
    result: RevealResponse | null;
    error: string;
    /** Room scope for loading the recipient’s wish list (same as reveal). */
    roomId: string;
    onGoBack: () => void;
};

type ApiItem = { id: string; itemText: string; sortOrder: number };

export function HomeRevealSection({
    view,
    sectionKey,
    result,
    error,
    roomId,
    onGoBack,
}: Props) {
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [wishlistError, setWishlistError] = useState("");
    const [wishlistItems, setWishlistItems] = useState<DesiredItemDto[]>([]);
    const [wishlistRecipientName, setWishlistRecipientName] = useState("");

    const resetWishlistState = useCallback(() => {
        setWishlistLoading(false);
        setWishlistError("");
        setWishlistItems([]);
        setWishlistRecipientName("");
    }, []);

    useEffect(() => {
        if (!wishlistOpen || !result || !roomId.trim()) return;

        const giverId = result.giver.id;
        const rid = roomId.trim();
        let cancelled = false;

        setWishlistLoading(true);
        setWishlistError("");
        setWishlistItems([]);
        setWishlistRecipientName(result.recipient.name);

        void (async () => {
            try {
                const outcome = await AppApiClient.listRecipientDesiredItems(
                    giverId,
                    rid,
                );
                if (cancelled) return;
                if (!outcome.ok) {
                    setWishlistError(outcome.error);
                    return;
                }
                if (typeof outcome.recipientName === "string") {
                    setWishlistRecipientName(outcome.recipientName);
                }
                setWishlistItems(outcome.items);
            } catch {
                if (!cancelled) {
                    setWishlistError("Could not load their gift ideas.");
                }
            } finally {
                if (!cancelled) setWishlistLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [wishlistOpen, result, roomId]);

    const handleWishlistOpenChange = (open: boolean) => {
        setWishlistOpen(open);
        if (!open) resetWishlistState();
    };

    const showWishlistCta =
        view === "result" &&
        result &&
        Boolean(roomId.trim());

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

                        {showWishlistCta ? (
                            <>
                                <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="rounded-xl"
                                        onClick={() =>
                                            setWishlistOpen(true)
                                        }
                                    >
                                        <Gift
                                            className="mr-2 size-4"
                                            aria-hidden
                                        />
                                        See their gift ideas
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl border-zinc-600 bg-zinc-950/50 text-zinc-100 hover:bg-zinc-800/80"
                                        onClick={onGoBack}
                                    >
                                        Back to rooms
                                    </Button>
                                </div>

                                <Dialog
                                    open={wishlistOpen}
                                    onOpenChange={handleWishlistOpenChange}
                                >
                                    <DialogContent
                                        className="gap-4 border-zinc-200 sm:max-w-lg"
                                        showCloseButton
                                    >
                                        <DialogHeader>
                                            <DialogTitle>
                                                {wishlistRecipientName
                                                    ? `Gift ideas for ${wishlistRecipientName}`
                                                    : "Gift ideas"}
                                            </DialogTitle>
                                            <DialogDescription>
                                                From their wish list for this
                                                room. Use it as inspiration —
                                                surprises are welcome too.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <ScrollArea
                                            className={cn(
                                                "max-h-[min(50vh,22rem)] pr-3",
                                                wishlistLoading &&
                                                    "opacity-80",
                                            )}
                                        >
                                            {wishlistLoading ? (
                                                <p className="py-6 text-center text-sm text-muted-foreground">
                                                    Loading…
                                                </p>
                                            ) : wishlistError ? (
                                                <p className="py-4 text-center text-sm text-destructive">
                                                    {wishlistError}
                                                </p>
                                            ) : wishlistItems.length === 0 ? (
                                                <p className="py-6 text-center text-sm text-muted-foreground">
                                                    They have not added anything
                                                    yet. A thoughtful pick of
                                                    your own is perfect.
                                                </p>
                                            ) : (
                                                <ul className="space-y-2 pb-1 text-left">
                                                    {wishlistItems.map(
                                                        (item) => (
                                                            <li
                                                                key={item.id}
                                                            >
                                                                <Card className="border-zinc-200 shadow-none">
                                                                    <CardContent className="px-3 py-2.5 text-sm leading-snug text-card-foreground">
                                                                        {
                                                                            item.itemText
                                                                        }
                                                                    </CardContent>
                                                                </Card>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                        </ScrollArea>

                                        <DialogFooter className="sm:justify-center">
                                            <DialogClose asChild>
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                >
                                                    Done
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        ) : (
                            <div className="flex justify-center pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl border-zinc-600 bg-zinc-950/50 text-zinc-100 hover:bg-zinc-800/80"
                                    onClick={onGoBack}
                                >
                                    Back to rooms
                                </Button>
                            </div>
                        )}
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
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onGoBack}
                            >
                                Go back
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </motion.section>
    );
}
