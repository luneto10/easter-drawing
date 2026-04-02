"use client";

import { AdminUnlockCard } from "@/components/admin/admin-unlock-card";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { useAdminDashboard } from "@/components/admin/use-admin-dashboard";

export function AdminPageInner() {
    const { isUnlocked, unlock, dashboard } = useAdminDashboard();

    if (!isUnlocked) {
        return (
            <AdminUnlockCard
                roomId={unlock.roomId}
                adminCode={unlock.code}
                onRoomIdChange={unlock.setRoomId}
                onAdminCodeChange={unlock.setCode}
                onSubmit={unlock.onSubmit}
                error={unlock.error}
            />
        );
    }

    return <AdminDashboardView dashboard={dashboard} />;
}
