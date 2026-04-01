"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Copy, Menu } from "lucide-react";
import Link from "next/link";

type UserRow = {
    id: string;
    name: string;
    email: string | null;
    recipientId: string | null;
    createdAt: string;
};

function AdminPageInner() {
    const searchParams = useSearchParams();
    const [roomId, setRoomId] = useState("");
    const [code, setCode] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [addName, setAddName] = useState("");
    const [addEmail, setAddEmail] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingEmail, setEditingEmail] = useState("");
    const [roomTitleDisplay, setRoomTitleDisplay] = useState("");
    const [roomOrganizationDisplay, setRoomOrganizationDisplay] = useState("");
    const [roomEventDisplay, setRoomEventDisplay] = useState("");
    const [drawEnabled, setDrawEnabled] = useState<boolean | null>(null);
    const [joinUrlCopied, setJoinUrlCopied] = useState(false);

    const hasUsers = useMemo(() => users.length > 0, [users.length]);

    const joinRoomUrl = useMemo(() => {
        const id = roomId.trim();
        if (!id || typeof window === "undefined") return "";
        const origin = window.location.origin;
        return `${origin}/?room=${encodeURIComponent(id)}`;
    }, [roomId]);

    useEffect(() => {
        const r = searchParams.get("room")?.trim() ?? "";
        const k = searchParams.get("key")?.trim() ?? "";
        if (r) setRoomId(r);
        if (k) setCode(k);
    }, [searchParams]);

    /** Prefer form state; fall back to query string so the email link works before/without state sync. */
    function adminAuthHeaders(): { roomId: string; adminCode: string } {
        const r =
            roomId.trim() ||
            (searchParams.get("room")?.trim() ?? "");
        const k =
            code.trim() ||
            (searchParams.get("key")?.trim() ?? "");
        return { roomId: r, adminCode: k };
    }

    async function request(path: string, init?: RequestInit) {
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
    }

    async function loadUsers(): Promise<boolean> {
        setLoading(true);
        setError("");
        try {
            const response = await request("/api/admin/users");
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to load users");
                return false;
            }
            setUsers(payload as UserRow[]);
            return true;
        } catch {
            setError("Failed to load users");
            return false;
        } finally {
            setLoading(false);
        }
    }

    async function loadRoomMeta(): Promise<boolean> {
        try {
            const response = await request("/api/admin/room");
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to load room settings");
                setDrawEnabled(null);
                setRoomTitleDisplay("");
                setRoomOrganizationDisplay("");
                setRoomEventDisplay("");
                return false;
            }
            setRoomTitleDisplay(String(payload.title ?? ""));
            setRoomOrganizationDisplay(String(payload.organizationName ?? ""));
            setRoomEventDisplay(String(payload.eventName ?? ""));
            setDrawEnabled(payload.drawEnabled === true);
            return true;
        } catch {
            setError("Failed to load room settings");
            setDrawEnabled(null);
            setRoomTitleDisplay("");
            setRoomOrganizationDisplay("");
            setRoomEventDisplay("");
            return false;
        }
    }

    async function setDrawEnabledOnServer(next: boolean) {
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
            setDrawEnabled(next);
        } catch {
            setError("Failed to update draw setting");
        } finally {
            setLoading(false);
        }
    }

    async function unlock(e: FormEvent) {
        e.preventDefault();
        const { roomId: effectiveRoom, adminCode: effectiveCode } =
            adminAuthHeaders();

        if (!effectiveRoom) {
            setError("Open the admin link from your email — it includes the room.");
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
        const authDenied =
            "That room ID or admin code does not match our records. Use the full admin link from your email, or paste the room and code exactly.";

        try {
            const usersRes = await request("/api/admin/users");
            const usersPayload = await usersRes.json();
            if (!usersRes.ok) {
                setError(
                    usersRes.status === 401
                        ? authDenied
                        : (usersPayload?.error ?? "Failed to load users"),
                );
                setIsUnlocked(false);
                return;
            }
            setUsers(usersPayload as UserRow[]);

            const roomRes = await request("/api/admin/room");
            const roomPayload = await roomRes.json();
            if (!roomRes.ok) {
                setError(
                    roomRes.status === 401
                        ? authDenied
                        : (roomPayload?.error ?? "Failed to load room settings"),
                );
                setIsUnlocked(false);
                return;
            }
            setRoomTitleDisplay(String(roomPayload.title ?? ""));
            setRoomOrganizationDisplay(
                String(roomPayload.organizationName ?? ""),
            );
            setRoomEventDisplay(String(roomPayload.eventName ?? ""));
            setDrawEnabled(roomPayload.drawEnabled === true);
            setIsUnlocked(true);
        } catch {
            setError("Failed to unlock");
            setIsUnlocked(false);
        } finally {
            setLoading(false);
        }
    }

    async function addPerson(e: FormEvent) {
        e.preventDefault();
        if (!addName.trim()) return;

        setLoading(true);
        setError("");
        try {
            const response = await request("/api/admin/users", {
                method: "POST",
                body: JSON.stringify({
                    name: addName,
                    email: addEmail || undefined,
                }),
            });
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to add person");
                return;
            }
            setAddName("");
            setAddEmail("");
            await loadUsers();
        } catch {
            setError("Failed to add person");
        } finally {
            setLoading(false);
        }
    }

    async function saveName(id: string) {
        if (!editingName.trim()) return;

        setLoading(true);
        setError("");
        try {
            const response = await request(`/api/admin/users/${id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: editingName,
                    email: editingEmail,
                }),
            });
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to update name");
                return;
            }
            setEditingId(null);
            setEditingName("");
            setEditingEmail("");
            await loadUsers();
        } catch {
            setError("Failed to update name");
        } finally {
            setLoading(false);
        }
    }

    async function deletePerson(id: string) {
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
    }

    async function runDrawAgain() {
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
            setUsers(payload as UserRow[]);
        } catch {
            setError("Failed to run draw");
        } finally {
            setLoading(false);
        }
    }

    async function sendEmailForUser(id: string) {
        setLoading(true);
        setError("");
        try {
            const response = await request(`/api/admin/users/${id}/send-email`, {
                method: "POST",
            });
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
    }

    async function sendAllEmails() {
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
    }

    async function deleteAll() {
        if (
            !window.confirm(
                "Remove everyone from this room on the server? Accounts with no other rooms will be deleted.",
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
                setError(payload?.error ?? "Failed to delete all users");
                return;
            }
            await loadUsers();
        } catch {
            setError("Failed to delete all users");
        } finally {
            setLoading(false);
        }
    }

    if (!isUnlocked) {
        return (
            <main className="min-h-dvh w-full bg-zinc-50 text-zinc-900">
                <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-6">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Admin</CardTitle>
                            <CardDescription>
                                Enter the admin code from your room link. Room ID
                                can be filled automatically from the link.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={unlock} className="space-y-4">
                                <Input
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    placeholder="Room ID"
                                    autoComplete="off"
                                />
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Admin code (from link)"
                                    type="password"
                                    autoComplete="off"
                                />
                                <Button className="w-full" type="submit">
                                    Enter
                                </Button>
                                {error ? (
                                    <p className="text-sm text-red-500">{error}</p>
                                ) : null}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-dvh w-full bg-zinc-50 text-zinc-900">
            <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="icon-sm">
                            <Link href="/" aria-label="Back to menu">
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">
                            Admin —{" "}
                            {roomEventDisplay
                                ? roomEventDisplay
                                : "Gift exchange"}
                        </h1>
                        <Button variant="ghost" size="icon-sm" aria-label="Menu">
                            <Menu />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={async () => {
                                const ok = await loadUsers();
                                if (ok) await loadRoomMeta();
                            }}
                            variant="outline"
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                        <Button
                            onClick={runDrawAgain}
                            disabled={loading || !hasUsers}
                        >
                            Run Draw Again
                        </Button>
                        <Button
                            onClick={sendAllEmails}
                            variant="outline"
                            disabled={loading || !hasUsers}
                        >
                            Send All Email
                        </Button>
                        <Button
                            onClick={deleteAll}
                            variant="destructive"
                            disabled={loading || !hasUsers}
                        >
                            Delete All
                        </Button>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-mono text-zinc-500">Room: {roomId}</p>
                    {roomTitleDisplay ? (
                        <p className="text-sm text-zinc-700">{roomTitleDisplay}</p>
                    ) : null}
                    {roomOrganizationDisplay || roomEventDisplay ? (
                        <p className="text-sm text-zinc-600">
                            {roomOrganizationDisplay}
                            {roomOrganizationDisplay && roomEventDisplay ? " · " : null}
                            {roomEventDisplay}
                        </p>
                    ) : null}
                </div>

                <Card className="border-zinc-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Participant join link
                        </CardTitle>
                        <CardDescription>
                            Share this URL so people open the site with this room
                            already selected. They still sign in or create an account,
                            then can join from the home screen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                        <Input
                            readOnly
                            value={joinRoomUrl}
                            className="font-mono text-xs"
                            aria-label="Join URL for this room"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="shrink-0 sm:w-auto"
                            disabled={!joinRoomUrl}
                            onClick={() => {
                                if (!joinRoomUrl) return;
                                void navigator.clipboard.writeText(joinRoomUrl);
                                setJoinUrlCopied(true);
                                window.setTimeout(() => setJoinUrlCopied(false), 2000);
                            }}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            {joinUrlCopied ? "Copied" : "Copy link"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Exchange</CardTitle>
                        <CardDescription>
                            When the draw is closed, new people cannot join the room and
                            nobody can reveal their assignment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {drawEnabled === null ? (
                                <span className="text-sm text-zinc-500">
                                    Loading status…
                                </span>
                            ) : (
                                <Badge
                                    className={
                                        drawEnabled
                                            ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                            : "border border-red-200 bg-red-50 text-red-900"
                                    }
                                >
                                    <span
                                        className={`mr-2 inline-block h-2 w-2 rounded-full ${drawEnabled ? "bg-emerald-500" : "bg-red-500"}`}
                                        aria-hidden
                                    />
                                    {drawEnabled
                                        ? "Open — joins and reveals allowed"
                                        : "Closed — joins and reveals blocked"}
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                disabled={
                                    loading ||
                                    drawEnabled === null ||
                                    drawEnabled === true
                                }
                                onClick={() => void setDrawEnabledOnServer(true)}
                            >
                                Open draw
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={
                                    loading ||
                                    drawEnabled === null ||
                                    drawEnabled === false
                                }
                                onClick={() => void setDrawEnabledOnServer(false)}
                            >
                                Close draw
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <form
                    onSubmit={addPerson}
                    className="flex flex-col gap-2 sm:flex-row"
                >
                    <Input
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        placeholder="Add person name"
                    />
                    <Input
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        placeholder="Email (name@email.com)"
                    />
                    <Button type="submit" disabled={loading}>
                        Add person
                    </Button>
                </form>

                {error ? <p className="text-sm text-red-500">{error}</p> : null}

                <Card className="mx-auto w-full max-w-4xl">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Recipient ID</TableHead>
                                        <TableHead className="text-center">
                                            Status
                                        </TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => {
                                        const hasReferenceId = Boolean(
                                            user.recipientId,
                                        );
                                        const isEditing = editingId === user.id;
                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <Input
                                                                value={editingName}
                                                                onChange={(e) =>
                                                                    setEditingName(
                                                                        e.target.value,
                                                                    )
                                                                }
                                                            />
                                                            <Input
                                                                value={editingEmail}
                                                                onChange={(e) =>
                                                                    setEditingEmail(
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder="Email (name@email.com)"
                                                            />
                                                        </div>
                                                    ) : (
                                                        user.name
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {user.email ?? "-"}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {user.recipientId ?? "-"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        aria-label={
                                                            hasReferenceId
                                                                ? "recipient assigned"
                                                                : "recipient missing"
                                                        }
                                                        className={`mx-auto h-3 w-3 rounded-full p-0 ${
                                                            hasReferenceId
                                                                ? "bg-emerald-500"
                                                                : "bg-red-500"
                                                        }`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-2">
                                                        {isEditing ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        saveName(user.id)
                                                                    }
                                                                    disabled={loading}
                                                                >
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setEditingId(null);
                                                                        setEditingName("");
                                                                        setEditingEmail("");
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingId(user.id);
                                                                    setEditingName(user.name);
                                                                    setEditingEmail(
                                                                        user.email ?? "",
                                                                    );
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                sendEmailForUser(user.id)
                                                            }
                                                            disabled={
                                                                loading || !user.email
                                                            }
                                                        >
                                                            Send Email
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                deletePerson(user.id)
                                                            }
                                                            disabled={loading}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export default function AdminPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-dvh items-center justify-center bg-zinc-50 text-zinc-900">
                    Loading…
                </main>
            }
        >
            <AdminPageInner />
        </Suspense>
    );
}
