import type { User } from "@/server/domain/entities/user";

/** One row in a user list (e.g. public API). */
export type UserListItem = {
    id: string;
    name: string;
    email: string | null;
    createdAt: string;
};

export function toUserListItem(user: User): UserListItem {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
    };
}

/** Participant in a draw room (includes assignment for that room). */
export type RoomMemberListItem = {
    id: string;
    name: string;
    email: string | null;
    recipientId: string | null;
    createdAt: string;
};
