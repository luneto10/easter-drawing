import { Suspense } from "react";
import { HomeContent } from "@/components/home/home-content";

export default function Home() {
    return (
        <Suspense
            fallback={<div className="h-dvh bg-zinc-950 text-zinc-100 dark" />}
        >
            <HomeContent />
        </Suspense>
    );
}
