/** Row from GET /api/admin/users (mirrors server `RoomMemberListItem`). */
export type AdminUserRow = {
    id: string;
    name: string;
    email: string | null;
    recipientId: string | null;
    createdAt: string;
    isOrganizer?: boolean;
};
