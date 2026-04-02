import { removeAllMembersExceptCreator } from "@/server/application/use-cases/users";
import { listRoomMembers } from "@/server/application/use-cases/rooms";
import { ensureRoomAdmin } from "@/server/infrastructure/config/room-admin-auth";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    try {
        const users = await listRoomMembers(auth.roomId);
        return NextResponse.json(users);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to list users" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    try {
        await removeAllMembersExceptCreator(auth.roomId);
        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to remove participants" },
            { status: 500 },
        );
    }
}
