"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { ParticipantAvatar } from "@/components/ui/participant-avatar";
import { cn } from "@/lib/utils";

type Props = {
    savedUserId: string;
    profileName: string | null;
    profileLoading: boolean;
    /** `toolbar` = top-right with home button (mobile). `hero` = in header row (md+). */
    placement?: "toolbar" | "hero";
};

export function HomeIntroProfileButton({
    savedUserId,
    profileName,
    profileLoading,
    placement = "hero",
}: Props) {
    const [copied, setCopied] = useState(false);

    return (
        <button
            type="button"
            className={cn(
                "flex max-w-full items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 p-1.5 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400",
                placement === "toolbar" && "shadow-sm",
                placement === "hero" &&
                    "self-end shadow-sm md:py-1.5 md:pl-1.5 md:pr-4",
            )}
            aria-label={
                copied
                    ? "Participant ID copied to clipboard"
                    : "Your profile — click to copy participant ID"
            }
            title="Click to copy your participant ID"
            onClick={() => {
                void navigator.clipboard.writeText(savedUserId);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
            }}
        >
            <span className="relative shrink-0">
                <ParticipantAvatar
                    name={profileName}
                    loading={profileLoading}
                    size="md"
                />
                <span
                    className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow-sm md:hidden"
                    aria-hidden
                >
                    {copied ? (
                        <Check
                            className="h-2.5 w-2.5 text-emerald-400"
                            strokeWidth={2.5}
                        />
                    ) : (
                        <Copy className="h-2.5 w-2.5" strokeWidth={2.5} />
                    )}
                </span>
            </span>
            <div className="hidden min-w-0 text-left md:block">
                <p className="text-sm font-medium leading-tight text-zinc-100">
                    {profileLoading && !profileName
                        ? "Loading…"
                        : (profileName ?? "Participant")}
                </p>
                <p
                    className={cn(
                        "mt-0.5 text-xs leading-snug",
                        copied ? "text-emerald-400" : "text-zinc-500",
                    )}
                    aria-live="polite"
                >
                    {copied ? "Copied to clipboard" : "Click to copy your ID"}
                </p>
            </div>
        </button>
    );
}
