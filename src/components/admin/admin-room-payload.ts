export type RoomMetaPayload = {
    title?: unknown;
    organizationName?: unknown;
    eventName?: unknown;
    drawEnabled?: unknown;
};

export function readRoomMetaFromPayload(payload: RoomMetaPayload): {
    title: string;
    organizationName: string;
    eventName: string;
    drawEnabled: boolean;
} {
    return {
        title: String(payload.title ?? ""),
        organizationName: String(payload.organizationName ?? ""),
        eventName: String(payload.eventName ?? ""),
        drawEnabled: payload.drawEnabled === true,
    };
}
