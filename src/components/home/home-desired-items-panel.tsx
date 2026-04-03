"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { HomeWishListDescription } from "@/components/home/wish-list-description";
import { AppApiClient } from "@/lib/api/app-api-client";
import { cn } from "@/lib/utils";

type Props = {
    userId: string;
    roomId: string;
    roomLabel: string;
    /** When `plain`, only the form is rendered (for use inside a Dialog). */
    variant?: "card" | "plain";
};

export function HomeDesiredItemsPanel({
    userId,
    roomId,
    roomLabel,
    variant = "card",
}: Props) {
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [savedHint, setSavedHint] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const outcome = await AppApiClient.listMyDesiredItems(
                userId,
                roomId,
            );
            if (!outcome.ok) {
                setError(outcome.error);
                setDraft("");
                return;
            }
            setDraft(outcome.items.map((i) => i.itemText).join("\n"));
        } catch {
            setError("Could not load your wish list.");
            setDraft("");
        } finally {
            setLoading(false);
        }
    }, [userId, roomId]);

    useEffect(() => {
        void load();
    }, [load]);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSavedHint(false);
        const lines = draft.split(/\r?\n/).map((l) => l.trimEnd());
        try {
            const outcome = await AppApiClient.replaceMyDesiredItems(
                userId,
                roomId,
                lines,
            );
            if (!outcome.ok) {
                setError(outcome.error);
                return;
            }
            setSavedHint(true);
            window.setTimeout(() => setSavedHint(false), 2500);
            await load();
        } catch {
            setError("Could not save your wish list.");
        } finally {
            setSaving(false);
        }
    }

    const form = (
        <form onSubmit={onSubmit} className="space-y-3 text-left">
            <textarea
                name="wishlist"
                value={draft}
                onChange={(ev) => setDraft(ev.target.value)}
                disabled={loading || saving}
                rows={variant === "plain" ? 8 : 6}
                className={cn(
                    "min-h-30 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 shadow-sm",
                    "placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                )}
                placeholder="One gift idea per line"
                aria-label="Wish list items, one per line"
            />
            {error ? (
                <p className="text-xs text-red-400">{error}</p>
            ) : null}
            {savedHint ? (
                <p className="text-xs text-emerald-400" role="status">
                    Saved.
                </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
                <Button
                    type="submit"
                    size="sm"
                    className="rounded-lg"
                    disabled={loading || saving}
                >
                    {saving ? "Saving…" : "Save wish list"}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
                    disabled={loading || saving}
                    onClick={() => void load()}
                >
                    Reload
                </Button>
            </div>
        </form>
    );

    if (variant === "plain") {
        return <div className="space-y-3">{form}</div>;
    }

    return (
        <Card
            size="sm"
            className="border-zinc-800 bg-zinc-950/60 text-left shadow-md ring-1 ring-zinc-800"
        >
            <CardHeader className="space-y-1 pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium text-zinc-100">
                    <Gift className="h-4 w-4 text-amber-400" aria-hidden />
                    Your wish list
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                    <HomeWishListDescription roomLabel={roomLabel} />
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">{form}</CardContent>
        </Card>
    );
}
