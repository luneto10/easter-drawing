import { listRoomMembers } from "@/server/application/use-cases/rooms";
import { getRecipientForGiverInRoom } from "@/server/application/use-cases/users";
import { getUserById } from "@/server/application/use-cases/users";
import { buildDrawEmailTemplate } from "@/server/application/services/draw-email-template";
import { sendEmail } from "@/server/infrastructure/adapters/email";
import { ensureRoomAdmin } from "@/server/infrastructure/config/room-admin-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    try {
        const members = await listRoomMembers(auth.roomId);
        const withEmail = members.filter((m) => Boolean(m.email));

        const appUrl = process.env.APP_URL ?? "";

        const results = await Promise.allSettled(
            withEmail.map(async (giver) => {
                const assignment = await getRecipientForGiverInRoom(
                    giver.id,
                    auth.roomId,
                );

                // Email links must contain the public login id (`participantId`).
                // `listRoomMembers()` intentionally does not expose it.
                const giverParticipantId =
                    assignment?.giver.participantId ??
                    (await getUserById(giver.id))?.participantId ??
                    giver.id;

                const { subject, html } = buildDrawEmailTemplate({
                    giverName: assignment?.giver.name ?? giver.name,
                    giverId: giverParticipantId,
                    recipientName: assignment?.recipient?.name,
                    roomId: auth.roomId,
                    organizationName: auth.organizationName,
                    eventName: auth.eventName,
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
