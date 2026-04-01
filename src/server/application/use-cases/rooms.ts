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

    await prisma.$transaction(async (tx) => {
        await tx.userOnRoom.updateMany({
            where: { roomId: rid, recipientId: uid },
            data: { recipientId: null },
        });

        await tx.userOnRoom.delete({
            where: { userId_roomId: { userId: uid, roomId: rid } },
        });

        const remaining = await tx.userOnRoom.count({ where: { userId: uid } });
        if (remaining === 0) {
            await tx.room.updateMany({
                where: { creatorId: uid },
                data: { creatorId: null },
            });
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
        include: { user: true },
        orderBy: { user: { createdAt: "asc" } },
    });

    return rows.map((row) => ({
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        recipientId: row.recipientId,
        createdAt: row.user.createdAt.toISOString(),
    }));
}

export type UserRoomSummary = {
    id: string;
    title: string;
    organizationName: string;
    eventName: string;
    drawEnabled: boolean;
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
    }));
}

export async function getRoomPublicMeta(roomId: string): Promise<UserRoomSummary | null> {
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
