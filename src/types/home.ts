export type RevealResponse = {
    giver: { id: string; name: string };
    recipient: { id: string; name: string };
};

export type ViewState = "boot" | "intro" | "loading" | "result" | "error";

export type ModalState =
    | null
    | "login"
    | "recoverId"
    | "createRoom"
    | "joinRoom";

export type UserRoomListItem = {
    id: string;
    title: string;
    organizationName: string;
    eventName: string;
    drawEnabled: boolean;
    /** Internal DB id of the room creator (organizer). */
    creatorId: string;
    /** Whether the current logged-in participant is the organizer. */
    isOrganizer: boolean;
    /** Secret admin key; only present when you created this room. */
    adminKey: string | null;
};
