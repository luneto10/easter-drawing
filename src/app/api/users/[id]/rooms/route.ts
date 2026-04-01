import { listRoomsForUser } from "@/server/application/use-cases/rooms";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const { id } = await context.params;

    try {
        const rooms = await listRoomsForUser(id);
        return NextResponse.json(rooms);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to list rooms" },
            { status: 500 },
        );
    }
}
