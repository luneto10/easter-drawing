"use client";

import { AdminUserEditFields } from "@/components/admin/admin-user-edit-fields";
import type { AdminUserRow } from "@/components/admin/admin-dashboard-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Props = {
    users: AdminUserRow[];
    loading: boolean;
    editingId: string | null;
    editingName: string;
    editingEmail: string;
    onEditingNameChange: (v: string) => void;
    onEditingEmailChange: (v: string) => void;
    onStartEdit: (user: AdminUserRow) => void;
    onCancelEdit: () => void;
    onSaveEdit: (userId: string) => void;
    onSendEmail: (userId: string) => void;
    onDelete: (userId: string) => void;
};

export function AdminParticipantsTable({
    users,
    loading,
    editingId,
    editingName,
    editingEmail,
    onEditingNameChange,
    onEditingEmailChange,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onSendEmail,
    onDelete,
}: Props) {
    return (
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
                                const hasReferenceId = Boolean(user.recipientId);
                                const isEditing = editingId === user.id;
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            {isEditing ? (
                                                <AdminUserEditFields
                                                    name={editingName}
                                                    email={editingEmail}
                                                    onNameChange={
                                                        onEditingNameChange
                                                    }
                                                    onEmailChange={
                                                        onEditingEmailChange
                                                    }
                                                />
                                            ) : (
                                                <span className="inline-flex flex-wrap items-center gap-2">
                                                    {user.name}
                                                    {user.isOrganizer ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="font-normal"
                                                        >
                                                            Organizer
                                                        </Badge>
                                                    ) : null}
                                                </span>
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
                                                                onSaveEdit(
                                                                    user.id,
                                                                )
                                                            }
                                                            disabled={loading}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={
                                                                onCancelEdit
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            onStartEdit(user)
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        onSendEmail(user.id)
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
                                                        onDelete(user.id)
                                                    }
                                                    disabled={
                                                        loading ||
                                                        user.isOrganizer
                                                    }
                                                    title={
                                                        user.isOrganizer
                                                            ? "Organizer cannot be removed"
                                                            : "Remove from this room"
                                                    }
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
    );
}
