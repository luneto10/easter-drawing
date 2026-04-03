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
    const showReport = Boolean(isOrganizer && onDownloadWishlistReport);

    return (
        <Card
            data-home-room-card
            size="sm"
            onClick={(e) => e.stopPropagation()}
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
                    "absolute inset-0 z-1 rounded-[inherit] text-center outline-none transition-colors md:text-left",
                    "hover:bg-zinc-800/40 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                )}
                onClick={onSelect}
                aria-current={selected ? "true" : undefined}
                aria-label={`Select room ${room.title}, ${room.organizationName}, ${room.eventName}. ${room.drawEnabled ? "Draw open." : "Draw closed."}`}
            />
            <CardContent className="pointer-events-none relative z-2 flex flex-col gap-3 px-4 py-3.5 md:flex-row md:items-center md:justify-between md:gap-3 md:px-3 md:py-2">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center md:items-start md:gap-1 md:text-left">
                    <div className="order-1 flex w-full max-w-md flex-col items-center gap-2 md:max-w-none md:flex-row md:items-center md:justify-between md:gap-2 md:order-2">
                        <CardDescription className="w-full max-w-none text-balance p-0 text-xs leading-snug text-zinc-500 md:flex-1 md:truncate md:text-left">
                            {room.organizationName} · {room.eventName}
                        </CardDescription>
                        {isOrganizer ? (
                            <Badge
                                variant="secondary"
                                className="pointer-events-none h-6 shrink-0 gap-1 border-zinc-600 bg-zinc-800/80 py-0 pr-1.5 pl-1 text-[10px] font-semibold uppercase leading-none tracking-wide text-zinc-300 md:h-5"
                            >
                                <Shield
                                    className="size-3 shrink-0 text-zinc-400"
                                    aria-hidden
                                />
                                Organizer
                            </Badge>
                        ) : null}
                    </div>
                    <CardTitle className="order-2 w-full max-w-md text-balance p-0 text-lg font-medium leading-snug text-zinc-100 md:order-1 md:max-w-none md:text-base md:truncate">
                        {room.title}
                    </CardTitle>
                    <p
                        className={cn(
                            "order-3 w-full max-w-md text-balance text-xs font-medium leading-snug md:max-w-none md:text-left",
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
                <div
                    className={cn(
                        "relative z-3 grid w-full gap-2 pointer-events-auto md:flex md:w-auto md:shrink-0 md:flex-row md:justify-end",
                        showReport ? "grid-cols-2" : "grid-cols-1",
                    )}
                >
                    {showReport ? (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-10 w-full rounded-lg border-zinc-600 bg-zinc-900/90 px-2.5 text-xs text-zinc-100 md:h-8 md:w-auto"
                            disabled={Boolean(wishlistReportLoading)}
                            title="Download CSV of every participant’s wish list in this room"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownloadWishlistReport?.();
                            }}
                        >
                            <FileSpreadsheet
                                className="mr-1.5 h-3.5 w-3.5 shrink-0"
                                aria-hidden
                            />
                            {wishlistReportLoading ? "…" : "Report"}
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        size="sm"
                        className="h-10 w-full rounded-lg px-3 text-xs md:h-8 md:w-auto"
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
