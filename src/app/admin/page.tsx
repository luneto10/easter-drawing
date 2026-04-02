import { Suspense } from "react";
import { AdminPageInner } from "@/components/admin/admin-page-inner";

export default function AdminPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-dvh items-center justify-center bg-zinc-50 text-zinc-900">
                    Loading…
                </main>
            }
        >
            <AdminPageInner />
        </Suspense>
    );
}
