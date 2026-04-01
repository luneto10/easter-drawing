import prisma from "../../../../lib/prisma";
import { normalizeEntityId } from "@/server/shared/ids/normalize-entity-id";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

/** Validates room id + admin key (room’s secret). */
export async function ensureRoomAdmin(
    request: Request,
): Promise<
    | {
          roomId: string;
          title: string;
          organizationName: string;
          eventName: string;
      }
    | NextResponse
> {
    const roomId = normalizeEntityId(
        request.headers.get("x-room-id")?.trim() ?? "",
    );
    const adminKey = request.headers.get("x-admin-code")?.trim() ?? "";

    if (!roomId || !adminKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
            id: true,
            title: true,
            organizationName: true,
            eventName: true,
            adminKey: true,
        },
    });

    if (!room || !safeCompare(room.adminKey, adminKey)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return {
        roomId: room.id,
        title: room.title,
        organizationName: room.organizationName,
        eventName: room.eventName,
    };
}
