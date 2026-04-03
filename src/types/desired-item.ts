export type DesiredItemDto = {
    id: string;
    itemText: string;
    sortOrder: number;
};

export type RoomMemberDesiredReportRow = {
    userId: string;
    name: string;
    email: string | null;
    isOrganizer: boolean;
    items: string[];
};
