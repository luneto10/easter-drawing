"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import type { UserRoomListItem } from "@/components/home/home-types";
import { cn } from "@/lib/utils";

type Props = {
    room: UserRoomListItem;
    selected: boolean;
    onSelect: () => void;
    onReveal: () => void;
};

export function HomeRoomCard({
    room,
    selected,
    onSelect,
    onReveal,
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
            <CardContent className="pointer-events-none relative z-2 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <CardTitle className="truncate p-0 text-base font-medium text-zinc-100">
                        {room.title}
                    </CardTitle>
                    <CardDescription className="truncate p-0 text-xs text-zinc-500">
                        {room.organizationName} · {room.eventName}
                    </CardDescription>
                    <p
                        className={cn(
                            "mt-2 text-xs font-medium",
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
                <div className="relative z-3 flex shrink-0 justify-end sm:justify-start pointer-events-auto">
                    <Button
                        type="button"
                        size="sm"
                        className="rounded-lg"
                        disabled={!room.drawEnabled}
                        title={
                            room.drawEnabled
                                ? "See who you give to"
                                : "Organizer closed this draw"
                        }
                        onClick={onReveal}
                    >
                        Reveal
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
