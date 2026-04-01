import { getRecipientForGiver } from "@/server/application/use-cases/users";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const { id } = await context.params;

    try {
        const result = await getRecipientForGiver(id);
        if (!result) {
            return NextResponse.json(
                { error: "Giver not found or recipient not assigned yet" },
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
        console.error(error);
        return NextResponse.json(
            { error: "Failed to load recipient" },
            { status: 500 },
        );
    }
}
