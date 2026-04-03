"use client";

import { AdminExchangeCard } from "@/components/admin/admin-exchange-card";
import { AdminHeaderToolbar } from "@/components/admin/admin-header-toolbar";
import { AdminJoinLinkCard } from "@/components/admin/admin-join-link-card";
import { AdminParticipantsTable } from "@/components/admin/admin-participants-table";
import { AdminRoomDetailsCard } from "@/components/admin/admin-room-details-card";
import type { AdminDashboardVM } from "@/components/admin/use-admin-dashboard";

type Dashboard = AdminDashboardVM["dashboard"];

type Props = {
    dashboard: Dashboard;
};

export function AdminDashboardView({ dashboard: d }: Props) {
    return (
        <main className="min-h-dvh w-full bg-zinc-50 text-zinc-900">
            <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
                <AdminHeaderToolbar
                    roomEventDisplay={d.roomEventDisplay}
                    loading={d.loading}
                    hasUsers={d.hasUsers}
                    hasRemovableMembers={d.hasRemovableMembers}
                    wishlistReportBusy={d.wishlistReportBusy}
                    onRefresh={d.refreshUsersAndRoom}
                    onRunDraw={d.runDrawAgain}
                    onSendAllEmails={d.sendAllEmails}
                    onDownloadWishlistReport={() =>
                        void d.downloadWishlistReport()
                    }
                    onRemoveAllParticipants={d.removeAllParticipants}
                    onDeleteRoom={d.deleteRoomPermanently}
                />

                <p className="text-xs font-mono text-zinc-500">Room: {d.roomId}</p>

                <AdminRoomDetailsCard
                    title={d.roomTitleDisplay}
                    organizationName={d.roomOrganizationDisplay}
                    eventName={d.roomEventDisplay}
                    onTitleChange={d.setRoomTitleDisplay}
                    onOrganizationChange={d.setRoomOrganizationDisplay}
                    onEventChange={d.setRoomEventDisplay}
                    onSubmit={d.saveRoomDetails}
                    loading={d.loading}
                />

                <AdminJoinLinkCard
                    joinRoomUrl={d.joinRoomUrl}
                    joinUrlCopied={d.joinUrlCopied}
                    onCopy={d.copyJoinLink}
                />

                <AdminExchangeCard
                    drawEnabled={d.drawEnabled}
                    loading={d.loading}
                    onOpenDraw={() => void d.setDrawEnabledOnServer(true)}
                    onCloseDraw={() => void d.setDrawEnabledOnServer(false)}
                />

                {d.error ? (
                    <p className="text-sm text-red-500">{d.error}</p>
                ) : null}

                <AdminParticipantsTable
                    users={d.users}
                    loading={d.loading}
                    onSendEmail={(id) => void d.sendEmailForUser(id)}
                    onDelete={(id) => void d.deletePerson(id)}
                />
            </div>
        </main>
    );
}
