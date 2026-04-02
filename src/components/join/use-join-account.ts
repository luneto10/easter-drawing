"use client";

import { FormEvent, useCallback, useState } from "react";
import { STORAGE_KEY } from "@/components/home/home-motion";
import type { CreateUserResponse } from "@/components/join/join-types";

export function useJoinAccount() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [created, setCreated] = useState<CreateUserResponse | null>(null);

    const submit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setCreated(null);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email: email || undefined,
                }),
            });
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to create account");
                return;
            }
            const user = payload as CreateUserResponse;
            window.localStorage.setItem(STORAGE_KEY, user.id);
            setCreated(user);
            setName("");
            setEmail("");
        } catch {
            setError("Failed to create account");
        } finally {
            setLoading(false);
        }
    }, [name, email]);

    return {
        name,
        setName,
        email,
        setEmail,
        loading,
        error,
        created,
        submit,
    };
}

export type JoinAccountVM = ReturnType<typeof useJoinAccount>;
