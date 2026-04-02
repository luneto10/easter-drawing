"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";

type Props = {
    roomEventDisplay: string;
    loading: boolean;
    hasUsers: boolean;
    hasRemovableMembers: boolean;
    onRefresh: () => void;
    onRunDraw: () => void;
    onSendAllEmails: () => void;
    onRemoveAllParticipants: () => void;
    onDeleteRoom: () => void;
};

export function AdminHeaderToolbar({
    roomEventDisplay,
    loading,
    hasUsers,
    hasRemovableMembers,
    onRefresh,
    onRunDraw,
    onSendAllEmails,
    onRemoveAllParticipants,
    onDeleteRoom,
}: Props) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="icon-sm">
                    <Link href="/" aria-label="Back to menu">
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold">
                    Admin —{" "}
                    {roomEventDisplay ? roomEventDisplay : "Gift exchange"}
                </h1>
                <Button variant="ghost" size="icon-sm" aria-label="Menu">
                    <Menu />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    onClick={() => void onRefresh()}
                    variant="outline"
                    disabled={loading}
                >
                    Refresh
                </Button>
                <Button
                    type="button"
                    onClick={() => void onRunDraw()}
                    disabled={loading || !hasUsers}
                >
                    Run Draw Again
                </Button>
                <Button
                    type="button"
                    onClick={() => void onSendAllEmails()}
                    variant="outline"
                    disabled={loading || !hasUsers}
                >
                    Send All Email
                </Button>
                <Button
                    type="button"
                    onClick={() => void onRemoveAllParticipants()}
                    variant="destructive"
                    disabled={loading || !hasRemovableMembers}
                >
                    Remove all participants
                </Button>
                <Button
                    type="button"
                    onClick={() => void onDeleteRoom()}
                    variant="destructive"
                    className="border border-red-900 bg-transparent text-red-800 hover:bg-red-50"
                    disabled={loading}
                >
                    Delete room
                </Button>
            </div>
        </div>
    );
}
