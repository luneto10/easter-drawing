import { listRecipientDesiredItemsForGiver } from "@/server/application/use-cases/desired-items";
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
        const payload = await listRecipientDesiredItemsForGiver(
            id,
            roomId,
        );
        if (!payload) {
            return NextResponse.json(
                {
                    error:
                        "Your assignment is not ready yet. The organizer still needs to run the draw for this room.",
                },
                { status: 404 },
            );
        }

        return NextResponse.json({
            recipientName: payload.recipientName,
            items: payload.items,
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
            { error: "Failed to load gift ideas" },
            { status: 500 },
        );
    }
}
