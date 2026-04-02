"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminUserRow } from "@/components/admin/admin-dashboard-types";
import { buildParticipantJoinUrl } from "@/components/admin/admin-join-url";
import {
    readRoomMetaFromPayload,
    type RoomMetaPayload,
} from "@/components/admin/admin-room-payload";

const AUTH_DENIED =
    "That room ID or admin code does not match our records. Use the full admin link from your email, or paste the room and code exactly.";

export function useAdminDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [roomId, setRoomId] = useState("");
    const [code, setCode] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [roomTitleDisplay, setRoomTitleDisplay] = useState("");
    const [roomOrganizationDisplay, setRoomOrganizationDisplay] = useState("");
    const [roomEventDisplay, setRoomEventDisplay] = useState("");
    const [drawEnabled, setDrawEnabled] = useState<boolean | null>(null);
    const [joinUrlCopied, setJoinUrlCopied] = useState(false);

    const hasUsers = useMemo(() => users.length > 0, [users.length]);
    const hasRemovableMembers = useMemo(
        () => users.some((u) => !u.isOrganizer),
        [users],
    );
    const joinRoomUrl = useMemo(
        () => buildParticipantJoinUrl(roomId),
        [roomId],
    );

    useEffect(() => {
        const r = searchParams.get("room")?.trim() ?? "";
        const k = searchParams.get("key")?.trim() ?? "";
        if (r) setRoomId(r);
        if (k) setCode(k);
    }, [searchParams]);

    const adminAuthHeaders = useCallback((): {
        roomId: string;
        adminCode: string;
    } => {
        const r =
            roomId.trim() ||
            (searchParams.get("room")?.trim() ?? "");
        const k =
            code.trim() ||
            (searchParams.get("key")?.trim() ?? "");
        return { roomId: r, adminCode: k };
    }, [roomId, code, searchParams]);

    const request = useCallback(
        async (path: string, init?: RequestInit) => {
            const { roomId: rid, adminCode } = adminAuthHeaders();
            return fetch(path, {
                ...init,
                headers: {
                    "Content-Type": "application/json",
                    "x-room-id": rid,
                    "x-admin-code": adminCode,
                    ...(init?.headers ?? {}),
                },
            });
        },
        [adminAuthHeaders],
    );

    const applyRoomPayload = useCallback((payload: RoomMetaPayload) => {
        const r = readRoomMetaFromPayload(payload);
        setRoomTitleDisplay(r.title);
        setRoomOrganizationDisplay(r.organizationName);
        setRoomEventDisplay(r.eventName);
        setDrawEnabled(r.drawEnabled);
    }, []);

    const clearRoomMeta = useCallback(() => {
        setDrawEnabled(null);
        setRoomTitleDisplay("");
        setRoomOrganizationDisplay("");
        setRoomEventDisplay("");
    }, []);

    const loadUsers = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        setError("");
        try {
            const response = await request("/api/admin/users");
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to load users");
                return false;
            }
            setUsers(payload as AdminUserRow[]);
            return true;
        } catch {
            setError("Failed to load users");
            return false;
        } finally {
            setLoading(false);
        }
    }, [request]);

    const loadRoomMeta = useCallback(async (): Promise<boolean> => {
        try {
            const response = await request("/api/admin/room");
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to load room settings");
                clearRoomMeta();
                return false;
            }
            applyRoomPayload(payload);
            return true;
        } catch {
            setError("Failed to load room settings");
            clearRoomMeta();
            return false;
        }
    }, [request, applyRoomPayload, clearRoomMeta]);

    const refreshUsersAndRoom = useCallback(async () => {
        const ok = await loadUsers();
        if (ok) await loadRoomMeta();
    }, [loadUsers, loadRoomMeta]);

    const setDrawEnabledOnServer = useCallback(
        async (next: boolean) => {
            setLoading(true);
            setError("");
            try {
                const response = await request("/api/admin/room", {
                    method: "PATCH",
                    body: JSON.stringify({ drawEnabled: next }),
                });
                const payload = await response.json();
                if (!response.ok) {
                    setError(payload?.error ?? "Failed to update draw setting");
                    return;
                }
                applyRoomPayload(payload);
            } catch {
                setError("Failed to update draw setting");
            } finally {
                setLoading(false);
            }
        },
        [request, applyRoomPayload],
    );

    const saveRoomDetails = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
                const response = await request("/api/admin/room", {
                    method: "PATCH",
                    body: JSON.stringify({
                        title: roomTitleDisplay,
                        organizationName: roomOrganizationDisplay,
                        eventName: roomEventDisplay,
                    }),
                });
                const payload = await response.json();
                if (!response.ok) {
                    setError(payload?.error ?? "Failed to save room details");
                    return;
                }
                applyRoomPayload(payload);
            } catch {
                setError("Failed to save room details");
            } finally {
                setLoading(false);
            }
        },
        [
            request,
            applyRoomPayload,
            roomTitleDisplay,
            roomOrganizationDisplay,
            roomEventDisplay,
        ],
    );

    const unlock = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            const { roomId: effectiveRoom, adminCode: effectiveCode } =
                adminAuthHeaders();

            if (!effectiveRoom) {
                setError(
                    "Open the admin link from your email — it includes the room.",
                );
                return;
            }
            if (!effectiveCode) {
                setError(
                    "Admin code is missing. Use the full link from your email (it includes the code after key=).",
                );
                return;
            }

            if (effectiveRoom !== roomId.trim()) setRoomId(effectiveRoom);
            if (effectiveCode !== code.trim()) setCode(effectiveCode);

            setLoading(true);
            setError("");

            try {
                const usersRes = await request("/api/admin/users");
                const usersPayload = await usersRes.json();
                if (!usersRes.ok) {
                    setError(
                        usersRes.status === 401
                            ? AUTH_DENIED
                            : (usersPayload?.error ?? "Failed to load users"),
                    );
                    setIsUnlocked(false);
                    return;
                }
                setUsers(usersPayload as AdminUserRow[]);

                const roomRes = await request("/api/admin/room");
                const roomPayload = await roomRes.json();
                if (!roomRes.ok) {
                    setError(
                        roomRes.status === 401
                            ? AUTH_DENIED
                            : (roomPayload?.error ??
                              "Failed to load room settings"),
                    );
                    setIsUnlocked(false);
                    return;
                }
                applyRoomPayload(roomPayload);
                setIsUnlocked(true);
            } catch {
                setError("Failed to unlock");
                setIsUnlocked(false);
            } finally {
                setLoading(false);
            }
        },
        [adminAuthHeaders, request, applyRoomPayload, roomId, code],
    );

    const deletePerson = useCallback(
        async (id: string) => {
            setLoading(true);
            setError("");
            try {
                const response = await request(`/api/admin/users/${id}`, {
                    method: "DELETE",
                });
                const payload = await response.json();
                if (!response.ok) {
                    setError(payload?.error ?? "Failed to delete user");
                    return;
                }
                await loadUsers();
            } catch {
                setError("Failed to delete user");
            } finally {
                setLoading(false);
            }
        },
        [request, loadUsers],
    );

    const runDrawAgain = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await request("/api/admin/draw", {
                method: "POST",
            });
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to run draw");
                return;
            }
            setUsers(payload as AdminUserRow[]);
        } catch {
            setError("Failed to run draw");
        } finally {
            setLoading(false);
        }
    }, [request]);

    const sendEmailForUser = useCallback(
        async (id: string) => {
            setLoading(true);
            setError("");
            try {
                const response = await request(
                    `/api/admin/users/${id}/send-email`,
                    { method: "POST" },
                );
                const payload = await response.json();
                if (!response.ok) {
                    setError(payload?.error ?? "Failed to send email");
                    return;
                }
            } catch {
                setError("Failed to send email");
            } finally {
                setLoading(false);
            }
        },
        [request],
    );

    const sendAllEmails = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await request("/api/admin/send-all-email", {
                method: "POST",
            });
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to send all emails");
                return;
            }
        } catch {
            setError("Failed to send all emails");
        } finally {
            setLoading(false);
        }
    }, [request]);

    const removeAllParticipants = useCallback(async () => {
        if (
            !window.confirm(
                "Remove all participants from this room except you (the organizer)? Their accounts stay; they only lose access to this room.",
            )
        )
            return;

        setLoading(true);
        setError("");
        try {
            const response = await request("/api/admin/users", {
                method: "DELETE",
            });
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to remove participants");
                return;
            }
            await loadUsers();
        } catch {
            setError("Failed to remove participants");
        } finally {
            setLoading(false);
        }
    }, [request, loadUsers]);

    const deleteRoomPermanently = useCallback(async () => {
        if (
            !window.confirm(
                "Permanently delete this room, all assignments, and remove every participant’s membership? Your organizer account stays, but this room and admin link will stop working.",
            )
        )
            return;

        setLoading(true);
        setError("");
        try {
            const response = await request("/api/admin/room", {
                method: "DELETE",
            });
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to delete room");
                return;
            }
            router.push("/");
        } catch {
            setError("Failed to delete room");
        } finally {
            setLoading(false);
        }
    }, [request, router]);

    const copyJoinLink = useCallback(() => {
        if (!joinRoomUrl) return;
        void navigator.clipboard.writeText(joinRoomUrl);
        setJoinUrlCopied(true);
        window.setTimeout(() => setJoinUrlCopied(false), 2000);
    }, [joinRoomUrl]);

    return {
        isUnlocked,
        unlock: {
            roomId,
            code,
            setRoomId,
            setCode,
            error,
            loading,
            onSubmit: unlock,
        },
        dashboard: {
            roomId,
            roomEventDisplay,
            roomTitleDisplay,
            roomOrganizationDisplay,
            setRoomTitleDisplay,
            setRoomOrganizationDisplay,
            setRoomEventDisplay,
            drawEnabled,
            joinRoomUrl,
            joinUrlCopied,
            users,
            loading,
            error,
            hasUsers,
            hasRemovableMembers,
            refreshUsersAndRoom,
            saveRoomDetails,
            setDrawEnabledOnServer,
            deletePerson,
            runDrawAgain,
            sendEmailForUser,
            sendAllEmails,
            removeAllParticipants,
            deleteRoomPermanently,
            copyJoinLink,
        },
    };
}

export type AdminDashboardVM = ReturnType<typeof useAdminDashboard>;
