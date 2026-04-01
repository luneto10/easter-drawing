"use client";

import {
    FormEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Home as HomeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HomeIntroSection } from "@/components/home/home-intro-section";
import { HomeModals } from "@/components/home/home-modals";
import { HomeRevealBackButton } from "@/components/home/home-reveal-back-button";
import { HomeRevealSection } from "@/components/home/home-reveal-section";
import { STORAGE_KEY } from "@/components/home/home-motion";
import type {
    ModalState,
    RevealResponse,
    UserRoomListItem,
    ViewState,
} from "@/components/home/home-types";

const UUID_HEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeClientUuid(id: string): string {
    const t = id.trim();
    return UUID_HEX.test(t) ? t.toLowerCase() : t;
}

export function HomeContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isRouting, startTransition] = useTransition();

    const queryGiverId = (searchParams.get("giverId") ?? "").trim();
    const queryRoomId = (searchParams.get("room") ?? "").trim();

    const [view, setView] = useState<ViewState>("boot");
    const [inputValue, setInputValue] = useState("");
    const [roomInput, setRoomInput] = useState("");
    const [activeGiverId, setActiveGiverId] = useState("");
    const [activeRoomId, setActiveRoomId] = useState("");
    const [result, setResult] = useState<RevealResponse | null>(null);
    const [error, setError] = useState("");
    const [modal, setModal] = useState<ModalState>(null);
    const [loginDraft, setLoginDraft] = useState("");
    const [createTitle, setCreateTitle] = useState("");
    const [createOrganizationName, setCreateOrganizationName] = useState("");
    const [createEventName, setCreateEventName] = useState("");
    const [joinRoomId, setJoinRoomId] = useState("");
    const [modalBusy, setModalBusy] = useState(false);
    const [modalError, setModalError] = useState("");
    const [savedUserId, setSavedUserId] = useState("");
    const [profileName, setProfileName] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [roomTitle, setRoomTitle] = useState<string | null>(null);
    const [myRooms, setMyRooms] = useState<UserRoomListItem[]>([]);
    const [myRoomsLoading, setMyRoomsLoading] = useState(false);
    const [urlRoomMeta, setUrlRoomMeta] = useState<{
        title: string;
        organizationName: string;
        eventName: string;
        drawEnabled: boolean;
    } | null>(null);
    const [urlRoomLoading, setUrlRoomLoading] = useState(false);

    const bootedRef = useRef(false);
    const lastFetchedRef = useRef({ giver: "", room: "" });
    const requestIdRef = useRef(0);

    const showReveal =
        view === "loading" || view === "result" || view === "error";

    const currentScreenKey = useMemo(() => {
        if (view === "intro") return "intro";
        if (showReveal)
            return `reveal-${activeGiverId || queryGiverId || "empty"}-${activeRoomId || queryRoomId || "noroom"}`;
        return "boot";
    }, [view, showReveal, activeGiverId, queryGiverId, activeRoomId, queryRoomId]);

    const roomIdSummary = useMemo((): string | null => {
        const r = (roomInput || queryRoomId || "").trim();
        if (!r) return null;
        return normalizeClientUuid(r);
    }, [roomInput, queryRoomId]);

    const needsPublicRoomMeta = useMemo(() => {
        if (!roomIdSummary) return false;
        return !myRooms.some((r) => r.id === roomIdSummary);
    }, [roomIdSummary, myRooms]);

    const currentRoomDrawOpen = useMemo((): boolean | null => {
        if (!roomIdSummary) return null;
        const fromList = myRooms.find((r) => r.id === roomIdSummary);
        if (fromList !== undefined) return fromList.drawEnabled;
        if (needsPublicRoomMeta) {
            if (urlRoomLoading) return null;
            if (urlRoomMeta !== null) return urlRoomMeta.drawEnabled;
            return null;
        }
        return true;
    }, [roomIdSummary, myRooms, needsPublicRoomMeta, urlRoomLoading, urlRoomMeta]);

    const introBranding = useMemo(() => {
        if (!roomIdSummary) {
            return {
                organizationName: null as string | null,
                eventName: null as string | null,
            };
        }
        const fromList = myRooms.find((r) => r.id === roomIdSummary);
        if (fromList) {
            return {
                organizationName: fromList.organizationName,
                eventName: fromList.eventName,
            };
        }
        if (
            urlRoomMeta &&
            typeof urlRoomMeta.organizationName === "string" &&
            typeof urlRoomMeta.eventName === "string"
        ) {
            return {
                organizationName: urlRoomMeta.organizationName,
                eventName: urlRoomMeta.eventName,
            };
        }
        return {
            organizationName: null as string | null,
            eventName: null as string | null,
        };
    }, [roomIdSummary, myRooms, urlRoomMeta]);

    async function refreshMyRooms() {
        const uid = savedUserId.trim();
        if (!uid) {
            setMyRooms([]);
            return;
        }
        setMyRoomsLoading(true);
        try {
            const res = await fetch(
                `/api/users/${encodeURIComponent(uid)}/rooms`,
                { cache: "no-store" },
            );
            if (res.ok) {
                const data = (await res.json()) as UserRoomListItem[];
                setMyRooms(Array.isArray(data) ? data : []);
            } else {
                setMyRooms([]);
            }
        } catch {
            setMyRooms([]);
        } finally {
            setMyRoomsLoading(false);
        }
    }

    useEffect(() => {
        void refreshMyRooms();
    }, [savedUserId]);

    /** Fetch `/api/rooms/:id` only when the focused room is not already in the membership list. */
    const publicMetaRoomId = useMemo(() => {
        const id = roomIdSummary;
        if (!id) return "";
        if (myRooms.some((r) => r.id === id)) return "";
        return id;
    }, [roomIdSummary, myRooms]);

    useEffect(() => {
        const id = publicMetaRoomId;
        if (!id) {
            setUrlRoomMeta(null);
            setUrlRoomLoading(false);
            return;
        }

        const controller = new AbortController();
        setUrlRoomLoading(true);

        void fetch(`/api/rooms/${encodeURIComponent(id)}`, {
            signal: controller.signal,
            cache: "no-store",
        })
            .then((r) => (r.ok ? r.json() : null))
            .then(
                (data: {
                    title?: string;
                    organizationName?: string;
                    eventName?: string;
                    drawEnabled?: boolean;
                } | null) => {
                    if (
                        data &&
                        typeof data.drawEnabled === "boolean" &&
                        typeof data.organizationName === "string" &&
                        typeof data.eventName === "string"
                    ) {
                        setUrlRoomMeta({
                            title: String(data.title ?? ""),
                            organizationName: data.organizationName,
                            eventName: data.eventName,
                            drawEnabled: data.drawEnabled,
                        });
                    } else {
                        setUrlRoomMeta(null);
                    }
                },
            )
            .catch(() => setUrlRoomMeta(null))
            .finally(() => {
                if (!controller.signal.aborted) setUrlRoomLoading(false);
            });

        return () => controller.abort();
    }, [publicMetaRoomId]);

    useEffect(() => {
        if (!savedUserId) {
            setProfileName(null);
            setProfileLoading(false);
            return;
        }

        const controller = new AbortController();
        setProfileLoading(true);

        void (async () => {
            try {
                const res = await fetch(
                    `/api/users/${encodeURIComponent(savedUserId)}`,
                    { cache: "no-store", signal: controller.signal },
                );
                if (!res.ok) {
                    if (!controller.signal.aborted) setProfileName(null);
                    return;
                }
                const data = (await res.json()) as { name: string };
                if (!controller.signal.aborted) setProfileName(data.name);
            } catch {
                if (!controller.signal.aborted) setProfileName(null);
            } finally {
                if (!controller.signal.aborted) setProfileLoading(false);
            }
        })();

        return () => controller.abort();
    }, [savedUserId]);

    useEffect(() => {
        if (bootedRef.current) return;
        bootedRef.current = true;

        const storedId = window.localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
        setSavedUserId(storedId);

        if (queryRoomId) {
            setRoomInput(queryRoomId);
            setActiveRoomId(queryRoomId);
        }

        if (queryGiverId) {
            setInputValue(queryGiverId);
            setActiveGiverId(queryGiverId);
            if (queryRoomId) {
                setView("loading");
            } else {
                setError(
                    "This link is missing the room. Use the full link from your email, or log in and join a room.",
                );
                setView("intro");
            }
            return;
        }

        setInputValue(storedId);
        setActiveGiverId("");
        setResult(null);
        setError("");
        setView("intro");
    }, [queryGiverId, queryRoomId]);

    useEffect(() => {
        if (!bootedRef.current) return;

        if (queryRoomId) {
            setRoomInput(queryRoomId);
            setActiveRoomId(queryRoomId);
        }

        if (queryGiverId) {
            setInputValue(queryGiverId);
            setActiveGiverId((current) =>
                current === queryGiverId ? current : queryGiverId,
            );

            if (!queryRoomId) {
                setError(
                    "This link is missing the room. Use the full link from your email, or log in and join a room.",
                );
                setView("intro");
                return;
            }

            if (result?.giver.id === queryGiverId) {
                setView("result");
            } else {
                setView("loading");
            }

            return;
        }

        const storedId = window.localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
        setSavedUserId(storedId);

        lastFetchedRef.current = { giver: "", room: "" };
        setActiveGiverId("");
        setResult(null);
        setError("");
        setInputValue(storedId);
        setView("intro");
    }, [queryGiverId, queryRoomId, result?.giver.id]);

    useEffect(() => {
        if (!bootedRef.current) return;
        if (view !== "loading") return;
        if (!activeGiverId || !activeRoomId) return;

        if (
            lastFetchedRef.current.giver === activeGiverId &&
            lastFetchedRef.current.room === activeRoomId &&
            result?.giver.id === activeGiverId
        ) {
            setView("result");
            return;
        }

        const controller = new AbortController();
        const currentRequestId = ++requestIdRef.current;

        setError("");
        setResult(null);

        async function run() {
            try {
                const response = await fetch(
                    `/api/users/${encodeURIComponent(activeGiverId)}/recipient?roomId=${encodeURIComponent(activeRoomId)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        signal: controller.signal,
                    },
                );

                const payload = (await response.json()) as
                    | RevealResponse
                    | { error?: string };

                if (controller.signal.aborted) return;
                if (currentRequestId !== requestIdRef.current) return;

                if (!response.ok) {
                    const message =
                        "error" in payload && payload.error
                            ? payload.error
                            : "We could not find a match for this ID.";

                    lastFetchedRef.current = { giver: "", room: "" };
                    setError(message);
                    setView("error");
                    return;
                }

                lastFetchedRef.current = {
                    giver: activeGiverId,
                    room: activeRoomId,
                };
                setResult(payload as RevealResponse);
                setView("result");
            } catch {
                if (controller.signal.aborted) return;
                if (currentRequestId !== requestIdRef.current) return;

                lastFetchedRef.current = { giver: "", room: "" };
                setError("Something went wrong while loading your match.");
                setView("error");
            }
        }

        void run();

        return () => {
            controller.abort();
        };
    }, [view, activeGiverId, activeRoomId, result?.giver.id]);

    function replaceUrlWithoutGiverId() {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("giverId");

        const nextUrl = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;

        window.history.replaceState(null, "", nextUrl);

        lastFetchedRef.current = { giver: "", room: "" };
        setActiveGiverId("");
        setResult(null);
        setError("");
        setView("intro");
    }

    /** Base URL only — no query string; clears room/reveal state for a clean landing. */
    function goHome() {
        startTransition(() => {
            router.push("/");
        });
        lastFetchedRef.current = { giver: "", room: "" };
        setActiveGiverId("");
        setActiveRoomId("");
        setRoomInput("");
        setRoomTitle(null);
        setResult(null);
        setError("");
        setView("intro");
    }

    function replaceUrlWithGiverId(giverId: string, roomForUrl: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("giverId", giverId);
        const room = roomForUrl.trim() || roomInput.trim() || queryRoomId;
        if (room) params.set("room", room);

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }

    function logout() {
        window.localStorage.removeItem(STORAGE_KEY);
        setSavedUserId("");
        setInputValue("");
        setProfileName(null);
        setRoomInput("");
        setActiveRoomId("");
        setRoomTitle(null);
        setMyRooms([]);
        setError("");
    }

    function handleSelectMyRoom(room: UserRoomListItem) {
        setRoomInput(room.id);
        setActiveRoomId(room.id);
        setRoomTitle(room.title);
        setError("");
    }

    function handleRevealMyRoom(room: UserRoomListItem) {
        const giverId = savedUserId.trim();
        if (!giverId) return;
        if (!room.drawEnabled) {
            setError("Draw is closed for this room.");
            return;
        }
        setRoomInput(room.id);
        setRoomTitle(room.title);
        setActiveRoomId(room.id);
        lastFetchedRef.current = { giver: "", room: "" };
        setError("");
        setResult(null);
        setActiveGiverId(giverId);
        setView("loading");
        replaceUrlWithGiverId(giverId, room.id);
    }

    async function submitLoginModal(e: FormEvent) {
        e.preventDefault();
        const id = loginDraft.trim();
        if (!id) {
            setModalError("Paste your participant ID.");
            return;
        }
        setModalBusy(true);
        setModalError("");
        try {
            const res = await fetch(
                `/api/users/${encodeURIComponent(id)}`,
                { cache: "no-store" },
            );
            const data = (await res.json()) as {
                error?: string;
                id?: string;
                name?: string;
            };
            if (!res.ok) {
                if (res.status === 404) {
                    setModalError(
                        "No participant found with this ID. Create an account first or check the ID from your email.",
                    );
                } else {
                    setModalError(data?.error ?? "Could not verify this ID.");
                }
                return;
            }
            window.localStorage.setItem(STORAGE_KEY, id);
            setSavedUserId(id);
            setInputValue(id);
            if (data.name) setProfileName(data.name);
            setModal(null);
            void refreshMyRooms();
        } catch {
            setModalError("Could not verify this ID. Try again.");
        } finally {
            setModalBusy(false);
        }
    }

    async function submitCreateRoom(e: FormEvent) {
        e.preventDefault();
        const userId = window.localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
        if (!userId) {
            setModalError("Log in with your participant ID first.");
            return;
        }
        const title = createTitle.trim();
        if (!title) {
            setModalError("Enter a room name.");
            return;
        }
        const organizationName = createOrganizationName.trim();
        const eventName = createEventName.trim();
        if (!organizationName) {
            setModalError("Enter the organization name.");
            return;
        }
        if (!eventName) {
            setModalError(
                "Enter the event name (e.g. Spring party, Secret Santa).",
            );
            return;
        }
        setModalBusy(true);
        setModalError("");
        try {
            const res = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    organizationName,
                    eventName,
                    creatorUserId: userId,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setModalError(data?.error ?? "Could not create room");
                return;
            }
            const id = data.room?.id as string | undefined;
            const createdRoomTitle = data.room?.title as string | undefined;
            if (id) {
                setRoomInput(id);
                setActiveRoomId(id);
                setRoomTitle(createdRoomTitle ?? null);
            }
            setCreateTitle("");
            setCreateOrganizationName("");
            setCreateEventName("");
            setModal(null);
            setError("");
            void refreshMyRooms();
        } catch {
            setModalError("Could not create room");
        } finally {
            setModalBusy(false);
        }
    }

    async function submitJoinRoom(e: FormEvent) {
        e.preventDefault();
        const userId = window.localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
        if (!userId) {
            setModalError("Log in with your participant ID first.");
            return;
        }
        const rid = joinRoomId.trim();
        if (!rid) {
            setModalError("Enter the room ID.");
            return;
        }
        setModalBusy(true);
        setModalError("");
        try {
            const res = await fetch("/api/rooms/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, roomId: rid }),
            });
            const data = await res.json();
            if (!res.ok) {
                setModalError(data?.error ?? "Could not join room");
                return;
            }
            setRoomInput(rid);
            setActiveRoomId(rid);
            setRoomTitle((data.room?.title as string | undefined) ?? null);
            setJoinRoomId("");
            setModal(null);
            void refreshMyRooms();
        } catch {
            setModalError("Could not join room");
        } finally {
            setModalBusy(false);
        }
    }

    if (view === "boot") {
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
                        onClick={goHome}
                        aria-label="Home — open the main page"
                    >
                        <HomeIcon className="h-5 w-5" aria-hidden />
                    </Button>
                    <HomeRevealBackButton
                        embedded
                        show={showReveal}
                        screenKey={currentScreenKey}
                        isRouting={isRouting}
                        onBack={replaceUrlWithoutGiverId}
                    />
                </div>

                <HomeModals
                    modal={modal}
                    modalBusy={modalBusy}
                    modalError={modalError}
                    loginDraft={loginDraft}
                    createTitle={createTitle}
                    createOrganizationName={createOrganizationName}
                    createEventName={createEventName}
                    joinRoomId={joinRoomId}
                    onDismiss={() => setModal(null)}
                    onLoginDraftChange={setLoginDraft}
                    onCreateTitleChange={setCreateTitle}
                    onCreateOrganizationNameChange={setCreateOrganizationName}
                    onCreateEventNameChange={setCreateEventName}
                    onJoinRoomIdChange={setJoinRoomId}
                    onClearModalError={() => setModalError("")}
                    onSubmitLogin={submitLoginModal}
                    onSubmitCreateRoom={submitCreateRoom}
                    onSubmitJoinRoom={submitJoinRoom}
                />

                <AnimatePresence mode="wait">
                    {view === "intro" ? (
                        <HomeIntroSection
                            savedUserId={savedUserId}
                            profileName={profileName}
                            profileLoading={profileLoading}
                            roomIdSummary={roomIdSummary}
                            roomTitle={roomTitle}
                            focusOrganizationName={introBranding.organizationName}
                            focusEventName={introBranding.eventName}
                            currentRoomDrawOpen={currentRoomDrawOpen}
                            error={error}
                            myRooms={myRooms}
                            myRoomsLoading={myRoomsLoading}
                            onLogout={logout}
                            onOpenLogin={() => {
                                setLoginDraft(savedUserId || inputValue);
                                setModalError("");
                                setModal("login");
                            }}
                            onOpenCreateRoom={() => {
                                setModalError("");
                                setModal("createRoom");
                            }}
                            onOpenJoinRoom={() => {
                                setJoinRoomId(roomInput);
                                setModalError("");
                                setModal("joinRoom");
                            }}
                            onSelectMyRoom={handleSelectMyRoom}
                            onRevealMyRoom={handleRevealMyRoom}
                        />
                    ) : (
                        <HomeRevealSection
                            view={view}
                            sectionKey={`reveal-${activeGiverId || queryGiverId || "empty"}`}
                            result={result}
                            error={error}
                            onGoBack={replaceUrlWithoutGiverId}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
