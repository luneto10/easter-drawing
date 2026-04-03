"use client";

import { Gift } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HomeDesiredItemsPanel } from "@/components/home/home-desired-items-panel";
import { HomeWishListDescription } from "@/components/home/wish-list-description";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    savedUserId: string;
    roomId: string;
    roomTitle: string | null;
};

export function HomeIntroWishlistDialog({
    open,
    onOpenChange,
    savedUserId,
    roomId,
    roomTitle,
}: Props) {
    const roomLabel = roomTitle ?? `${roomId.slice(0, 8)}…`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton
                onCloseAutoFocus={(ev) => ev.preventDefault()}
                className="max-h-[min(90vh,640px)] max-w-[calc(100%-2rem)] gap-4 border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-lg dark:border-zinc-800"
            >
                <DialogHeader className="text-left">
                    <DialogTitle className="flex items-center gap-2 text-zinc-50">
                        <Gift
                            className="h-5 w-5 shrink-0 text-amber-400"
                            aria-hidden
                        />
                        Your wish list
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400" asChild>
                        <HomeWishListDescription roomLabel={roomLabel} />
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[min(50vh,380px)] pr-4">
                    <HomeDesiredItemsPanel
                        key={`${savedUserId.trim()}-${roomId}`}
                        variant="plain"
                        userId={savedUserId.trim()}
                        roomId={roomId}
                        roomLabel={roomLabel}
                    />
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
