import type { User } from "@/server/domain/entities/user";

/** One row in a user list (e.g. API / UI). */
export type UserListItem = {
    id: string;
    name: string;
    recipientId: string | null;
    createdAt: string;
};

export function toUserListItem(user: User): UserListItem {
    return {
        id: user.id,
        name: user.name,
        recipientId: user.recipientId,
        createdAt: user.createdAt.toISOString(),
    };
}
