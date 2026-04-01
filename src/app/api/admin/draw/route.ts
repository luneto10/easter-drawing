import { toUserListItem } from "@/server/application/dto/user-list-item";
import { assignUsers } from "@/server/application/use-cases/users";
import { ensureAdminCode } from "@/server/infrastructure/config/admin-auth";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const unauthorized = ensureAdminCode(request);
    if (unauthorized) return unauthorized;

    try {
        const users = await assignUsers();
        return NextResponse.json(users.map(toUserListItem));
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
