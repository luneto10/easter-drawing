import { removeMemberFromRoom } from "@/server/application/use-cases/rooms";
import { ensureRoomAdmin } from "@/server/infrastructure/config/room-admin-auth";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;

    try {
        const deleted = await removeMemberFromRoom(auth.roomId, id);
        if (!deleted) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 },
        );
    }
}
