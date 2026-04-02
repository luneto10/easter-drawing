import { createUserBodySchema } from "@/server/application/dto/create-user-body";
import {
    createUserInRoom,
    removeAllMembersExceptCreator,
} from "@/server/application/use-cases/users";
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

export async function POST(request: Request) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = createUserBodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 },
        );
    }

    try {
        const user = await createUserInRoom(
            auth.roomId,
            parsed.data.name,
            parsed.data.email ?? null,
        );
        const members = await listRoomMembers(auth.roomId);
        const row = members.find((m) => m.id === user.id)!;
        return NextResponse.json(row, { status: 201 });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create user" },
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
