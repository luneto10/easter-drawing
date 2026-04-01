import { updateUserProfile } from "@/server/application/use-cases/users";
import { listRoomMembers, removeMemberFromRoom } from "@/server/application/use-cases/rooms";
import { ensureRoomAdmin } from "@/server/infrastructure/config/room-admin-auth";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
    params: Promise<{ id: string }>;
};

const updateUserBodySchema = z.object({
    name: z.string().trim().min(1).max(120),
    email: z
        .string()
        .trim()
        .email("email is invalid")
        .optional()
        .or(z.literal("")),
});

export async function PATCH(request: Request, context: RouteContext) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = updateUserBodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 },
        );
    }

    try {
        const user = await updateUserProfile(
            id,
            parsed.data.name,
            parsed.data.email || null,
        );
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const members = await listRoomMembers(auth.roomId);
        const row = members.find((m) => m.id === id);
        if (!row) {
            return NextResponse.json({ error: "User not in this room" }, { status: 404 });
        }
        return NextResponse.json(row);
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 },
        );
    }
}

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
        console.error(error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 },
        );
    }
}
