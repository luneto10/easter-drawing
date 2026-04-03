"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type MouseEvent,
} from "react";
import { motion } from "motion/react";

import { HomeIntroHero } from "@/components/home/home-intro-hero";
import { HomeIntroProfileButton } from "@/components/home/home-intro-profile-button";
import { HomeIntroRoomsPanel } from "@/components/home/home-intro-rooms-panel";
import { HomeIntroWishlistDialog } from "@/components/home/home-intro-wishlist-dialog";
import { screenVariants } from "@/components/home/home-motion";
import { cn } from "@/lib/utils";
import type { UserRoomListItem } from "@/types/home";

type Props = {
    savedUserId: string;
    profileName: string | null;
    profileLoading: boolean;
    roomIdSummary: string | null;
    roomTitle: string | null;
    focusOrganizationName: string | null;
    focusEventName: string | null;
    currentRoomDrawOpen: boolean | null;
    error: string;
    myRooms: UserRoomListItem[];
    myRoomsLoading: boolean;
    onLogout: () => void;
    onOpenLogin: () => void;
    onOpenCreateRoom: () => void;
    onOpenJoinRoom: () => void;
    onSelectMyRoom: (room: UserRoomListItem) => void;
    onClearRoomSelection: () => void;
    onRevealMyRoom: (room: UserRoomListItem) => void;
    wishlistReportBusyRoomId: string | null;
    onDownloadWishlistReport: (room: UserRoomListItem) => void;
    onOpenRecoverId: () => void;
    createAccountHref: string;
};

export function HomeIntroSection({
    savedUserId,
    profileName,
    profileLoading,
    roomIdSummary,
    roomTitle,
    focusOrganizationName,
    focusEventName,
    currentRoomDrawOpen,
    error,
    myRooms,
    myRoomsLoading,
    onLogout,
    onOpenLogin,
    onOpenCreateRoom,
    onOpenJoinRoom,
    onSelectMyRoom,
    onClearRoomSelection,
    onRevealMyRoom,
    wishlistReportBusyRoomId,
    onDownloadWishlistReport,
    onOpenRecoverId,
    createAccountHref,
}: Props) {
    const [wishlistOpen, setWishlistOpen] = useState(false);
    /** Ignore intro background deselect right after closing wish list (overlay click-through). */
    const suppressClearRoomAfterWishlistCloseRef = useRef(false);
    const suppressClearRoomTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    useEffect(() => {
        setWishlistOpen(false);
    }, [roomIdSummary]);

    useEffect(() => {
        return () => {
            if (suppressClearRoomTimeoutRef.current) {
                clearTimeout(suppressClearRoomTimeoutRef.current);
            }
        };
    }, []);

    const handleWishlistOpenChange = useCallback((open: boolean) => {
        if (!open) {
            suppressClearRoomAfterWishlistCloseRef.current = true;
            if (suppressClearRoomTimeoutRef.current) {
                clearTimeout(suppressClearRoomTimeoutRef.current);
            }
            suppressClearRoomTimeoutRef.current = setTimeout(() => {
                suppressClearRoomAfterWishlistCloseRef.current = false;
                suppressClearRoomTimeoutRef.current = null;
            }, 400);
        }
        setWishlistOpen(open);
    }, []);

    const roomLine = roomIdSummary
        ? roomTitle
            ? `Room: ${roomTitle}`
            : `Room: ${roomIdSummary.slice(0, 8)}…`
        : null;

    const statusHint =
        roomIdSummary && currentRoomDrawOpen === false ? (
            <span className="text-red-400">Draw closed</span>
        ) : roomIdSummary && currentRoomDrawOpen === true ? (
            <span className="text-emerald-400">Draw open</span>
        ) : roomIdSummary && currentRoomDrawOpen === null ? (
            <span className="text-zinc-500">Checking room…</span>
        ) : null;

    const selectedRoomFromList = useMemo(
        () =>
            roomIdSummary
                ? myRooms.find((r) => r.id === roomIdSummary)
                : undefined,
        [myRooms, roomIdSummary],
    );

    const showWishlistPanel = Boolean(
        savedUserId &&
        roomIdSummary &&
        selectedRoomFromList &&
        savedUserId.trim(),
    );

    const organizerAdminHref =
        selectedRoomFromList?.adminKey != null &&
        selectedRoomFromList.adminKey !== ""
            ? `/admin?room=${encodeURIComponent(selectedRoomFromList.id)}&key=${encodeURIComponent(selectedRoomFromList.adminKey)}`
            : null;

    const eyebrow =
        roomIdSummary && focusOrganizationName
            ? focusOrganizationName
            : "Gift exchange";

    const welcomeHeadline =
        roomIdSummary && focusEventName ? focusEventName : "Welcome";

    const hasFullRoomBranding = Boolean(
        roomIdSummary && focusOrganizationName && focusEventName,
    );

    const handleIntroBackgroundClick = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            if (
                wishlistOpen ||
                suppressClearRoomAfterWishlistCloseRef.current
            ) {
                return;
            }
            const el = e.target as HTMLElement;
            if (el.closest("[data-home-room-card]")) return;
            if (el.closest('[data-slot="scroll-area"]')) return;
            if (el.closest("button")) return;
            if (el.closest("a")) return;
            if (el.closest('[role="dialog"]')) return;
            if (el.closest('[data-slot="dialog-overlay"]')) return;
            if (el.closest("input, textarea, select, label")) return;
            if (!roomIdSummary) return;
            onClearRoomSelection();
        },
        [wishlistOpen, roomIdSummary, onClearRoomSelection],
    );

    const showRoomsPanel = Boolean(
        savedUserId && (myRoomsLoading || myRooms.length > 0),
    );

    const hero = (
        <HomeIntroHero
            eyebrow={eyebrow}
            welcomeHeadline={welcomeHeadline}
            roomLine={roomLine}
            statusHint={statusHint}
            savedUserId={savedUserId}
            profileName={profileName}
            profileLoading={profileLoading}
            hasFullRoomBranding={hasFullRoomBranding}
            createAccountHref={createAccountHref}
            organizerAdminHref={organizerAdminHref}
            showWishlistButton={showWishlistPanel}
            roomIdSummary={roomIdSummary}
            onOpenLogin={onOpenLogin}
            onOpenCreateRoom={onOpenCreateRoom}
            onOpenJoinRoom={onOpenJoinRoom}
            onOpenRecoverId={onOpenRecoverId}
            onLogout={onLogout}
            onOpenWishlist={() => handleWishlistOpenChange(true)}
        />
    );

    return (
        <motion.section
            key="intro"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="presentation"
            onClick={handleIntroBackgroundClick}
            className={cn(
                "absolute inset-0 z-10 flex flex-col text-center",
                showRoomsPanel
                    ? "h-full min-h-0 w-full items-stretch overflow-hidden"
                    : "items-center justify-center overflow-y-auto",
            )}
        >
            {savedUserId ? (
                <div
                    className="pointer-events-auto absolute right-4 top-4 z-30 sm:right-6 sm:top-6 md:hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <HomeIntroProfileButton
                        savedUserId={savedUserId}
                        profileName={profileName}
                        profileLoading={profileLoading}
                        placement="toolbar"
                    />
                </div>
            ) : null}
            {showRoomsPanel ? (
                <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
                    <div className="flex min-h-0 flex-1 flex-col justify-center px-3 pb-10">
                        <div className="mx-auto flex max-h-full min-h-0 w-full max-w-2xl flex-col overflow-hidden">
                            <div className="shrink-0">{hero}</div>
                            <HomeIntroRoomsPanel
                                myRooms={myRooms}
                                myRoomsLoading={myRoomsLoading}
                                roomIdSummary={roomIdSummary}
                                wishlistReportBusyRoomId={
                                    wishlistReportBusyRoomId
                                }
                                error={error}
                                onSelectMyRoom={onSelectMyRoom}
                                onRevealMyRoom={onRevealMyRoom}
                                onDownloadWishlistReport={
                                    onDownloadWishlistReport
                                }
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {hero}
                    {error ? (
                        <div className="mx-auto mt-6 w-full max-w-2xl px-3">
                            <p className="text-center text-sm text-red-400">
                                {error}
                            </p>
                        </div>
                    ) : null}
                    <div className="pb-10" aria-hidden />
                </>
            )}

            {showWishlistPanel && roomIdSummary ? (
                <HomeIntroWishlistDialog
                    open={wishlistOpen}
                    onOpenChange={handleWishlistOpenChange}
                    savedUserId={savedUserId}
                    roomId={roomIdSummary}
                    roomTitle={roomTitle}
                />
            ) : null}
        </motion.section>
    );
}
