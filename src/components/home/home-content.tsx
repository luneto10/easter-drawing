"use client";

import { AnimatePresence } from "motion/react";
import { Home as HomeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HomeIntroSection } from "@/components/home/home-intro-section";
import { HomeModals } from "@/components/home/home-modals";
import { HomeRevealBackButton } from "@/components/home/home-reveal-back-button";
import { HomeRevealSection } from "@/components/home/home-reveal-section";
import { useHomeContentModel } from "@/components/home/use-home-content-model";

export function HomeContent() {
    const m = useHomeContentModel();

    if (m.view === "boot") {
        return <div className="h-dvh bg-zinc-950 text-zinc-100 dark" />;
    }

    return (
        <div className="fixed inset-0 overflow-hidden bg-zinc-950 text-zinc-100 dark">
            <main className="relative mx-auto flex h-dvh w-full max-w-5xl items-center justify-center overflow-hidden px-6 py-6 sm:px-10 sm:py-10">
                <div className="absolute left-4 top-4 z-30 flex items-center gap-2 sm:left-6 sm:top-6">
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="rounded-full shadow-sm"
                        onClick={m.goHome}
                        aria-label="Home — open the main page"
                    >
                        <HomeIcon className="h-5 w-5" aria-hidden />
                    </Button>
                    <HomeRevealBackButton
                        embedded
                        show={m.showReveal}
                        screenKey={m.currentScreenKey}
                        isRouting={m.isRouting}
                        onBack={m.replaceUrlWithoutGiverId}
                    />
                </div>

                <HomeModals
                    modal={m.modal}
                    modalBusy={m.modalBusy}
                    modalError={m.modalError}
                    loginDraft={m.loginDraft}
                    recoverEmailDraft={m.recoverEmailDraft}
                    recoverBusy={m.recoverBusy}
                    recoverError={m.recoverError}
                    recoverSuccess={m.recoverSuccess}
                    createTitle={m.createTitle}
                    createOrganizationName={m.createOrganizationName}
                    createEventName={m.createEventName}
                    joinRoomId={m.joinRoomId}
                    onDismiss={() => {
                        m.setModal(null);
                        m.setRecoverError("");
                        m.setRecoverSuccess(null);
                    }}
                    onLoginDraftChange={m.setLoginDraft}
                    onRecoverEmailChange={(v) => {
                        m.setRecoverEmailDraft(v);
                        if (m.recoverError) m.setRecoverError("");
                        if (m.recoverSuccess) m.setRecoverSuccess(null);
                    }}
                    onSwitchToRecoverId={() => {
                        m.setModalError("");
                        m.setRecoverError("");
                        m.setRecoverSuccess(null);
                        m.setModal("recoverId");
                    }}
                    onSwitchToLogin={() => {
                        m.setRecoverError("");
                        m.setRecoverSuccess(null);
                        m.setModal("login");
                    }}
                    onCreateTitleChange={m.setCreateTitle}
                    onCreateOrganizationNameChange={m.setCreateOrganizationName}
                    onCreateEventNameChange={m.setCreateEventName}
                    onJoinRoomIdChange={m.setJoinRoomId}
                    onClearModalError={() => m.setModalError("")}
                    onSubmitLogin={m.submitLoginModal}
                    onSubmitRecoverId={m.submitRecoverIdModal}
                    onSubmitCreateRoom={m.submitCreateRoom}
                    onSubmitJoinRoom={m.submitJoinRoom}
                />

                <AnimatePresence mode="wait">
                    {m.view === "intro" ? (
                        <HomeIntroSection
                            savedUserId={m.savedUserId}
                            profileName={m.profileName}
                            profileLoading={m.profileLoading}
                            roomIdSummary={m.roomIdSummary}
                            roomTitle={m.roomTitle}
                            focusOrganizationName={m.introBranding.organizationName}
                            focusEventName={m.introBranding.eventName}
                            currentRoomDrawOpen={m.currentRoomDrawOpen}
                            error={m.error}
                            myRooms={m.myRooms}
                            myRoomsLoading={m.myRoomsLoading}
                            onLogout={m.logout}
                            onOpenLogin={() => {
                                m.setLoginDraft(m.savedUserId || m.inputValue);
                                m.setModalError("");
                                m.setModal("login");
                            }}
                            onOpenCreateRoom={() => {
                                m.setModalError("");
                                m.setModal("createRoom");
                            }}
                            onOpenJoinRoom={() => {
                                m.setJoinRoomId(m.roomInput);
                                m.setModalError("");
                                m.setModal("joinRoom");
                            }}
                            onSelectMyRoom={m.handleSelectMyRoom}
                            onClearRoomSelection={m.clearRoomSelection}
                            onRevealMyRoom={m.handleRevealMyRoom}
                            wishlistReportBusyRoomId={m.wishlistReportBusyRoomId}
                            onDownloadWishlistReport={
                                m.handleDownloadWishlistReport
                            }
                            onOpenRecoverId={() => {
                                m.setRecoverError("");
                                m.setRecoverSuccess(null);
                                m.setModal("recoverId");
                            }}
                        />
                    ) : (
                        <HomeRevealSection
                            view={m.view}
                            sectionKey={`reveal-${m.activeGiverId || m.queryGiverId || "empty"}`}
                            result={m.result}
                            error={m.error}
                            roomId={
                                (m.activeRoomId || m.queryRoomId || "").trim()
                            }
                            onGoBack={m.replaceUrlWithoutGiverId}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
