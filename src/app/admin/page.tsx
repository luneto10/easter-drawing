"use client";

import { FormEvent, useMemo, useState } from "react";
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
import { ArrowLeft, Menu } from "lucide-react";
import Link from "next/link";

type UserRow = {
    id: string;
    name: string;
    email: string | null;
    recipientId: string | null;
    createdAt: string;
};

export default function AdminPage() {
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

    const hasUsers = useMemo(() => users.length > 0, [users.length]);

    async function request(path: string, init?: RequestInit) {
        return fetch(path, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                "x-admin-code": code,
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

    async function unlock(e: FormEvent) {
        e.preventDefault();
        if (!code.trim()) return;
        const ok = await loadUsers();
        setIsUnlocked(ok);
    }

    async function addPerson(e: FormEvent) {
        e.preventDefault();
        if (!addName.trim()) return;

        setLoading(true);
        setError("");
        try {
            const response = await request("/api/admin/users", {
                method: "POST",
                body: JSON.stringify({ name: addName, email: addEmail || undefined }),
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
                body: JSON.stringify({ name: editingName, email: editingEmail }),
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
            await loadUsers();
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
        if (!window.confirm("Delete all users? This cannot be undone.")) return;

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
                                Enter admin code to manage users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={unlock} className="space-y-4">
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Admin code"
                                    type="password"
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
                    <h1 className="text-2xl font-semibold">Admin - Easter Draw</h1>
                    <Button variant="ghost" size="icon-sm" aria-label="Menu">
                        <Menu />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={loadUsers}
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
                                    <TableHead>Reference ID</TableHead>
                                    <TableHead className="text-center">
                                        Status
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const hasReferenceId = Boolean(user.recipientId);
                                    const isEditing = editingId === user.id;
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <Input
                                                            value={editingName}
                                                            onChange={(e) =>
                                                                setEditingName(e.target.value)
                                                            }
                                                        />
                                                        <Input
                                                            value={editingEmail}
                                                            onChange={(e) =>
                                                                setEditingEmail(e.target.value)
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
                                                            ? "reference id present"
                                                            : "reference id missing"
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
                                                        disabled={loading || !user.email}
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
