"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { HomeRoomCard } from "@/components/home/home-room-card";
import type { UserRoomListItem } from "@/types/home";

type Props = {
    myRooms: UserRoomListItem[];
    myRoomsLoading: boolean;
    roomIdSummary: string | null;
    wishlistReportBusyRoomId: string | null;
    error: string;
    onSelectMyRoom: (room: UserRoomListItem) => void;
    onRevealMyRoom: (room: UserRoomListItem) => void;
    onDownloadWishlistReport: (room: UserRoomListItem) => void;
};

export function HomeIntroRoomsPanel({
    myRooms,
    myRoomsLoading,
    roomIdSummary,
    wishlistReportBusyRoomId,
    error,
    onSelectMyRoom,
    onRevealMyRoom,
    onDownloadWishlistReport,
}: Props) {
    return (
        <div className="mx-auto mt-8 flex w-full max-w-lg shrink-0 flex-col gap-3 text-center md:text-left">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Your rooms
            </p>
            {myRoomsLoading ? (
                <p className="text-center text-sm text-zinc-400">
                    Loading your rooms…
                </p>
            ) : null}
            {!myRoomsLoading && myRooms.length === 0 ? (
                <p className="text-center text-sm text-zinc-400">
                    You are not in any room yet. Create one or join with an ID.
                </p>
            ) : null}
            {!myRoomsLoading && myRooms.length > 0 ? (
                <ScrollArea className="max-h-[min(32vh,240px)] min-h-0 pr-1 sm:max-h-[min(38vh,320px)]">
                    <ul className="space-y-3 pr-3">
                        {myRooms.map((room) => (
                            <li key={room.id}>
                                <HomeRoomCard
                                    room={room}
                                    selected={roomIdSummary === room.id}
                                    isOrganizer={room.isOrganizer}
                                    onSelect={() => onSelectMyRoom(room)}
                                    onReveal={() => onRevealMyRoom(room)}
                                    onDownloadWishlistReport={
                                        room.isOrganizer && room.adminKey
                                            ? () =>
                                                  onDownloadWishlistReport(room)
                                            : undefined
                                    }
                                    wishlistReportLoading={
                                        wishlistReportBusyRoomId === room.id
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            ) : null}
            {error ? (
                <p className="pt-2 text-center text-sm text-red-400">{error}</p>
            ) : null}
        </div>
    );
}
