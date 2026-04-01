"use client";

import type { FormEvent } from "react";
import { motion } from "motion/react";
import { LogIn, LogOut, DoorOpen, PlusCircle, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { screenVariants } from "@/components/home/home-motion";

type Props = {
    savedUserId: string;
    profileName: string | null;
    profileLoading: boolean;
    roomIdSummary: string | null;
    roomTitle: string | null;
    showParticipantField: boolean;
    inputValue: string;
    error: string;
    isRouting: boolean;
    canReveal: boolean;
    onGiverInputChange: (value: string) => void;
    onClearFormError: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onLogout: () => void;
    onOpenLogin: () => void;
    onOpenCreateRoom: () => void;
    onOpenJoinRoom: () => void;
};

export function HomeIntroSection({
    savedUserId,
    profileName,
    profileLoading,
    roomIdSummary,
    roomTitle,
    showParticipantField,
    inputValue,
    error,
    isRouting,
    canReveal,
    onGiverInputChange,
    onClearFormError,
    onSubmit,
    onLogout,
    onOpenLogin,
    onOpenCreateRoom,
    onOpenJoinRoom,
}: Props) {
    const roomLine = roomIdSummary
        ? roomTitle
            ? `Room: ${roomTitle}`
            : `Room: ${roomIdSummary.slice(0, 8)}…`
        : null;

    const initial =
        profileName?.trim().charAt(0).toUpperCase() || "·";

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
                        BRASA at UNL
                    </p>
                    {savedUserId ? (
                        <div
                            className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 py-1.5 pl-1.5 pr-4 shadow-sm"
                            aria-label="Your profile"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-900">
                                {profileLoading ? (
                                    <User className="h-4 w-4 text-zinc-600" aria-hidden />
                                ) : (
                                    initial
                                )}
                            </span>
                            <div className="text-left">
                                <p className="text-sm font-medium leading-tight text-zinc-100">
                                    {profileLoading
                                        ? "Loading…"
                                        : profileName ?? "Participant"}
                                </p>
                                {roomLine ? (
                                    <p className="mt-0.5 max-w-[200px] truncate text-xs text-zinc-500 sm:max-w-xs">
                                        {roomLine}
                                    </p>
                                ) : (
                                    <p className="mt-0.5 text-xs text-amber-500/90">
                                        Join a room to draw
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="space-y-6 text-center">
                    <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                        Welcome to the BRASA at UNL Easter Draw
                    </h1>

                    <p className="text-base leading-8 text-zinc-400 sm:text-lg">
                        {savedUserId
                            ? "When you are in a room, reveal who you are giving a gift to."
                            : "Log in or use the link from your email. If you do not have an account yet, create one below."}
                    </p>
                </div>
            </div>

            <div className="mx-auto mt-8 w-full max-w-2xl space-y-4 px-3">
                <div className="flex flex-wrap justify-center gap-2">
                    {!savedUserId ? (
                        <Button
                            type="button"
                            variant="secondary"
                            className="rounded-xl"
                            onClick={onOpenLogin}
                        >
                            <LogIn className="mr-2 h-4 w-4" />
                            Log in
                        </Button>
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

            <div className="mx-auto mt-8 w-full max-w-2xl px-3 pb-10">
                <form onSubmit={onSubmit} className="space-y-4">
                    {showParticipantField ? (
                        <>
                            <label
                                htmlFor="giverId"
                                className="block text-xs uppercase tracking-wider text-zinc-400"
                            >
                                Your participant ID
                            </label>
                            <Input
                                id="giverId"
                                value={inputValue}
                                onChange={(event) => {
                                    onGiverInputChange(event.target.value);
                                    if (error) onClearFormError();
                                }}
                                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                autoComplete="off"
                                spellCheck={false}
                                className="mx-auto h-14 w-full max-w-md rounded-xl border-zinc-800 bg-zinc-950 px-4 text-base text-zinc-100 placeholder:text-zinc-600"
                            />
                        </>
                    ) : null}

                    <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-4">
                        <Button
                            type="submit"
                            disabled={isRouting || !canReveal}
                            size="lg"
                            className="h-14 w-full rounded-xl bg-zinc-100 px-8 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
                        >
                            Reveal
                        </Button>

                        {!savedUserId ? (
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                className="h-14 w-full rounded-xl"
                            >
                                <Link href="/join">Create account with email</Link>
                            </Button>
                        ) : null}
                    </div>

                    {error ? <p className="text-sm text-red-400">{error}</p> : null}
                </form>
            </div>
        </motion.section>
    );
}
