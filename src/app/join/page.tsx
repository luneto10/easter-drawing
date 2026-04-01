"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORAGE_KEY } from "@/components/home/home-motion";

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
};

type CreateUserResponse = {
    id: string;
    name: string;
    email: string | null;
    createdAt: string;
};

export default function JoinPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [created, setCreated] = useState<CreateUserResponse | null>(null);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setCreated(null);

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email: email || undefined,
                }),
            });
            const payload = await response.json();
            if (!response.ok) {
                setError(payload?.error ?? "Failed to create account");
                return;
            }
            const user = payload as CreateUserResponse;
            window.localStorage.setItem(STORAGE_KEY, user.id);
            setCreated(user);
            setName("");
            setEmail("");
        } catch {
            setError("Failed to create account");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 overflow-hidden bg-zinc-950 text-zinc-100 dark">
            <main className="relative mx-auto flex h-dvh w-full max-w-5xl items-center justify-center overflow-y-auto px-6 py-10 sm:px-10">
                <motion.section
                    variants={screenVariants}
                    initial="initial"
                    animate="animate"
                    className="w-full max-w-2xl space-y-6 text-center"
                >
                    <div className="flex justify-start">
                        <Button asChild variant="secondary" size="icon" className="rounded-full">
                            <Link href="/" aria-label="Back">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                            Gift exchange
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                            Create your account
                        </h1>
                        <p className="text-zinc-400">
                            Register with your email — we will send your participant ID. It is
                            also saved on this device for quick log in.
                        </p>
                    </div>

                    {!created ? (
                        <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 text-left">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="h-12 border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
                                required
                            />
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email (required for your ID email)"
                                type="email"
                                className="h-12 border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
                                required
                            />
                            <Button
                                type="submit"
                                className="h-12 w-full rounded-xl bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create account"}
                            </Button>
                        </form>
                    ) : null}

                    {error ? (
                        <p className="text-sm text-red-400">{error}</p>
                    ) : null}

                    {created ? (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={screenTransition}
                            className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 text-left"
                        >
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                                Account created
                            </p>
                            <p className="mt-2 text-sm text-zinc-300">
                                Your participant ID (also emailed to you):
                            </p>
                            <p className="mt-2 break-all font-mono text-sm text-zinc-100">
                                {created.id}
                            </p>
                            <p className="mt-4 text-xs text-zinc-500">
                                Saved in your browser. You can create or join a room from the home
                                screen.
                            </p>
                            <Button asChild className="mt-6 w-full rounded-xl" variant="secondary">
                                <Link href="/">Back to home</Link>
                            </Button>
                        </motion.div>
                    ) : null}
                </motion.section>
            </main>
        </div>
    );
}
