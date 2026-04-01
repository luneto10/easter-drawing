import { getRoomPublicMeta } from "@/server/application/use-cases/rooms";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ roomId: string }>;
};

/** Public room info (for landing when user has room id in URL). */
export async function GET(_request: Request, context: RouteContext) {
    const { roomId } = await context.params;
    const id = roomId?.trim() ?? "";

    if (!id) {
        return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
    }

    try {
        const meta = await getRoomPublicMeta(id);
        if (!meta) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
        return NextResponse.json(meta);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to load room" },
            { status: 500 },
        );
    }
}
