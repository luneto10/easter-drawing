"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { STORAGE_KEY } from "@/components/home/home-motion";
import { normalizeClientUuid } from "@/components/home/home-uuid";
import type { CreateUserResponse } from "@/types/join";
import { AppApiClient } from "@/lib/api/app-api-client";
import { homePageHref } from "@/lib/app-nav-links";

export function useJoinAccount() {
    const searchParams = useSearchParams();
    const inviteRoomId = useMemo(() => {
        const r = (searchParams.get("room") ?? "").trim();
        return r ? normalizeClientUuid(r) : "";
    }, [searchParams]);

    const homeAfterCreateHref = useMemo(
        () => homePageHref(inviteRoomId),
        [inviteRoomId],
    );

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [postCreateJoinError, setPostCreateJoinError] = useState<
        string | null
    >(null);
    const [created, setCreated] = useState<CreateUserResponse | null>(null);

    const submit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setLoading(true);
            setError("");
            setPostCreateJoinError(null);
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

                if (inviteRoomId) {
                    const joinOutcome = await AppApiClient.joinRoom(
                        user.id,
                        inviteRoomId,
                    );
                    if (!joinOutcome.ok) {
                        setPostCreateJoinError(joinOutcome.error);
                    }
                }

                setCreated(user);
                setName("");
                setEmail("");
            } catch {
                setError("Failed to create account");
            } finally {
                setLoading(false);
            }
        },
        [name, email, inviteRoomId],
    );

    return {
        name,
        setName,
        email,
        setEmail,
        loading,
        error,
        postCreateJoinError,
        created,
        inviteRoomId,
        homeAfterCreateHref,
        submit,
    };
}

export type JoinAccountVM = ReturnType<typeof useJoinAccount>;
