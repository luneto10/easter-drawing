import { joinRoom } from "@/server/application/use-cases/rooms";
import { DomainError } from "@/server/shared/errors/domain-error";
import { normalizeEntityId } from "@/server/shared/ids/normalize-entity-id";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
    userId: z
        .string()
        .transform((s) => normalizeEntityId(s))
        .pipe(z.string().uuid()),
    roomId: z
        .string()
        .transform((s) => normalizeEntityId(s))
        .pipe(z.string().uuid()),
});

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 },
        );
    }

    try {
        const room = await joinRoom(parsed.data.userId, parsed.data.roomId);
        return NextResponse.json({
            room: {
                id: room.id,
                title: room.title,
                organizationName: room.organizationName,
                eventName: room.eventName,
                drawEnabled: room.drawEnabled,
            },
        });
    } catch (error) {
        if (error instanceof DomainError) {
            const closed = error.message.includes("Joining is closed");
            return NextResponse.json(
                { error: error.message },
                { status: closed ? 403 : 400 },
            );
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to join room" },
            { status: 500 },
        );
    }
}
