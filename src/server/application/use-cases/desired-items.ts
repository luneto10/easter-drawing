import {
    DESIRED_ITEM_MAX_LENGTH,
    DESIRED_ITEMS_MAX_COUNT,
} from "@/lib/desired-items-limits";
import { getRecipientForGiverInRoom } from "@/server/application/use-cases/users";
import type {
    DesiredItemDto,
    RoomMemberDesiredReportRow,
} from "@/types/desired-item";
import prisma from "../../../../lib/prisma";
import { DomainError } from "@/server/shared/errors/domain-error";
import { normalizeEntityId } from "@/server/shared/ids/normalize-entity-id";

export {
    DESIRED_ITEM_MAX_LENGTH,
    DESIRED_ITEMS_MAX_COUNT,
} from "@/lib/desired-items-limits";

function normalizeItemTexts(raw: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of raw) {
        const t = line.trim();
        if (!t) continue;
        if (t.length > DESIRED_ITEM_MAX_LENGTH) {
            throw new DomainError(
                `Each item must be at most ${DESIRED_ITEM_MAX_LENGTH} characters`,
            );
        }
        const key = t.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(t);
        if (out.length > DESIRED_ITEMS_MAX_COUNT) {
            throw new DomainError(
                `At most ${DESIRED_ITEMS_MAX_COUNT} items per person`,
            );
        }
    }
    return out;
}

export async function listDesiredItemsForMember(
    userId: string,
    roomId: string,
): Promise<DesiredItemDto[]> {
    const uid = normalizeEntityId(userId);
    const rid = normalizeEntityId(roomId);

    const membership = await prisma.userOnRoom.findUnique({
        where: { userId_roomId: { userId: uid, roomId: rid } },
    });
    if (!membership) {
        throw new DomainError("You are not a member of this room");
    }

    const rows = await prisma.desiredItem.findMany({
        where: { userId: uid, roomId: rid },
        orderBy: { sortOrder: "asc" },
    });

    return rows.map((r) => ({
        id: r.id,
        itemText: r.itemText,
        sortOrder: r.sortOrder,
    }));
}

export async function replaceDesiredItemsForMember(
    userId: string,
    roomId: string,
    itemTexts: string[],
): Promise<DesiredItemDto[]> {
    const uid = normalizeEntityId(userId);
    const rid = normalizeEntityId(roomId);
    const normalized = normalizeItemTexts(itemTexts);

    const membership = await prisma.userOnRoom.findUnique({
        where: { userId_roomId: { userId: uid, roomId: rid } },
    });
    if (!membership) {
        throw new DomainError("You are not a member of this room");
    }

    await prisma.$transaction(async (tx) => {
        await tx.desiredItem.deleteMany({
            where: { userId: uid, roomId: rid },
        });
        if (normalized.length === 0) return;
        await tx.desiredItem.createMany({
            data: normalized.map((itemText, i) => ({
                userId: uid,
                roomId: rid,
                itemText,
                sortOrder: i,
            })),
        });
    });

    return listDesiredItemsForMember(uid, rid);
}

export async function listDesiredItemsReportForRoom(
    roomId: string,
): Promise<RoomMemberDesiredReportRow[]> {
    const rid = normalizeEntityId(roomId);

    const room = await prisma.room.findUnique({
        where: { id: rid },
        select: { creatorId: true },
    });
    if (!room) {
        throw new DomainError("Room not found");
    }

    const rows = await prisma.userOnRoom.findMany({
        where: { roomId: rid },
        include: {
            user: true,
            desiredItems: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { user: { createdAt: "asc" } },
    });

    return rows.map((row) => ({
        userId: row.userId,
        name: row.user.name,
        email: row.user.email,
        isOrganizer: row.userId === room.creatorId,
        items: row.desiredItems.map((d) => d.itemText),
    }));
}

/**
 * Wish list for the giver’s assigned recipient in this room.
 * Same access rules as {@link getRecipientForGiverInRoom} (draw open, membership, assignment).
 */
export async function listRecipientDesiredItemsForGiver(
    giverId: string,
    roomId: string,
): Promise<{ recipientName: string; items: DesiredItemDto[] } | null> {
    const rid = normalizeEntityId(roomId);
    const resolved = await getRecipientForGiverInRoom(giverId, roomId);
    if (!resolved) return null;

    const rows = await prisma.desiredItem.findMany({
        where: { userId: resolved.recipient.id, roomId: rid },
        orderBy: { sortOrder: "asc" },
    });

    return {
        recipientName: resolved.recipient.name,
        items: rows.map((r) => ({
            id: r.id,
            itemText: r.itemText,
            sortOrder: r.sortOrder,
        })),
    };
}
