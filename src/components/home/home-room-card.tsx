"use client";

import { FileSpreadsheet, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import type { UserRoomListItem } from "@/types/home";
import { cn } from "@/lib/utils";

type Props = {
    room: UserRoomListItem;
    selected: boolean;
    isOrganizer: boolean;
    onSelect: () => void;
    onReveal: () => void;
    onDownloadWishlistReport?: () => void;
    wishlistReportLoading?: boolean;
};

export function HomeRoomCard({
    room,
    selected,
    isOrganizer,
    onSelect,
    onReveal,
    onDownloadWishlistReport,
    wishlistReportLoading,
}: Props) {
    return (
        <Card
            size="sm"
            className={cn(
                "relative gap-0 border py-0 shadow-md ring-1 transition-colors dark:shadow-none",
                selected
                    ? "border-zinc-100 bg-zinc-900/40 ring-zinc-500/40 dark:border-zinc-100 dark:bg-zinc-900/40"
                    : "border-zinc-800 bg-zinc-950/50 ring-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/50",
            )}
        >
            <button
                type="button"
                className={cn(
                    "absolute inset-0 z-1 rounded-[inherit] text-left outline-none transition-colors",
                    "hover:bg-zinc-800/40 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                )}
                onClick={onSelect}
                aria-current={selected ? "true" : undefined}
                aria-label={`Select room ${room.title}, ${room.organizationName}, ${room.eventName}. ${room.drawEnabled ? "Draw open." : "Draw closed."}`}
            />
            <CardContent className="pointer-events-none relative z-2 flex flex-col gap-2.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-2">
                <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="truncate p-0 text-base font-medium leading-snug text-zinc-100">
                        {room.title}
                    </CardTitle>
                    <div className="flex min-w-0 items-center justify-between gap-2">
                        <CardDescription className="min-w-0 flex-1 truncate p-0 text-xs leading-snug text-zinc-500">
                            {room.organizationName} · {room.eventName}
                        </CardDescription>
                        {isOrganizer ? (
                            <Badge
                                variant="secondary"
                                className="pointer-events-none h-5 shrink-0 gap-1 border-zinc-600 bg-zinc-800/80 py-0 pr-1.5 pl-1 text-[10px] font-semibold uppercase leading-none tracking-wide text-zinc-300"
                            >
                                <Shield
                                    className="size-3 shrink-0 text-zinc-400"
                                    aria-hidden
                                />
                                Organizer
                            </Badge>
                        ) : null}
                    </div>
                    <p
                        className={cn(
                            "text-xs font-medium leading-snug",
                            room.drawEnabled
                                ? "text-emerald-400"
                                : "text-red-400",
                        )}
                    >
                        {room.drawEnabled
                            ? "Draw open — new joins allowed"
                            : "Draw closed — cannot join or reveal"}
                    </p>
                </div>
                <div className="relative z-3 flex shrink-0 flex-wrap items-center justify-end gap-2 sm:justify-start sm:self-center pointer-events-auto">
                    {isOrganizer && onDownloadWishlistReport ? (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg border-zinc-600 bg-zinc-900/90 px-2.5 text-xs text-zinc-100"
                            disabled={Boolean(wishlistReportLoading)}
                            title="Download CSV of every participant’s wish list in this room"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownloadWishlistReport();
                            }}
                        >
                            <FileSpreadsheet
                                className="mr-1.5 h-3.5 w-3.5"
                                aria-hidden
                            />
                            {wishlistReportLoading ? "…" : "Report"}
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-lg px-3 text-xs"
                        disabled={!room.drawEnabled}
                        title={
                            room.drawEnabled
                                ? "See who you give to"
                                : "Organizer closed this draw"
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            onReveal();
                        }}
                    >
                        Reveal
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
