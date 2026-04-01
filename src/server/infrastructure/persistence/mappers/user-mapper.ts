import type { Prisma } from "@/generated/prisma/client";
import { User } from "@/server/domain/entities/user";

export type UserRow = Pick<
    Prisma.UserGetPayload<object>,
    "id" | "name" | "email" | "recipientId" | "createdAt"
>;

export function userRowToDomain(row: UserRow): User {
    return User.reconstitute({
        id: row.id,
        name: row.name,
        email: row.email,
        recipientId: row.recipientId,
        createdAt: row.createdAt,
    });
}

/** Persisting a newly registered user. */
export function userToCreateInput(user: User): Prisma.UserUncheckedCreateInput {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
}
