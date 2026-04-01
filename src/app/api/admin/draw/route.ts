import { listRoomMembers } from "@/server/application/use-cases/rooms";
import { assignUsersInRoom } from "@/server/application/use-cases/users";
import { ensureRoomAdmin } from "@/server/infrastructure/config/room-admin-auth";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    try {
        await assignUsersInRoom(auth.roomId);
        const users = await listRoomMembers(auth.roomId);
        return NextResponse.json(users);
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to run draw" },
            { status: 500 },
        );
    }
}
