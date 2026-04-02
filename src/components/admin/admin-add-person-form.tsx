"use client";

import { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

type Props = {
    name: string;
    email: string;
    onNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
    loading?: boolean;
};

export function AdminAddPersonForm({
    name,
    email,
    onNameChange,
    onEmailChange,
    onSubmit,
    loading,
}: Props) {
    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col gap-2 sm:flex-row sm:items-start"
        >
            <TextField
                label="Name"
                labelClassName="sr-only"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Add person name"
                fieldClassName="min-w-0 flex-1"
            />
            <TextField
                label="Email"
                labelClassName="sr-only"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Email (name@email.com)"
                fieldClassName="min-w-0 flex-1"
            />
            <Button type="submit" disabled={loading} className="shrink-0">
                Add person
            </Button>
        </form>
    );
}
