export type RevealResponse = {
    giver: { id: string; name: string };
    recipient: { id: string; name: string };
};

export type ViewState = "boot" | "intro" | "loading" | "result" | "error";

export type ModalState = null | "login" | "createRoom" | "joinRoom";

export type UserRoomListItem = {
    id: string;
    title: string;
    organizationName: string;
    eventName: string;
    drawEnabled: boolean;
    creatorId: string;
    /** Secret admin key; only present when you created this room. */
    adminKey: string | null;
};
