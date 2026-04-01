"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CreateUserResponse = {
    id: string;
    name: string;
    email: string | null;
    recipientId: string | null;
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
            setCreated(payload as CreateUserResponse);
            setName("");
            setEmail("");
        } catch {
            setError("Failed to create account");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-6 py-16">
                <section className="w-full space-y-6 text-center">
                    <div className="flex justify-start">
                        <Button asChild variant="secondary" size="icon">
                            <Link href="/" aria-label="Back">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                            BRASA at UNL
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                            Create your account
                        </h1>
                        <p className="text-zinc-400">
                            Register your name and email to receive your Easter
                            Draw result by email.
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="h-12 text-amber-950"
                        />
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email (name@email.com)"
                            className="h-12 text-amber-950"
                        />
                        <Button
                            type="submit"
                            className="h-12 w-full"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create account"}
                        </Button>
                    </form>

                    {error ? (
                        <p className="text-sm text-red-400">{error}</p>
                    ) : null}

                    {created ? (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left">
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                                Account created
                            </p>
                        </div>
                    ) : null}
                </section>
            </main>
        </div>
    );
}
