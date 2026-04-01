import { User } from "@/server/domain/entities/user";
import { DomainError } from "@/server/shared/errors/domain-error";
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
    const row = await prisma.user.findUnique({
        where: { id },
    });
    if (!row) return null;
    return userRowToDomain(row);
}

export async function createUser(name: string): Promise<User> {
    const user = User.register(name);
    const row = await prisma.user.create({
        data: {
            id: user.id,
            name: user.name,
        },
    });
    return userRowToDomain(row);
}

export async function updateUserName(id: string, name: string): Promise<User | null> {
    const normalizedName = name.trim();
    if (!normalizedName) {
        throw new DomainError("Name is required");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await prisma.user.update({
        where: { id },
        data: { name: normalizedName },
    });

    return userRowToDomain(row);
}

export async function deleteUserById(id: string): Promise<boolean> {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return false;

    await prisma.$transaction(async (tx) => {
        await tx.user.updateMany({
            where: { recipientId: id },
            data: { recipientId: null },
        });

        await tx.user.delete({
            where: { id },
        });
    });

    return true;
}

export async function deleteAllUsers(): Promise<void> {
    await prisma.user.updateMany({
        data: { recipientId: null },
    });

    await prisma.user.deleteMany();
}

function shuffleInPlace<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

export async function drawnUsers(): Promise<Record<string, User>> {
    const drawnUsersPrisma = await prisma.user.findMany();
    if (drawnUsersPrisma.length < 2) {
        throw new DomainError("Need at least two users to run a draw");
    }

    const drawnUsers: User[] = drawnUsersPrisma.map(userRowToDomain);

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

export async function assignUsers(): Promise<User[]> {
    const assignments = await drawnUsers();

    await prisma.$transaction(async (tx) => {
        await tx.user.updateMany({
            data: { recipientId: null },
        });
        await Promise.all(
            Object.entries(assignments).map(([giverId, receiver]) =>
                tx.user.update({
                    where: { id: giverId },
                    data: { recipientId: receiver.id },
                }),
            ),
        );
    });

    return listUsers();
}

export async function getRecipientForGiver(
    giverId: string,
): Promise<{ giver: User; recipient: User } | null> {
    const row = await prisma.user.findUnique({
        where: { id: giverId },
        include: { recipient: true },
    });

    if (!row || !row.recipient) return null;

    return {
        giver: userRowToDomain(row),
        recipient: userRowToDomain(row.recipient),
    };
}
