import { replaceDesiredItemsBodySchema } from "@/server/application/dto/replace-desired-items-body";
import {
    listDesiredItemsForMember,
    replaceDesiredItemsForMember,
} from "@/server/application/use-cases/desired-items";
import { getUserByParticipantId } from "@/server/application/use-cases/users";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";
import { participantNotFoundResponse } from "@/server/shared/http/participant-not-found";

type RouteContext = {
    params: Promise<{ id: string; roomId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const { id, roomId } = await context.params;

    try {
        const user = await getUserByParticipantId(id);
        if (!user) {
            return participantNotFoundResponse();
        }

        const items = await listDesiredItemsForMember(user.id, roomId);
        return NextResponse.json({ items });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to load wish list" },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request, context: RouteContext) {
    const { id, roomId } = await context.params;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = replaceDesiredItemsBodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 },
        );
    }

    try {
        const user = await getUserByParticipantId(id);
        if (!user) {
            return participantNotFoundResponse();
        }

        const items = await replaceDesiredItemsForMember(
            user.id,
            roomId,
            parsed.data.items,
        );
        return NextResponse.json({ items });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to save wish list" },
            { status: 500 },
        );
    }
}
