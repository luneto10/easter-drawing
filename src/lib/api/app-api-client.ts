import type {
    CreateRoomBody,
    CreateRoomResult,
    CreateUserBody,
    CreateUserResult,
    JoinRoomResult,
    LoginVerifyResult,
    MyDesiredItemsListResult,
    MyDesiredItemsReplaceResult,
    RecoverIdResult,
    RecipientAssignmentResult,
    RecipientDesiredItemsResult,
    WishlistReportResult,
} from "@/types/api-client";
import type { DesiredItemDto } from "@/types/desired-item";
import type { RevealResponse, UserRoomListItem } from "@/types/home";
import type { CreateUserResponse } from "@/types/join";
import type { RoomPublicMeta } from "@/types/room";

function isAbortError(e: unknown): boolean {
    return e instanceof DOMException && e.name === "AbortError";
}

/**
 * Browser-side API wrapper for this app’s JSON routes (and one CSV download).
 * Keeps URLs, encoding, and response parsing in one place.
 */
export class AppApiClient {
    static async listUserRooms(
        participantId: string,
    ): Promise<UserRoomListItem[]> {
        try {
            const res = await fetch(
                `/api/users/${encodeURIComponent(participantId)}/rooms`,
                { cache: "no-store" },
            );
            if (!res.ok) return [];
            const data = (await res.json()) as unknown;
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    static async getRoomPublicMeta(
        roomId: string,
        options?: { signal?: AbortSignal },
    ): Promise<RoomPublicMeta | null> {
        try {
            const res = await fetch(
                `/api/rooms/${encodeURIComponent(roomId)}`,
                { signal: options?.signal, cache: "no-store" },
            );
            if (!res.ok) return null;
            const data = (await res.json()) as {
                id?: string;
                title?: string;
                organizationName?: string;
                eventName?: string;
                drawEnabled?: boolean;
            };
            if (
                data &&
                typeof data.drawEnabled === "boolean" &&
                typeof data.organizationName === "string" &&
                typeof data.eventName === "string"
            ) {
                return {
                    id:
                        typeof data.id === "string" && data.id
                            ? data.id
                            : roomId,
                    title: String(data.title ?? ""),
                    organizationName: data.organizationName,
                    eventName: data.eventName,
                    drawEnabled: data.drawEnabled,
                };
            }
            return null;
        } catch (e) {
            if (isAbortError(e)) throw e;
            return null;
        }
    }

    /** `404` means account missing; other failures yield `error`. */
    static async getUserProfile(
        participantId: string,
        options?: { signal?: AbortSignal },
    ): Promise<"not_found" | "error" | { name: string }> {
        try {
            const res = await fetch(
                `/api/users/${encodeURIComponent(participantId)}`,
                { cache: "no-store", signal: options?.signal },
            );
            if (res.status === 404) return "not_found";
            if (!res.ok) return "error";
            const data = (await res.json()) as { name: string };
            return { name: data.name };
        } catch (e) {
            if (isAbortError(e)) throw e;
            return "error";
        }
    }

    static async getRecipientAssignment(
        giverParticipantId: string,
        roomId: string,
        options?: { signal?: AbortSignal },
    ): Promise<RecipientAssignmentResult> {
        try {
            const response = await fetch(
                `/api/users/${encodeURIComponent(giverParticipantId)}/recipient?roomId=${encodeURIComponent(roomId)}`,
                { method: "GET", cache: "no-store", signal: options?.signal },
            );
            const payload = (await response.json()) as
                | RevealResponse
                | { error?: string };

            if (!response.ok) {
                const message =
                    "error" in payload && payload.error
                        ? payload.error
                        : "We could not find a match for this ID.";
                return { ok: false, error: message };
            }
            return { ok: true, data: payload as RevealResponse };
        } catch (e) {
            if (isAbortError(e)) throw e;
            return {
                ok: false,
                error: "Something went wrong while loading your match.",
            };
        }
    }

    static async downloadWishlistReport(
        roomId: string,
        adminKey: string,
    ): Promise<WishlistReportResult> {
        try {
            const res = await fetch("/api/admin/room/desired-items-report", {
                headers: {
                    "x-room-id": roomId,
                    "x-admin-code": adminKey,
                },
            });
            if (!res.ok) {
                const payload = (await res.json().catch(() => ({}))) as {
                    error?: string;
                };
                return {
                    ok: false,
                    error:
                        typeof payload.error === "string"
                            ? payload.error
                            : "Could not download the wish list report.",
                };
            }
            const blob = await res.blob();
            const cd = res.headers.get("Content-Disposition");
            let filename = "wishlist-report.csv";
            const m = cd?.match(/filename="([^"]+)"/);
            if (m?.[1]) filename = m[1];
            return { ok: true, blob, filename };
        } catch {
            return {
                ok: false,
                error: "Could not download the wish list report.",
            };
        }
    }

    static async recoverParticipantId(email: string): Promise<RecoverIdResult> {
        try {
            const res = await fetch("/api/users/recover-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = (await res.json()) as {
                error?: string;
                message?: string;
            };
            if (!res.ok) {
                return {
                    ok: false,
                    error:
                        typeof data.error === "string"
                            ? data.error
                            : "Could not send the email.",
                };
            }
            return {
                ok: true,
                message:
                    typeof data.message === "string"
                        ? data.message
                        : undefined,
            };
        } catch {
            return { ok: false, error: "Could not send the email. Try again." };
        }
    }

    static async verifyParticipantForLogin(
        participantId: string,
    ): Promise<LoginVerifyResult> {
        try {
            const res = await fetch(
                `/api/users/${encodeURIComponent(participantId)}`,
                { cache: "no-store" },
            );
            const data = (await res.json()) as {
                error?: string;
                id?: string;
                name?: string;
            };
            if (!res.ok) {
                if (res.status === 404) {
                    return { ok: false, notFound: true };
                }
                return {
                    ok: false,
                    notFound: false,
                    error: data?.error ?? "Could not verify this ID.",
                };
            }
            return { ok: true, name: data.name ?? "" };
        } catch {
            return {
                ok: false,
                notFound: false,
                error: "Could not verify this ID. Try again.",
            };
        }
    }

    static async createRoom(body: CreateRoomBody): Promise<CreateRoomResult> {
        try {
            const res = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: body.title,
                    organizationName: body.organizationName,
                    eventName: body.eventName,
                    creatorUserId: body.creatorUserId,
                }),
            });
            const data = (await res.json()) as {
                error?: string;
                room?: { id: string; title: string };
            };
            if (!res.ok) {
                return {
                    ok: false,
                    error: data?.error ?? "Could not create room",
                };
            }
            const room = data.room;
            if (!room?.id) {
                return { ok: false, error: "Could not create room" };
            }
            return { ok: true, room };
        } catch {
            return { ok: false, error: "Could not create room" };
        }
    }

    static async joinRoom(
        userId: string,
        roomId: string,
    ): Promise<JoinRoomResult> {
        try {
            const res = await fetch("/api/rooms/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, roomId }),
            });
            const data = (await res.json()) as {
                error?: string;
                room?: { title?: string };
            };
            if (!res.ok) {
                return {
                    ok: false,
                    error: data?.error ?? "Could not join room",
                };
            }
            return { ok: true, room: data.room };
        } catch {
            return { ok: false, error: "Could not join room" };
        }
    }

    static async createUser(body: CreateUserBody): Promise<CreateUserResult> {
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: body.name,
                    email: body.email,
                }),
            });
            const payload = (await response.json()) as
                | CreateUserResponse
                | { error?: string };
            if (!response.ok) {
                const err = (payload as { error?: string }).error;
                return {
                    ok: false,
                    error:
                        typeof err === "string"
                            ? err
                            : "Failed to create account",
                };
            }
            return { ok: true, user: payload as CreateUserResponse };
        } catch {
            return { ok: false, error: "Failed to create account" };
        }
    }

    static async listRecipientDesiredItems(
        giverInternalId: string,
        roomId: string,
    ): Promise<RecipientDesiredItemsResult> {
        try {
            const res = await fetch(
                `/api/users/${encodeURIComponent(giverInternalId)}/recipient/desired-items?roomId=${encodeURIComponent(roomId)}`,
                { cache: "no-store" },
            );
            const data = (await res.json()) as {
                error?: string;
                recipientName?: string;
                items?: DesiredItemDto[];
            };
            if (!res.ok) {
                return {
                    ok: false,
                    error:
                        typeof data.error === "string"
                            ? data.error
                            : "Could not load their gift ideas.",
                };
            }
            const items = Array.isArray(data.items) ? data.items : [];
            return {
                ok: true,
                recipientName:
                    typeof data.recipientName === "string"
                        ? data.recipientName
                        : undefined,
                items,
            };
        } catch {
            return {
                ok: false,
                error: "Could not load their gift ideas.",
            };
        }
    }

    static async listMyDesiredItems(
        participantId: string,
        roomId: string,
    ): Promise<MyDesiredItemsListResult> {
        try {
            const res = await fetch(
                `/api/users/${encodeURIComponent(participantId)}/rooms/${encodeURIComponent(roomId)}/desired-items`,
                { cache: "no-store" },
            );
            const data = (await res.json()) as
                | { items: DesiredItemDto[]; error?: string }
                | { error?: string };
            if (!res.ok) {
                return {
                    ok: false,
                    error:
                        "error" in data && typeof data.error === "string"
                            ? data.error
                            : "Could not load your wish list.",
                };
            }
            const items =
                "items" in data && Array.isArray(data.items) ? data.items : [];
            return { ok: true, items };
        } catch {
            return {
                ok: false,
                error: "Could not load your wish list.",
            };
        }
    }

    static async replaceMyDesiredItems(
        participantId: string,
        roomId: string,
        items: string[],
    ): Promise<MyDesiredItemsReplaceResult> {
        try {
            const res = await fetch(
                `/api/users/${encodeURIComponent(participantId)}/rooms/${encodeURIComponent(roomId)}/desired-items`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items }),
                },
            );
            const data = (await res.json()) as { error?: string };
            if (!res.ok) {
                return {
                    ok: false,
                    error:
                        typeof data.error === "string"
                            ? data.error
                            : "Could not save your wish list.",
                };
            }
            return { ok: true };
        } catch {
            return {
                ok: false,
                error: "Could not save your wish list.",
            };
        }
    }
}
