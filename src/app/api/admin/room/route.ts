import prisma from "../../../../../lib/prisma";
import { patchRoomSettings } from "@/server/application/use-cases/rooms";
import { ensureRoomAdmin } from "@/server/infrastructure/config/room-admin-auth";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchBodySchema = z
    .object({
        drawEnabled: z.boolean().optional(),
        title: z.string().trim().min(1).max(200).optional(),
        organizationName: z.string().trim().min(1).max(120).optional(),
        eventName: z.string().trim().min(1).max(120).optional(),
    })
    .refine(
        (d) =>
            d.drawEnabled !== undefined ||
            d.title !== undefined ||
            d.organizationName !== undefined ||
            d.eventName !== undefined,
        { message: "At least one field is required" },
    );

export async function GET(request: Request) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    try {
        const room = await prisma.room.findUnique({
            where: { id: auth.roomId },
            select: {
                id: true,
                title: true,
                organizationName: true,
                eventName: true,
                drawEnabled: true,
            },
        });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
        return NextResponse.json(room);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to load room" },
            { status: 500 },
        );
    }
}

export async function PATCH(request: Request) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = patchBodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 },
        );
    }

    try {
        const room = await patchRoomSettings(auth.roomId, {
            drawEnabled: parsed.data.drawEnabled,
            title: parsed.data.title,
            organizationName: parsed.data.organizationName,
            eventName: parsed.data.eventName,
        });
        return NextResponse.json({
            ok: true,
            id: room.id,
            title: room.title,
            organizationName: room.organizationName,
            eventName: room.eventName,
            drawEnabled: room.drawEnabled,
        });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to update room" },
            { status: 500 },
        );
    }
}
