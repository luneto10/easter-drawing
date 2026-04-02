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

export type AdminRoomDetailsCardProps = {
    title: string;
    organizationName: string;
    eventName: string;
    onTitleChange: (value: string) => void;
    onOrganizationChange: (value: string) => void;
    onEventChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
    loading?: boolean;
};

export function AdminRoomDetailsCard({
    title,
    organizationName,
    eventName,
    onTitleChange,
    onOrganizationChange,
    onEventChange,
    onSubmit,
    loading,
}: AdminRoomDetailsCardProps) {
    return (
        <Card className="border-zinc-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Room details</CardTitle>
                <CardDescription>
                    You are the organizer for this room (creator). These names
                    appear on the home page for everyone in the exchange.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={onSubmit}
                    className="grid max-w-xl gap-4"
                >
                    <TextField
                        label="Room title"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="e.g. BRASA Secret Santa"
                        autoComplete="off"
                    />
                    <TextField
                        label="Organization"
                        value={organizationName}
                        onChange={(e) =>
                            onOrganizationChange(e.target.value)
                        }
                        placeholder="e.g. BRASA at UNL"
                        autoComplete="organization"
                    />
                    <TextField
                        label="Event name"
                        value={eventName}
                        onChange={(e) => onEventChange(e.target.value)}
                        placeholder="e.g. Easter gift exchange"
                        autoComplete="off"
                    />
                    <Button type="submit" disabled={loading}>
                        Save room details
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
