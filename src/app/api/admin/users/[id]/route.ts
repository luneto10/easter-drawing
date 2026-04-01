import { toUserListItem } from "@/server/application/dto/user-list-item";
import {
    deleteUserById,
    updateUserName,
} from "@/server/application/use-cases/users";
import { ensureAdminCode } from "@/server/infrastructure/config/admin-auth";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
    params: Promise<{ id: string }>;
};

const updateUserBodySchema = z.object({
    name: z.string().trim().min(1).max(120),
});

export async function PATCH(request: Request, context: RouteContext) {
    const unauthorized = ensureAdminCode(request);
    if (unauthorized) return unauthorized;

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
        const user = await updateUserName(id, parsed.data.name);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(toUserListItem(user));
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
    const unauthorized = ensureAdminCode(request);
    if (unauthorized) return unauthorized;

    const { id } = await context.params;

    try {
        const deleted = await deleteUserById(id);
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
