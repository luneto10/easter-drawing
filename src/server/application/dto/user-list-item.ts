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
        id: user.participantId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
    };
}

/** Participant in a draw room (assignment flag only — recipient user id is never exposed over the admin API). */
export type RoomMemberListItem = {
    id: string;
    name: string;
    email: string | null;
    hasRecipientAssigned: boolean;
    createdAt: string;
    /** Room creator (organizer); cannot be removed from this room via admin. */
    isOrganizer: boolean;
};
