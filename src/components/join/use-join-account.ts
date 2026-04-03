"use client";

import { FormEvent, useCallback, useState } from "react";
import { STORAGE_KEY } from "@/components/home/home-motion";
import type { CreateUserResponse } from "@/types/join";
import { AppApiClient } from "@/lib/api/app-api-client";

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
            const outcome = await AppApiClient.createUser({
                name,
                email: email || undefined,
            });
            if (!outcome.ok) {
                setError(outcome.error);
                return;
            }
            const user: CreateUserResponse = outcome.user;
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
