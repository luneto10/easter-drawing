import { toUserListItem } from "@/server/application/dto/user-list-item";
import { getUserById } from "@/server/application/use-cases/users";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const { id } = await context.params;

    try {
        const user = await getUserById(id);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }
        return NextResponse.json(toUserListItem(user));
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to load user" },
            { status: 500 },
        );
    }
}
