"use client";

import type { FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ModalState } from "@/types/home";
import { screenTransition } from "@/components/home/home-motion";

type Props = {
    modal: ModalState;
    modalBusy: boolean;
    modalError: string;
    loginDraft: string;
    recoverEmailDraft: string;
    recoverBusy: boolean;
    recoverError: string;
    recoverSuccess: string | null;
    createTitle: string;
    createOrganizationName: string;
    createEventName: string;
    joinRoomId: string;
    onDismiss: () => void;
    onLoginDraftChange: (value: string) => void;
    onRecoverEmailChange: (value: string) => void;
    onSwitchToRecoverId: () => void;
    onSwitchToLogin: () => void;
    onCreateTitleChange: (value: string) => void;
    onCreateOrganizationNameChange: (value: string) => void;
    onCreateEventNameChange: (value: string) => void;
    onJoinRoomIdChange: (value: string) => void;
    onClearModalError: () => void;
    onSubmitLogin: (e: FormEvent) => void;
    onSubmitRecoverId: (e: FormEvent) => void;
    onSubmitCreateRoom: (e: FormEvent) => void;
    onSubmitJoinRoom: (e: FormEvent) => void;
};

export function HomeModals({
    modal,
    modalBusy,
    modalError,
    loginDraft,
    recoverEmailDraft,
    recoverBusy,
    recoverError,
    recoverSuccess,
    createTitle,
    createOrganizationName,
    createEventName,
    joinRoomId,
    onDismiss,
    onLoginDraftChange,
    onRecoverEmailChange,
    onSwitchToRecoverId,
    onSwitchToLogin,
    onCreateTitleChange,
    onCreateOrganizationNameChange,
    onCreateEventNameChange,
    onJoinRoomIdChange,
    onClearModalError,
    onSubmitLogin,
    onSubmitRecoverId,
    onSubmitCreateRoom,
    onSubmitJoinRoom,
}: Props) {
    const backdropBusy =
        modal === "recoverId" ? recoverBusy : modalBusy;

    return (
        <AnimatePresence>
            {modal ? (
                <motion.div
                    key="modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/80 px-4 backdrop-blur-sm"
                    onClick={() => !backdropBusy && onDismiss()}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: screenTransition,
                        }}
                        exit={{
                            opacity: 0,
                            y: 12,
                            transition: { duration: 0.25 },
                        }}
                        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
                        onClick={(ev) => ev.stopPropagation()}
                    >
                        {modal === "login" ? (
                            <form onSubmit={onSubmitLogin} className="space-y-4">
                                <h2 className="text-lg font-semibold text-zinc-50">
                                    Log in
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Paste the participant ID you received by email when you
                                    created your account.
                                </p>
                                <Input
                                    value={loginDraft}
                                    onChange={(ev) => {
                                        onLoginDraftChange(ev.target.value);
                                        if (modalError) onClearModalError();
                                    }}
                                    placeholder="Participant ID"
                                    disabled={modalBusy}
                                    autoComplete="off"
                                    className="h-12 border-zinc-800 bg-zinc-950"
                                />
                                {modalError ? (
                                    <p className="text-sm text-red-400">{modalError}</p>
                                ) : null}
                                <p className="text-center text-sm">
                                    <button
                                        type="button"
                                        className="text-zinc-400 underline decoration-zinc-600 underline-offset-2 hover:text-zinc-300"
                                        onClick={onSwitchToRecoverId}
                                        disabled={modalBusy}
                                    >
                                        Forgot your participant ID? Email it to me
                                    </button>
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onDismiss}
                                        disabled={modalBusy}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={modalBusy}>
                                        {modalBusy ? "Checking…" : "Save"}
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {modal === "recoverId" ? (
                            <form onSubmit={onSubmitRecoverId} className="space-y-4">
                                <h2 className="text-lg font-semibold text-zinc-50">
                                    Recover participant ID
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Enter the email you used when you created your account.
                                    We will send your participant ID to that address (never
                                    shown in the browser).
                                </p>
                                <Input
                                    type="email"
                                    value={recoverEmailDraft}
                                    onChange={(ev) => {
                                        onRecoverEmailChange(ev.target.value);
                                    }}
                                    placeholder="you@example.com"
                                    disabled={recoverBusy}
                                    autoComplete="email"
                                    className="h-12 border-zinc-800 bg-zinc-950"
                                />
                                {recoverError ? (
                                    <p className="text-sm text-red-400">{recoverError}</p>
                                ) : null}
                                {recoverSuccess ? (
                                    <p className="text-sm text-emerald-400">{recoverSuccess}</p>
                                ) : null}
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onSwitchToLogin}
                                        disabled={recoverBusy}
                                    >
                                        Back to log in
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={recoverBusy}
                                    >
                                        {recoverBusy ? "Sending…" : "Send my ID"}
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {modal === "createRoom" ? (
                            <form onSubmit={onSubmitCreateRoom} className="space-y-4">
                                <h2 className="text-lg font-semibold text-zinc-50">
                                    Create a room
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Each room is its own draw (organization + event). We email
                                    you a private admin link when your profile has an email.
                                </p>
                                <Input
                                    value={createOrganizationName}
                                    onChange={(ev) => {
                                        onCreateOrganizationNameChange(ev.target.value);
                                        if (modalError) onClearModalError();
                                    }}
                                    placeholder="Organization (e.g. BRASA at UNL)"
                                    className="h-12 border-zinc-800 bg-zinc-950"
                                />
                                <Input
                                    value={createEventName}
                                    onChange={(ev) => {
                                        onCreateEventNameChange(ev.target.value);
                                        if (modalError) onClearModalError();
                                    }}
                                    placeholder="Event name (e.g. Spring party, Secret Santa)"
                                    className="h-12 border-zinc-800 bg-zinc-950"
                                />
                                <Input
                                    value={createTitle}
                                    onChange={(ev) => {
                                        onCreateTitleChange(ev.target.value);
                                        if (modalError) onClearModalError();
                                    }}
                                    placeholder="Room name (internal label)"
                                    className="h-12 border-zinc-800 bg-zinc-950"
                                />
                                {modalError ? (
                                    <p className="text-sm text-red-400">{modalError}</p>
                                ) : null}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onDismiss}
                                        disabled={modalBusy}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={modalBusy}
                                    >
                                        {modalBusy ? "Creating…" : "Create"}
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {modal === "joinRoom" ? (
                            <form onSubmit={onSubmitJoinRoom} className="space-y-4">
                                <h2 className="text-lg font-semibold text-zinc-50">
                                    Join a room
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Enter the room ID shared by your organizer.
                                </p>
                                <Input
                                    value={joinRoomId}
                                    onChange={(ev) => {
                                        onJoinRoomIdChange(ev.target.value);
                                        if (modalError) onClearModalError();
                                    }}
                                    placeholder="Room ID"
                                    className="h-12 border-zinc-800 bg-zinc-950"
                                />
                                {modalError ? (
                                    <p className="text-sm text-red-400">{modalError}</p>
                                ) : null}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onDismiss}
                                        disabled={modalBusy}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={modalBusy}
                                    >
                                        {modalBusy ? "Joining…" : "Join"}
                                    </Button>
                                </div>
                            </form>
                        ) : null}
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
