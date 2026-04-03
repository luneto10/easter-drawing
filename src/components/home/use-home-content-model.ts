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

import { STORAGE_KEY } from "@/components/home/home-motion";
import type {
    ModalState,
    RevealResponse,
    UserRoomListItem,
    ViewState,
} from "@/types/home";
import type { RoomPublicMeta } from "@/types/room";
import { normalizeClientUuid } from "@/components/home/home-uuid";
import { AppApiClient } from "@/lib/api/app-api-client";

const RECOVER_DEFAULT_SUCCESS =
    "If an account exists for that email, we sent your participant ID.";

export function useHomeContentModel() {
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
    const [urlRoomMeta, setUrlRoomMeta] = useState<RoomPublicMeta | null>(
        null,
    );
    const [urlRoomLoading, setUrlRoomLoading] = useState(false);
    const [wishlistReportBusyRoomId, setWishlistReportBusyRoomId] = useState<
        string | null
    >(null);
    const [recoverEmailDraft, setRecoverEmailDraft] = useState("");
    const [recoverBusy, setRecoverBusy] = useState(false);
    const [recoverError, setRecoverError] = useState("");
    const [recoverSuccess, setRecoverSuccess] = useState<string | null>(null);

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
            const data = await AppApiClient.listUserRooms(uid);
            setMyRooms(data);
        } catch {
            setMyRooms([]);
        } finally {
            setMyRoomsLoading(false);
        }
    }

    useEffect(() => {
        void refreshMyRooms();
    }, [savedUserId]);

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

        void (async () => {
            try {
                const meta = await AppApiClient.getRoomPublicMeta(id, {
                    signal: controller.signal,
                });
                if (!controller.signal.aborted) setUrlRoomMeta(meta);
            } catch {
                if (!controller.signal.aborted) setUrlRoomMeta(null);
            } finally {
                if (!controller.signal.aborted) setUrlRoomLoading(false);
            }
        })();

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
                const outcome = await AppApiClient.getUserProfile(
                    savedUserId,
                    { signal: controller.signal },
                );
                if (controller.signal.aborted) return;

                if (outcome === "not_found") {
                    setError("Account not found.");
                    window.localStorage.removeItem(STORAGE_KEY);
                    setSavedUserId("");
                    setProfileName(null);
                    setInputValue("");
                    setMyRooms([]);
                    setProfileLoading(false);
                    return;
                }
                if (outcome === "error") {
                    setProfileName(null);
                    setProfileLoading(false);
                    return;
                }
                setProfileName(outcome.name);
                setProfileLoading(false);
            } catch {
                if (!controller.signal.aborted) {
                    setProfileName(null);
                    setProfileLoading(false);
                }
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

            setView("loading");

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
    }, [queryGiverId, queryRoomId]);

    useEffect(() => {
        if (!bootedRef.current) return;
        if (view !== "loading") return;
        if (!activeGiverId || !activeRoomId) return;

        if (
            lastFetchedRef.current.giver === activeGiverId &&
            lastFetchedRef.current.room === activeRoomId &&
            result !== null
        ) {
            setView("result");
            return;
        }

        const controller = new AbortController();
        const currentRequestId = ++requestIdRef.current;

        setError("");
        setResult(null);

        void (async () => {
            try {
                const outcome = await AppApiClient.getRecipientAssignment(
                    activeGiverId,
                    activeRoomId,
                    { signal: controller.signal },
                );

                if (controller.signal.aborted) return;
                if (currentRequestId !== requestIdRef.current) return;

                if (!outcome.ok) {
                    lastFetchedRef.current = { giver: "", room: "" };
                    setError(outcome.error);
                    setView("error");
                    return;
                }

                lastFetchedRef.current = {
                    giver: activeGiverId,
                    room: activeRoomId,
                };
                setResult(outcome.data);
                setView("result");
            } catch {
                if (controller.signal.aborted) return;
                if (currentRequestId !== requestIdRef.current) return;
                lastFetchedRef.current = { giver: "", room: "" };
                setError(
                    "Something went wrong while loading your match.",
                );
                setView("error");
            }
        })();

        return () => {
            controller.abort();
        };
    }, [view, activeGiverId, activeRoomId]);

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

    function goHome() {
        window.location.assign("/");
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
        window.location.replace("/");
    }

    function handleSelectMyRoom(room: UserRoomListItem) {
        setRoomInput(room.id);
        setActiveRoomId(room.id);
        setRoomTitle(room.title);
        setError("");
    }

    /** Clear focused room (client state + `room` query param). */
    function clearRoomSelection() {
        if (!(roomInput.trim() || queryRoomId.trim() || activeRoomId.trim())) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.delete("room");
        const qs = params.toString();
        startTransition(() => {
            router.replace(qs ? `${pathname}?${qs}` : pathname);
        });
        setRoomInput("");
        setActiveRoomId("");
        setRoomTitle(null);
        setError("");
    }

    async function handleDownloadWishlistReport(room: UserRoomListItem) {
        if (!room.adminKey) return;
        setWishlistReportBusyRoomId(room.id);
        setError("");
        try {
            const outcome = await AppApiClient.downloadWishlistReport(
                room.id,
                room.adminKey,
            );
            if (!outcome.ok) {
                setError(outcome.error);
                return;
            }
            const url = URL.createObjectURL(outcome.blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = outcome.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            setError("Could not download the wish list report.");
        } finally {
            setWishlistReportBusyRoomId(null);
        }
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

    async function submitRecoverIdModal(e: FormEvent) {
        e.preventDefault();
        const email = recoverEmailDraft.trim();
        if (!email) {
            setRecoverError("Enter the email you used when you signed up.");
            return;
        }
        setRecoverBusy(true);
        setRecoverError("");
        setRecoverSuccess(null);
        try {
            const outcome = await AppApiClient.recoverParticipantId(email);
            if (!outcome.ok) {
                setRecoverError(outcome.error);
                return;
            }
            setRecoverSuccess(outcome.message ?? RECOVER_DEFAULT_SUCCESS);
            setRecoverEmailDraft("");
        } catch {
            setRecoverError("Could not send the email. Try again.");
        } finally {
            setRecoverBusy(false);
        }
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
            const outcome = await AppApiClient.verifyParticipantForLogin(id);
            if (!outcome.ok) {
                setModalError(
                    outcome.notFound
                        ? "Account not found."
                        : (outcome.error ??
                          "Could not verify this ID."),
                );
                return;
            }
            window.localStorage.setItem(STORAGE_KEY, id);
            setSavedUserId(id);
            setInputValue(id);
            if (outcome.name) setProfileName(outcome.name);
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
            const outcome = await AppApiClient.createRoom({
                title,
                organizationName,
                eventName,
                creatorUserId: userId,
            });
            if (!outcome.ok) {
                setModalError(outcome.error);
                return;
            }
            setRoomInput(outcome.room.id);
            setActiveRoomId(outcome.room.id);
            setRoomTitle(outcome.room.title ?? null);
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
            const outcome = await AppApiClient.joinRoom(userId, rid);
            if (!outcome.ok) {
                setModalError(outcome.error);
                return;
            }
            setRoomInput(rid);
            setActiveRoomId(rid);
            setRoomTitle(outcome.room?.title ?? null);
            setJoinRoomId("");
            setModal(null);
            void refreshMyRooms();
        } catch {
            setModalError("Could not join room");
        } finally {
            setModalBusy(false);
        }
    }

    return {
        view,
        showReveal,
        currentScreenKey,
        queryGiverId,
        queryRoomId,
        roomIdSummary,
        introBranding,
        currentRoomDrawOpen,
        isRouting,
        // intro / reveal state
        inputValue,
        roomInput,
        activeGiverId,
        activeRoomId,
        result,
        error,
        savedUserId,
        profileName,
        profileLoading,
        roomTitle,
        myRooms,
        myRoomsLoading,
        wishlistReportBusyRoomId,
        // modals
        modal,
        modalBusy,
        modalError,
        loginDraft,
        createTitle,
        createOrganizationName,
        createEventName,
        joinRoomId,
        recoverEmailDraft,
        recoverBusy,
        recoverError,
        recoverSuccess,
        // actions
        replaceUrlWithoutGiverId,
        goHome,
        logout,
        handleSelectMyRoom,
        clearRoomSelection,
        handleRevealMyRoom,
        handleDownloadWishlistReport,
        submitRecoverIdModal,
        submitLoginModal,
        submitCreateRoom,
        submitJoinRoom,
        setModal,
        setLoginDraft,
        setRecoverEmailDraft,
        setRecoverError,
        setRecoverSuccess,
        setModalError,
        setCreateTitle,
        setCreateOrganizationName,
        setCreateEventName,
        setJoinRoomId,
    };
}
