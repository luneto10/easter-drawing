import { listRoomsForUser } from "@/server/application/use-cases/rooms";
import { getUserByParticipantId } from "@/server/application/use-cases/users";
import { NextResponse } from "next/server";
import { participantNotFoundResponse } from "@/server/shared/http/participant-not-found";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const { id } = await context.params;

    try {
        const user = await getUserByParticipantId(id);
        if (!user) {
            return participantNotFoundResponse();
        }

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
