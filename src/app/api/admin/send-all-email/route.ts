import {
    getRecipientForGiver,
    listUsers,
} from "@/server/application/use-cases/users";
import { buildDrawEmailTemplate } from "@/server/application/services/draw-email-template";
import { sendEmail } from "@/server/infrastructure/adapters/email";
import { ensureAdminCode } from "@/server/infrastructure/config/admin-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const unauthorized = ensureAdminCode(request);
    if (unauthorized) return unauthorized;

    try {
        const users = await listUsers();
        const withEmail = users.filter((user) => Boolean(user.email));

        const appUrl = process.env.APP_URL ?? "";

        const results = await Promise.allSettled(
            withEmail.map(async (giver) => {
                const assignment = await getRecipientForGiver(giver.id);
                const { subject, html } = buildDrawEmailTemplate({
                    giverName: assignment?.giver.name ?? giver.name,
                    giverId: assignment?.giver.id ?? giver.id,
                    recipientName: assignment?.recipient.name,
                    appUrl,
                });

                await sendEmail({
                    to: giver.email!,
                    subject,
                    html,
                });
                return giver.id;
            }),
        );

        const sent = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return NextResponse.json({
            ok: true,
            totalWithEmail: withEmail.length,
            sent,
            failed,
        });
    } catch (error) {
        console.error(error);
        const message =
            error instanceof Error
                ? error.message
                : "Failed to send all emails";
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
            { error: message || "Failed to send all emails" },
            { status: 500 },
        );
    }
}
