"use client";

import {
    FormEvent,
    Suspense,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RevealResponse = {
    giver: { id: string; name: string };
    recipient: { id: string; name: string };
};

type ViewState = "boot" | "intro" | "loading" | "result" | "error";

const STORAGE_KEY = "brasa-easter-giver-id";

const screenTransition = {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
};

const screenVariants = {
    initial: {
        opacity: 0,
        y: 24,
        filter: "blur(6px)",
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: screenTransition,
    },
    exit: {
        opacity: 0,
        y: -18,
        filter: "blur(4px)",
        transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
};

const backButtonVariants = {
    initial: { opacity: 0, y: -8 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1] as const,
            delay: 0.12,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
    },
};

function HomeContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isRouting, startTransition] = useTransition();

    const queryGiverId = (searchParams.get("giverId") ?? "").trim();

    const [view, setView] = useState<ViewState>("boot");
    const [inputValue, setInputValue] = useState("");
    const [activeGiverId, setActiveGiverId] = useState("");
    const [result, setResult] = useState<RevealResponse | null>(null);
    const [error, setError] = useState("");

    const bootedRef = useRef(false);
    const lastFetchedIdRef = useRef("");
    const requestIdRef = useRef(0);

    const showReveal =
        view === "loading" || view === "result" || view === "error";

    const currentScreenKey = useMemo(() => {
        if (view === "intro") return "intro";
        if (showReveal)
            return `reveal-${activeGiverId || queryGiverId || "empty"}`;
        return "boot";
    }, [view, showReveal, activeGiverId, queryGiverId]);

    useEffect(() => {
        if (bootedRef.current) return;
        bootedRef.current = true;

        const storedId = window.localStorage.getItem(STORAGE_KEY)?.trim() ?? "";

        if (queryGiverId) {
            setInputValue(queryGiverId);
            setActiveGiverId(queryGiverId);
            setView("loading");
            return;
        }

        setInputValue(storedId);
        setActiveGiverId("");
        setResult(null);
        setError("");
        setView("intro");
    }, [queryGiverId]);

    useEffect(() => {
        if (!bootedRef.current) return;

        if (queryGiverId) {
            setInputValue(queryGiverId);
            setActiveGiverId((current) =>
                current === queryGiverId ? current : queryGiverId,
            );

            if (result?.giver.id === queryGiverId) {
                setView("result");
            } else {
                setView("loading");
            }

            return;
        }

        const storedId = window.localStorage.getItem(STORAGE_KEY)?.trim() ?? "";

        lastFetchedIdRef.current = "";
        setActiveGiverId("");
        setResult(null);
        setError("");
        setInputValue(storedId);
        setView("intro");
    }, [queryGiverId, result?.giver.id]);

    useEffect(() => {
        if (!bootedRef.current) return;
        if (view !== "loading") return;
        if (!activeGiverId) return;

        if (
            lastFetchedIdRef.current === activeGiverId &&
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
                    `/api/users/${encodeURIComponent(activeGiverId)}/recipient`,
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

                    lastFetchedIdRef.current = "";
                    setError(message);
                    setView("error");
                    return;
                }

                lastFetchedIdRef.current = activeGiverId;
                setResult(payload as RevealResponse);
                setView("result");
            } catch {
                if (controller.signal.aborted) return;
                if (currentRequestId !== requestIdRef.current) return;

                lastFetchedIdRef.current = "";
                setError("Something went wrong while loading your match.");
                setView("error");
            }
        }

        void run();

        return () => {
            controller.abort();
        };
    }, [view, activeGiverId, result?.giver.id]);

    function replaceUrlWithoutGiverId() {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("giverId");

        const nextUrl = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;

        startTransition(() => {
            router.replace(nextUrl);
        });
    }

    function replaceUrlWithGiverId(giverId: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("giverId", giverId);

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    }

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const cleanId = inputValue.trim();

        if (!cleanId) {
            setError("Please enter your giver ID.");
            setView("intro");
            return;
        }

        window.localStorage.setItem(STORAGE_KEY, cleanId);
        lastFetchedIdRef.current = "";

        setError("");
        setResult(null);
        setActiveGiverId(cleanId);
        setView("loading");

        replaceUrlWithGiverId(cleanId);
    }

    if (view === "boot") {
        return <div className="min-h-screen bg-zinc-950 text-zinc-100 dark" />;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 dark">
            <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center overflow-hidden px-6 py-20 sm:px-10">
                <AnimatePresence mode="wait" initial={false}>
                    {showReveal ? (
                        <motion.div
                            key={`back-${currentScreenKey}`}
                            variants={backButtonVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute left-4 top-4 z-30 sm:left-6 sm:top-6"
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={replaceUrlWithoutGiverId}
                                disabled={isRouting}
                                className="rounded-full"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {view === "intro" ? (
                        <motion.section
                            key="intro"
                            variants={screenVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
                        >
                            <div className="mx-auto max-w-2xl space-y-6 px-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                                    BRASA at UNL
                                </p>

                                <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                                    Welcome to the BRASA at UNL Easter Draw
                                </h1>

                                <p className="text-base leading-8 text-zinc-400 sm:text-lg">
                                    Enter your giver ID to find out who you are
                                    buying a gift for.
                                </p>
                            </div>

                            <div className="mx-auto mt-10 w-full max-w-2xl px-3">
                                <form onSubmit={onSubmit} className="space-y-4">
                                    <label
                                        htmlFor="giverId"
                                        className="block text-xs uppercase tracking-wider text-zinc-400"
                                    >
                                        Giver ID
                                    </label>

                                    <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-4">
                                        <Input
                                            id="giverId"
                                            value={inputValue}
                                            onChange={(event) => {
                                                setInputValue(
                                                    event.target.value,
                                                );
                                                if (error) setError("");
                                            }}
                                            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                            autoComplete="off"
                                            spellCheck={false}
                                            className="h-14 w-full rounded-xl border-zinc-800 bg-zinc-950 px-4 text-base text-zinc-100 placeholder:text-zinc-600"
                                        />

                                        <Button
                                            type="submit"
                                            disabled={isRouting}
                                            size="lg"
                                            className="h-14 w-full rounded-xl bg-zinc-100 px-8 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
                                        >
                                            Reveal
                                        </Button>
                                    </div>

                                    {error ? (
                                        <p className="text-sm text-red-400">
                                            {error}
                                        </p>
                                    ) : null}
                                </form>
                            </div>
                        </motion.section>
                    ) : (
                        <motion.section
                            key={`reveal-${activeGiverId || queryGiverId || "empty"}`}
                            variants={screenVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute inset-0 z-20 flex items-center justify-center text-center"
                        >
                            <div className="mx-auto max-w-2xl px-6 py-24">
                                {view === "loading" ? (
                                    <div className="flex items-center justify-center gap-3 text-zinc-300">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
                                        <p className="text-sm">
                                            Looking up your match...
                                        </p>
                                    </div>
                                ) : null}

                                {view === "result" && result ? (
                                    <div className="space-y-6">
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                                            Result
                                        </p>

                                        <div className="space-y-3">
                                            <h2 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                                                Hi, {result.giver.name}
                                            </h2>

                                            <p className="text-lg text-zinc-400 sm:text-xl">
                                                You are giving a gift to
                                            </p>

                                            <p className="text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
                                                {result.recipient.name}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}

                                {view === "error" ? (
                                    <div className="space-y-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                                            Error
                                        </p>

                                        <div className="space-y-3">
                                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                                                We could not load your match
                                            </h2>

                                            <p className="text-base leading-7 text-zinc-400 sm:text-lg">
                                                {error ||
                                                    "Something went wrong while loading your match."}
                                            </p>
                                        </div>

                                        <div className="flex justify-center">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={
                                                    replaceUrlWithoutGiverId
                                                }
                                            >
                                                Go back
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-zinc-950 text-zinc-100 dark" />
            }
        >
            <HomeContent />
        </Suspense>
    );
}
