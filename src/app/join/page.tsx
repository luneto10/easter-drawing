"use client";

import { JoinPageView } from "@/components/join/join-page-view";
import { useJoinAccount } from "@/components/join/use-join-account";

export default function JoinPage() {
    const vm = useJoinAccount();
    return <JoinPageView vm={vm} />;
}
