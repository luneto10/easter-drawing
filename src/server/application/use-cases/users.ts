import { User } from "@/server/domain/entities/user";
import { DomainError } from "@/server/shared/errors/domain-error";
import { normalizeEntityId } from "@/server/shared/ids/normalize-entity-id";
import prisma from "../../../../lib/prisma";
import {
    userRowToDomain,
    userToCreateInput,
} from "@/server/infrastructure/persistence/mappers/user-mapper";

export async function listUsers(): Promise<User[]> {
    const rows = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => userRowToDomain(row));
}

export async function getUserById(id: string): Promise<User | null> {
    const uid = normalizeEntityId(id);
    const row = await prisma.user.findUnique({
        where: { id: uid },
    });
    if (!row) return null;
    return userRowToDomain(row);
}

export async function createUser(
    name: string,
    email?: string | null,
): Promise<User> {
    const user = User.register(name, email);
    const row = await prisma.user.create({
        data: userToCreateInput(user),
    });
    return userRowToDomain(row);
}

export async function deleteUserById(id: string): Promise<boolean> {
    const uid = normalizeEntityId(id);
    const existing = await prisma.user.findUnique({ where: { id: uid } });
    if (!existing) return false;

    await prisma.$transaction(async (tx) => {
        await tx.userOnRoom.updateMany({
            where: { recipientId: uid },
            data: { recipientId: null },
        });

        const memberships = await tx.userOnRoom.findMany({
            where: { userId: uid },
            select: { roomId: true },
        });

        for (const m of memberships) {
            const rid = m.roomId;
            const room = await tx.room.findUnique({
                where: { id: rid },
                select: { creatorId: true },
            });
            if (!room) continue;

            const count = await tx.userOnRoom.count({
                where: { roomId: rid },
            });

            if (room.creatorId === uid) {
                if (count === 1) {
                    await tx.room.delete({ where: { id: rid } });
                    continue;
                }
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

        await tx.user.delete({
            where: { id: uid },
        });
    });

    return true;
}

/** Remove every member except the room organizer. User rows are kept (only room links are removed). */
export async function removeAllMembersExceptCreator(roomId: string): Promise<void> {
    const rid = normalizeEntityId(roomId);
    const room = await prisma.room.findUnique({
        where: { id: rid },
        select: { creatorId: true },
    });
    if (!room) {
        throw new DomainError("Room not found");
    }

    const creatorId = room.creatorId;
    const memberRows = await prisma.userOnRoom.findMany({
        where: { roomId: rid },
        select: { userId: true },
    });
    const toRemove = [
        ...new Set(memberRows.map((m) => m.userId)),
    ].filter((id) => id !== creatorId);

    if (toRemove.length === 0) {
        return;
    }

    await prisma.$transaction(async (tx) => {
        for (const uid of toRemove) {
            await tx.userOnRoom.updateMany({
                where: { roomId: rid, recipientId: uid },
                data: { recipientId: null },
            });
        }

        await tx.userOnRoom.deleteMany({
            where: { roomId: rid, userId: { in: toRemove } },
        });

        const remainingInRoom = await tx.userOnRoom.findMany({
            where: { roomId: rid },
            select: { userId: true, recipientId: true },
        });
        const validIds = new Set(remainingInRoom.map((r) => r.userId));
        for (const row of remainingInRoom) {
            if (row.recipientId && !validIds.has(row.recipientId)) {
                await tx.userOnRoom.update({
                    where: {
                        userId_roomId: {
                            userId: row.userId,
                            roomId: rid,
                        },
                    },
                    data: { recipientId: null },
                });
            }
        }
    });
}

function shuffleInPlace<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

export async function drawnUsersInRoom(
    roomId: string,
): Promise<Record<string, User>> {
    const rid = normalizeEntityId(roomId);
    const memberships = await prisma.userOnRoom.findMany({
        where: { roomId: rid },
        include: { user: true },
        orderBy: { userId: "asc" },
    });

    if (memberships.length < 2) {
        throw new DomainError(
            "Need at least two people in the room to run a draw",
        );
    }

    const drawnUsers: User[] = memberships.map((m) => userRowToDomain(m.user));

    const shuffled = [...drawnUsers];
    shuffleInPlace(shuffled);

    for (let i = 0; i < drawnUsers.length; i++) {
        if (drawnUsers[i].id === shuffled[i].id) {
            const swapWith = (i + 1) % drawnUsers.length;
            const tmp = shuffled[i];
            shuffled[i] = shuffled[swapWith];
            shuffled[swapWith] = tmp;
        }
    }

    const assignments: Record<string, User> = {};

    for (let i = 0; i < drawnUsers.length; i++) {
        const giver = drawnUsers[i];
        const receiver = shuffled[i];
        assignments[giver.id] = receiver;
    }

    return assignments;
}

export async function assignUsersInRoom(roomId: string): Promise<void> {
    const rid = normalizeEntityId(roomId);
    const assignments = await drawnUsersInRoom(rid);

    await prisma.$transaction(async (tx) => {
        await tx.userOnRoom.updateMany({
            where: { roomId: rid },
            data: { recipientId: null },
        });
        await Promise.all(
            Object.entries(assignments).map(([giverId, receiver]) =>
                tx.userOnRoom.update({
                    where: {
                        userId_roomId: { userId: giverId, roomId: rid },
                    },
                    data: { recipientId: receiver.id },
                }),
            ),
        );
    });
}

/**
 * Recipient reveal for a giver in a room.
 * Returns null when the giver is in the room but has no assignment yet (draw not run).
 */
export async function getRecipientForGiverInRoom(
    giverId: string,
    roomId: string,
): Promise<{ giver: User; recipient: User } | null> {
    const gid = normalizeEntityId(giverId);
    const rid = normalizeEntityId(roomId);

    const room = await prisma.room.findUnique({
        where: { id: rid },
        select: { drawEnabled: true },
    });
    if (!room) {
        throw new DomainError(
            "Room not found. Check the room ID in the link — it must match exactly.",
        );
    }
    if (!room.drawEnabled) {
        throw new DomainError("Draw is closed for this room.");
    }

    const row = await prisma.userOnRoom.findUnique({
        where: {
            userId_roomId: { userId: gid, roomId: rid },
        },
        include: {
            user: true,
            recipient: true,
        },
    });

    if (!row) {
        throw new DomainError(
            "You are not in this room yet. Join the room from the home page, then try again.",
        );
    }
    if (!row.recipient) {
        return null;
    }

    return {
        giver: userRowToDomain(row.user),
        recipient: userRowToDomain(row.recipient),
    };
}
