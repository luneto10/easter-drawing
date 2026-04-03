"use client";

import { Suspense } from "react";

import { JoinPageView } from "@/components/join/join-page-view";
import { useJoinAccount } from "@/components/join/use-join-account";

function JoinPageInner() {
    const vm = useJoinAccount();
    return <JoinPageView vm={vm} />;
}

export default function JoinPage() {
    return (
        <Suspense
            fallback={
                <div className="fixed inset-0 bg-zinc-950 text-zinc-100 dark" />
            }
        >
            <JoinPageInner />
        </Suspense>
    );
}
