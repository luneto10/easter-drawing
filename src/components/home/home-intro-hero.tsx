"use client";

import {
    DoorOpen,
    Gift,
    LayoutDashboard,
    LogIn,
    LogOut,
    PlusCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HomeIntroProfileButton } from "@/components/home/home-intro-profile-button";
import type { ReactNode } from "react";

export type HomeIntroHeroProps = {
    eyebrow: string;
    welcomeHeadline: string;
    roomLine: string | null;
    statusHint: ReactNode;
    savedUserId: string;
    profileName: string | null;
    profileLoading: boolean;
    hasFullRoomBranding: boolean;
    createAccountHref: string;
    organizerAdminHref: string | null;
    showWishlistButton: boolean;
    roomIdSummary: string | null;
    onOpenLogin: () => void;
    onOpenCreateRoom: () => void;
    onOpenJoinRoom: () => void;
    onOpenRecoverId: () => void;
    onLogout: () => void;
    onOpenWishlist: () => void;
};

export function HomeIntroHero({
    eyebrow,
    welcomeHeadline,
    roomLine,
    statusHint,
    savedUserId,
    profileName,
    profileLoading,
    hasFullRoomBranding,
    createAccountHref,
    organizerAdminHref,
    showWishlistButton,
    roomIdSummary,
    onOpenLogin,
    onOpenCreateRoom,
    onOpenJoinRoom,
    onOpenRecoverId,
    onLogout,
    onOpenWishlist,
}: HomeIntroHeroProps) {
    return (
        <>
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-3">
                <div className="hidden w-full flex-wrap items-start justify-between gap-4 md:flex">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                        {eyebrow}
                    </p>
                    {savedUserId ? (
                        <HomeIntroProfileButton
                            savedUserId={savedUserId}
                            profileName={profileName}
                            profileLoading={profileLoading}
                            placement="hero"
                        />
                    ) : null}
                </div>

                <div className="space-y-6 text-center">
                    <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400 md:hidden">
                            {eyebrow}
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                            {welcomeHeadline}
                        </h1>
                        {savedUserId ? (
                            roomLine ? (
                                <p className="mt-1 space-x-2 text-xs leading-snug text-zinc-500">
                                    <span>{roomLine}</span>
                                    {statusHint ? (
                                        <span>· {statusHint}</span>
                                    ) : null}
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-amber-500/90">
                                    Choose a room to continue
                                </p>
                            )
                        ) : null}
                    </div>

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
                                <Link href={createAccountHref}>
                                    Create account
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-xl text-zinc-400 hover:text-zinc-200"
                                onClick={onOpenRecoverId}
                            >
                                Email me my ID
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
                            {organizerAdminHref ? (
                                <Button
                                    asChild
                                    type="button"
                                    variant="secondary"
                                    className="rounded-xl"
                                >
                                    <Link
                                        href={organizerAdminHref}
                                        aria-label="Open organizer dashboard"
                                    >
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Organizer
                                    </Link>
                                </Button>
                            ) : null}
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={onLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </Button>
                            {showWishlistButton && roomIdSummary ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="rounded-xl"
                                    onClick={onOpenWishlist}
                                >
                                    <Gift className="mr-2 h-4 w-4 text-amber-400" />
                                    Wish list
                                </Button>
                            ) : null}
                        </>
                    ) : null}
                </div>
            </div>
        </>
    );
}
