import { createRoom } from "@/server/application/use-cases/rooms";
import { getUserByParticipantId } from "@/server/application/use-cases/users";
import { buildRoomAdminEmailTemplate } from "@/server/application/services/room-admin-email-template";
import { sendEmail } from "@/server/infrastructure/adapters/email";
import { DomainError } from "@/server/shared/errors/domain-error";
import { normalizeEntityId } from "@/server/shared/ids/normalize-entity-id";
import { NextResponse } from "next/server";
import { z } from "zod";

const createRoomBodySchema = z.object({
    title: z.string().trim().min(1).max(200),
    organizationName: z.string().trim().min(1).max(120),
    eventName: z.string().trim().min(1).max(120),
    creatorUserId: z
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

    const parsed = createRoomBodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 },
        );
    }

    const creator = await getUserByParticipantId(parsed.data.creatorUserId);
    if (!creator?.email) {
        return NextResponse.json(
            {
                error: "Add an email to your account before creating a room (needed to send the admin link).",
            },
            { status: 400 },
        );
    }

    try {
        const { room, adminKey } = await createRoom(
            creator.id,
            parsed.data.title,
            parsed.data.organizationName,
            parsed.data.eventName,
        );

        const appUrl = process.env.APP_URL ?? "";
        const adminUrl = `${appUrl.replace(/\/$/, "")}/admin?room=${encodeURIComponent(room.id)}&key=${encodeURIComponent(adminKey)}`;

        const { subject, html } = buildRoomAdminEmailTemplate({
            roomTitle: room.title,
            organizationName: room.organizationName,
            eventName: room.eventName,
            adminUrl,
        });

        await sendEmail({
            to: creator.email,
            subject,
            html,
        });

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
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        const message =
            error instanceof Error ? error.message : "Failed to create room";
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
            { error: message || "Failed to create room" },
            { status: 500 },
        );
    }
}
