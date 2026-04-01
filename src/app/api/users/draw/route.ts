import {
    type UserListItem,
    toUserListItem,
} from "@/server/application/dto/user-list-item";
import { assignUsers, drawnUsers } from "@/server/application/use-cases/users";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

/**
 * GET /api/users/draw
 * Preview draw: giver user id → assigned receiver (in-memory only; not saved).
 */
export async function GET() {
    try {
        const assignments = await drawnUsers();
        const body: Record<string, UserListItem> = {};
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

export async function POST() {
    try {
        const assignments = await assignUsers();
        return NextResponse.json(assignments);
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
