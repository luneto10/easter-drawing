"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { LogIn, LogOut, DoorOpen, PlusCircle, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeRoomCard } from "@/components/home/home-room-card";
import { screenVariants } from "@/components/home/home-motion";
import type { UserRoomListItem } from "@/components/home/home-types";

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
    onRevealMyRoom: (room: UserRoomListItem) => void;
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
    onRevealMyRoom,
}: Props) {
    const [participantIdCopied, setParticipantIdCopied] = useState(false);

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

    const initialLetter = profileName?.trim().charAt(0).toUpperCase() ?? null;

    /** No room selected → generic hero. With a room → organization (eyebrow) and event name (title) as they load. */
    const eyebrow =
        roomIdSummary && focusOrganizationName
            ? focusOrganizationName
            : "Gift exchange";

    const welcomeHeadline =
        roomIdSummary && focusEventName ? focusEventName : "Welcome";

    const hasFullRoomBranding = Boolean(
        roomIdSummary && focusOrganizationName && focusEventName,
    );

    return (
        <motion.section
            key="intro"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto text-center"
        >
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-3">
                <div className="flex w-full flex-wrap items-start justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                        {eyebrow}
                    </p>
                    {savedUserId ? (
                        <button
                            type="button"
                            className="flex max-w-full items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 py-1.5 pl-1.5 pr-4 text-left shadow-sm transition-colors hover:border-zinc-600 hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                            aria-label="Your profile — click to copy participant ID"
                            title="Click to copy your participant ID"
                            onClick={() => {
                                void navigator.clipboard.writeText(savedUserId);
                                setParticipantIdCopied(true);
                                window.setTimeout(() => setParticipantIdCopied(false), 2000);
                            }}
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-900">
                                {profileLoading && !profileName ? (
                                    <User
                                        className="h-4 w-4 text-zinc-600"
                                        aria-hidden
                                    />
                                ) : initialLetter ? (
                                    initialLetter
                                ) : (
                                    <User
                                        className="h-4 w-4 text-zinc-600"
                                        aria-hidden
                                    />
                                )}
                            </span>
                            <div className="min-w-0 text-left">
                                <p className="text-sm font-medium leading-tight text-zinc-100">
                                    {profileLoading && !profileName
                                        ? "Loading…"
                                        : (profileName ?? "Participant")}
                                </p>
                                <p
                                    className="mt-0.5 font-mono text-[10px] leading-snug break-all text-zinc-400"
                                    aria-live="polite"
                                >
                                    {savedUserId}
                                    {participantIdCopied ? (
                                        <span className="ml-1.5 font-sans text-emerald-400">
                                            · Copied
                                        </span>
                                    ) : null}
                                </p>
                                {roomLine ? (
                                    <p className="mt-0.5 max-w-[220px] space-x-2 truncate text-xs text-zinc-500 sm:max-w-xs">
                                        <span className="text-zinc-500">
                                            {roomLine}
                                        </span>
                                        {statusHint ? (
                                            <span>· {statusHint}</span>
                                        ) : null}
                                    </p>
                                ) : (
                                    <p className="mt-0.5 text-xs text-amber-500/90">
                                        Choose a room to continue
                                    </p>
                                )}
                            </div>
                        </button>
                    ) : null}
                </div>

                <div className="space-y-6 text-center">
                    <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                        {welcomeHeadline}
                    </h1>

                    <p className="text-base leading-8 text-zinc-400 sm:text-lg">
                        {!savedUserId
                            ? "Log in with your participant ID, or create an account with your email."
                            : hasFullRoomBranding
                              ? "Reveal your assignment when this exchange is open, or select another room below."
                              : "Pick a room below, or create or join one. Green means the organizer is accepting new participants."}
                    </p>
                </div>
            </div>

            <div className="mx-auto mt-8 w-full max-w-2xl space-y-4 px-3">
                <div className="flex flex-wrap justify-center gap-2">
                    {!savedUserId ? (
                        <>
                            <Button
                                type="button"
                                variant="secondary"
                                className="rounded-xl"
                                onClick={onOpenLogin}
                            >
                                <LogIn className="mr-2 h-4 w-4" />
                                Log in
                            </Button>
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                            >
                                <Link href="/join">Create account</Link>
                            </Button>
                        </>
                    ) : null}
                    {savedUserId ? (
                        <>
                            <Button
                                type="button"
                                variant="secondary"
                                className="rounded-xl"
                                onClick={onOpenCreateRoom}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create room
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className="rounded-xl"
                                onClick={onOpenJoinRoom}
                            >
                                <DoorOpen className="mr-2 h-4 w-4" />
                                Join room
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={onLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </Button>
                        </>
                    ) : null}
                </div>
            </div>

            {savedUserId && (myRoomsLoading || myRooms.length > 0) ? (
                <div className="mx-auto mt-8 w-full max-w-lg space-y-3 px-3 text-left">
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
                            You are not in any room yet. Create one or join with
                            an ID.
                        </p>
                    ) : null}
                    <ul className="space-y-3">
                        {myRooms.map((room) => (
                            <li key={room.id}>
                                <HomeRoomCard
                                    room={room}
                                    selected={roomIdSummary === room.id}
                                    onSelect={() => onSelectMyRoom(room)}
                                    onReveal={() => onRevealMyRoom(room)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {error ? (
                <div className="mx-auto mt-6 w-full max-w-2xl px-3">
                    <p className="text-center text-sm text-red-400">{error}</p>
                </div>
            ) : null}

            <div className="pb-10" aria-hidden />
        </motion.section>
    );
}
