import { randomBytes } from "node:crypto";
import prisma from "../../../../lib/prisma";
import type { RoomMemberListItem } from "@/server/application/dto/user-list-item";
import { DomainError } from "@/server/shared/errors/domain-error";
import { normalizeEntityId } from "@/server/shared/ids/normalize-entity-id";

function generateAdminKey(): string {
    return randomBytes(32).toString("hex");
}

export async function createRoom(
    creatorUserId: string,
    title: string,
    organizationName: string,
    eventName: string,
) {
    const trimmed = title.trim();
    if (!trimmed) {
        throw new DomainError("Room title is required");
    }

    const org = organizationName.trim();
    const event = eventName.trim();
    if (!org) {
        throw new DomainError("Organization name is required");
    }
    if (!event) {
        throw new DomainError("Event name is required");
    }

    const creatorId = normalizeEntityId(creatorUserId);
    const creator = await prisma.user.findUnique({
        where: { id: creatorId },
    });
    if (!creator) {
        throw new DomainError("User not found");
    }

    const adminKey = generateAdminKey();

    const room = await prisma.room.create({
        data: {
            title: trimmed,
            organizationName: org,
            eventName: event,
            adminKey,
            creatorId: creatorId,
            memberships: {
                create: { userId: creatorId },
            },
        },
    });

    return { room, adminKey };
}

export async function joinRoom(userId: string, roomId: string) {
    const uid = normalizeEntityId(userId);
    const rid = normalizeEntityId(roomId);

    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) {
        throw new DomainError("User not found");
    }

    const room = await prisma.room.findUnique({ where: { id: rid } });
    if (!room) {
        throw new DomainError("Room not found");
    }

    const alreadyMember = await prisma.userOnRoom.findUnique({
        where: { userId_roomId: { userId: uid, roomId: rid } },
    });

    if (!room.drawEnabled && !alreadyMember) {
        throw new DomainError(
            "Joining is closed for this room. The organizer has paused new participants.",
        );
    }

    await prisma.userOnRoom.upsert({
        where: {
            userId_roomId: { userId: uid, roomId: rid },
        },
        create: { userId: uid, roomId: rid },
        update: {},
    });

    return room;
}

/** Removes membership in this room; deletes the user if they have no other rooms. */
export async function removeMemberFromRoom(
    roomId: string,
    userId: string,
): Promise<boolean> {
    const rid = normalizeEntityId(roomId);
    const uid = normalizeEntityId(userId);
    const membership = await prisma.userOnRoom.findUnique({
        where: { userId_roomId: { userId: uid, roomId: rid } },
    });
    if (!membership) return false;

    const roomMeta = await prisma.room.findUnique({
        where: { id: rid },
        select: { creatorId: true },
    });
    if (roomMeta?.creatorId === uid) {
        throw new DomainError(
            "The organizer cannot be removed from this room.",
        );
    }

    await prisma.$transaction(async (tx) => {
        await tx.userOnRoom.updateMany({
            where: { roomId: rid, recipientId: uid },
            data: { recipientId: null },
        });

        const room = await tx.room.findUnique({
            where: { id: rid },
            select: { creatorId: true },
        });
        const memberCount = await tx.userOnRoom.count({
            where: { roomId: rid },
        });

        if (room && room.creatorId === uid && memberCount === 1) {
            await tx.room.delete({ where: { id: rid } });
        } else {
            if (room && room.creatorId === uid && memberCount > 1) {
                const next = await tx.userOnRoom.findFirst({
                    where: { roomId: rid, userId: { not: uid } },
                    orderBy: { userId: "asc" },
                    select: { userId: true },
                });
                if (next) {
                    await tx.room.update({
                        where: { id: rid },
                        data: { creatorId: next.userId },
                    });
                }
            }
            await tx.userOnRoom.delete({
                where: { userId_roomId: { userId: uid, roomId: rid } },
            });
        }

        const remaining = await tx.userOnRoom.count({ where: { userId: uid } });
        if (remaining === 0) {
            await tx.user
                .delete({
                    where: { id: uid },
                })
                .catch(() => undefined);
        }
    });

    return true;
}

export async function listRoomMembers(roomId: string): Promise<RoomMemberListItem[]> {
    const rid = normalizeEntityId(roomId);
    const rows = await prisma.userOnRoom.findMany({
        where: { roomId: rid },
        include: {
            user: true,
            room: { select: { creatorId: true } },
        },
        orderBy: { user: { createdAt: "asc" } },
    });

    return rows.map((row) => ({
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        recipientId: row.recipientId,
        createdAt: row.user.createdAt.toISOString(),
        isOrganizer: row.room.creatorId === row.userId,
    }));
}

/** Permanently delete the room and all memberships; organizer user row is kept. */
export async function deleteRoom(roomId: string): Promise<void> {
    const rid = normalizeEntityId(roomId);
    const room = await prisma.room.findUnique({
        where: { id: rid },
        select: { id: true, creatorId: true },
    });
    if (!room) {
        throw new DomainError("Room not found");
    }

    const memberRows = await prisma.userOnRoom.findMany({
        where: { roomId: rid },
        select: { userId: true },
    });
    const userIds = [...new Set(memberRows.map((m) => m.userId))];

    await prisma.room.delete({ where: { id: rid } });

    for (const userId of userIds) {
        if (userId === room.creatorId) continue;
        const remaining = await prisma.userOnRoom.count({ where: { userId } });
        if (remaining === 0) {
            await prisma.user
                .delete({ where: { id: userId } })
                .catch(() => undefined);
        }
    }
}

export type RoomPublicMeta = {
    id: string;
    title: string;
    organizationName: string;
    eventName: string;
    drawEnabled: boolean;
};

export type UserRoomSummary = RoomPublicMeta & {
    creatorId: string;
    /** Only when the listed user is the room organizer (same as `creatorId`). */
    adminKey: string | null;
};

export async function listRoomsForUser(userId: string): Promise<UserRoomSummary[]> {
    const uid = normalizeEntityId(userId);
    const rows = await prisma.userOnRoom.findMany({
        where: { userId: uid },
        include: { room: true },
        orderBy: [
            { room: { drawEnabled: "desc" } },
            { room: { title: "asc" } },
        ],
    });

    return rows.map((row) => ({
        id: row.room.id,
        title: row.room.title,
        organizationName: row.room.organizationName,
        eventName: row.room.eventName,
        drawEnabled: row.room.drawEnabled,
        creatorId: row.room.creatorId,
        adminKey: row.room.creatorId === uid ? row.room.adminKey : null,
    }));
}

export async function getRoomPublicMeta(roomId: string): Promise<RoomPublicMeta | null> {
    const rid = normalizeEntityId(roomId);
    const room = await prisma.room.findUnique({
        where: { id: rid },
        select: {
            id: true,
            title: true,
            organizationName: true,
            eventName: true,
            drawEnabled: true,
        },
    });
    if (!room) return null;
    return room;
}

export async function setRoomDrawEnabled(
    roomId: string,
    drawEnabled: boolean,
): Promise<void> {
    const rid = normalizeEntityId(roomId);
    const room = await prisma.room.findUnique({ where: { id: rid } });
    if (!room) {
        throw new DomainError("Room not found");
    }

    await prisma.room.update({
        where: { id: rid },
        data: { drawEnabled },
    });
}

/**
 * Partial update for room settings (organizer / admin key). At least one field required.
 */
export async function patchRoomSettings(
    roomId: string,
    patch: {
        drawEnabled?: boolean;
        title?: string;
        organizationName?: string;
        eventName?: string;
    },
): Promise<RoomPublicMeta> {
    const rid = normalizeEntityId(roomId);
    const room = await prisma.room.findUnique({ where: { id: rid } });
    if (!room) {
        throw new DomainError("Room not found");
    }

    const data: {
        drawEnabled?: boolean;
        title?: string;
        organizationName?: string;
        eventName?: string;
    } = {};

    if (patch.drawEnabled !== undefined) {
        data.drawEnabled = patch.drawEnabled;
    }
    if (patch.title !== undefined) {
        const t = patch.title.trim();
        if (!t) {
            throw new DomainError("Room title is required");
        }
        data.title = t;
    }
    if (patch.organizationName !== undefined) {
        const o = patch.organizationName.trim();
        if (!o) {
            throw new DomainError("Organization name is required");
        }
        data.organizationName = o;
    }
    if (patch.eventName !== undefined) {
        const e = patch.eventName.trim();
        if (!e) {
            throw new DomainError("Event name is required");
        }
        data.eventName = e;
    }

    if (Object.keys(data).length === 0) {
        throw new DomainError("No changes to apply");
    }

    const updated = await prisma.room.update({
        where: { id: rid },
        data,
        select: {
            id: true,
            title: true,
            organizationName: true,
            eventName: true,
            drawEnabled: true,
        },
    });

    return updated;
}
