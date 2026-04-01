import { createUserBodySchema } from "@/server/application/dto/create-user-body";
import { toUserListItem } from "@/server/application/dto/user-list-item";
import { createUser, listUsers } from "@/server/application/use-cases/users";
import { ensureAdminCode } from "@/server/infrastructure/config/admin-auth";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const unauthorized = ensureAdminCode(request);
    if (unauthorized) return unauthorized;

    try {
        const users = await listUsers();
        return NextResponse.json(users.map(toUserListItem));
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to list users" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const unauthorized = ensureAdminCode(request);
    if (unauthorized) return unauthorized;

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
        const user = await createUser(parsed.data.name);
        return NextResponse.json(toUserListItem(user), { status: 201 });
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
