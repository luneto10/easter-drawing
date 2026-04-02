"use client";

import { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";

type Props = {
    roomId: string;
    adminCode: string;
    onRoomIdChange: (value: string) => void;
    onAdminCodeChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
    error: string;
};

export function AdminUnlockCard({
    roomId,
    adminCode,
    onRoomIdChange,
    onAdminCodeChange,
    onSubmit,
    error,
}: Props) {
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
                        <form onSubmit={onSubmit} className="space-y-4">
                            <TextField
                                label="Room ID"
                                value={roomId}
                                onChange={(e) => onRoomIdChange(e.target.value)}
                                placeholder="Room ID"
                                autoComplete="off"
                            />
                            <TextField
                                label="Admin code"
                                value={adminCode}
                                onChange={(e) =>
                                    onAdminCodeChange(e.target.value)
                                }
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
