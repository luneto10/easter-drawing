export type RoomPublicMeta = {
    id: string;
    title: string;
    organizationName: string;
    eventName: string;
    drawEnabled: boolean;
};

export type UserRoomSummary = RoomPublicMeta & {
    creatorId: string;
    isOrganizer: boolean;
    /** Only when the listed user is the room organizer (same as `creatorId`). */
    adminKey: string | null;
};
