import {
    toUserListItem,
} from "@/server/application/dto/user-list-item";
import {
    assignUsersInRoom,
    drawnUsersInRoom,
} from "@/server/application/use-cases/users";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

function roomIdFrom(request: Request): string | null {
    return new URL(request.url).searchParams.get("roomId")?.trim() ?? null;
}

/**
 * GET /api/users/draw?roomId=
 * Preview draw for a room (in-memory first hop only; then persisted layout matches assign).
 */
export async function GET(request: Request) {
    const roomId = roomIdFrom(request);
    if (!roomId) {
        return NextResponse.json(
            { error: "roomId query parameter is required" },
            { status: 400 },
        );
    }

    try {
        const assignments = await drawnUsersInRoom(roomId);
        const body: Record<string, ReturnType<typeof toUserListItem>> = {};
        for (const [giverId, receiver] of Object.entries(assignments)) {
            body[giverId] = toUserListItem(receiver);
        }
        return NextResponse.json({ assignments: body });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to compute draw" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const roomId = roomIdFrom(request);
    if (!roomId) {
        return NextResponse.json(
            { error: "roomId query parameter is required" },
            { status: 400 },
        );
    }

    try {
        await assignUsersInRoom(roomId);
        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to compute draw" },
            { status: 500 },
        );
    }
}
