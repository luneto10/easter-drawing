/** Row from GET /api/admin/users (mirrors server `RoomMemberListItem`). */
export type AdminUserRow = {
    id: string;
    name: string;
    email: string | null;
    hasRecipientAssigned: boolean;
    createdAt: string;
    isOrganizer?: boolean;
};

export type RoomMetaPayload = {
    title?: unknown;
    organizationName?: unknown;
    eventName?: unknown;
    drawEnabled?: unknown;
};
