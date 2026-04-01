import {
    getRecipientForGiver,
    getUserById,
} from "@/server/application/use-cases/users";
import { buildDrawEmailTemplate } from "@/server/application/services/draw-email-template";
import { sendEmail } from "@/server/infrastructure/adapters/email";
import { ensureAdminCode } from "@/server/infrastructure/config/admin-auth";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
    const unauthorized = ensureAdminCode(request);
    if (unauthorized) return unauthorized;

    const { id } = await context.params;

    try {
        const giver = await getUserById(id);
        if (!giver) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!giver.email) {
            return NextResponse.json(
                { error: "User does not have an email" },
                { status: 400 },
            );
        }

        const assignment = await getRecipientForGiver(id);
        const { subject, html } = buildDrawEmailTemplate({
            giverName: assignment?.giver.name ?? giver.name,
            giverId: assignment?.giver.id ?? giver.id,
            recipientName: assignment?.recipient.name,
            appUrl: process.env.APP_URL,
        });

        const sent = await sendEmail({
            to: giver.email,
            subject,
            html,
        });

        return NextResponse.json({
            ok: true,
            id: sent?.messageId,
        });
    } catch (error) {
        console.error(error);
        const message =
            error instanceof Error
                ? error.message
                : "Failed to send email";
        const isAuthError =
            message.toLowerCase().includes("invalid login") ||
            message.toLowerCase().includes("authentication");
        if (isAuthError) {
            return NextResponse.json(
                {
                    error: "Gmail authentication failed. Check GMAIL_USER and GMAIL_APP_PASSWORD.",
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: message || "Failed to send email" },
            { status: 500 },
        );
    }
}
