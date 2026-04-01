import { getRecipientForGiverInRoom } from "@/server/application/use-cases/users";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
    const { id } = await context.params;
    const roomId = new URL(request.url).searchParams.get("roomId")?.trim() ?? "";

    if (!roomId) {
        return NextResponse.json(
            { error: "roomId query parameter is required" },
            { status: 400 },
        );
    }

    try {
        const result = await getRecipientForGiverInRoom(id, roomId);
        if (!result) {
            return NextResponse.json(
                {
                    error:
                        "Your assignment is not ready yet. The organizer still needs to run the draw for this room.",
                },
                { status: 404 },
            );
        }

        return NextResponse.json({
            giver: {
                id: result.giver.id,
                name: result.giver.name,
            },
            recipient: {
                id: result.recipient.id,
                name: result.recipient.name,
            },
        });
    } catch (error) {
        if (error instanceof DomainError) {
            const drawClosed = error.message.includes("Draw is closed");
            return NextResponse.json(
                { error: error.message },
                { status: drawClosed ? 403 : 404 },
            );
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to load recipient" },
            { status: 500 },
        );
    }
}
