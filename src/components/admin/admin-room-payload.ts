import type { RoomMetaPayload } from "@/types/admin";

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
