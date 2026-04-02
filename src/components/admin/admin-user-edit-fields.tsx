"use client";

import { TextField } from "@/components/ui/text-field";

type Props = {
    name: string;
    email: string;
    onNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
};

/**
 * Stacked name + email for inline editing in the participants table.
 */
export function AdminUserEditFields({
    name,
    email,
    onNameChange,
    onEmailChange,
}: Props) {
    return (
        <div className="space-y-2">
            <TextField
                label="Name"
                labelClassName="sr-only"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
            />
            <TextField
                label="Email"
                labelClassName="sr-only"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Email (name@email.com)"
            />
        </div>
    );
}
