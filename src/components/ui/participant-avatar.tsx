import { User } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
    name: string | null;
    loading?: boolean;
    /** `md` = profile pill (h-9); `sm` = inline in badges. */
    size?: "sm" | "md";
    className?: string;
};

/**
 * Small circle with the person’s initial, or a user icon while loading / if no name.
 * Matches the home profile control styling.
 */
export function ParticipantAvatar({
    name,
    loading = false,
    size = "md",
    className,
}: Props) {
    const initial = name?.trim().charAt(0).toUpperCase() ?? null;
    const isSm = size === "sm";

    return (
        <span
            className={cn(
                "flex shrink-0 items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-900",
                isSm ? "h-4 w-4 text-[10px]" : "h-9 w-9 text-sm",
                className,
            )}
            aria-hidden
        >
            {loading && !name ? (
                <User
                    className={cn(
                        "text-zinc-600",
                        isSm ? "h-3 w-3" : "h-4 w-4",
                    )}
                />
            ) : initial ? (
                initial
            ) : (
                <User
                    className={cn(
                        "text-zinc-600",
                        isSm ? "h-3 w-3" : "h-4 w-4",
                    )}
                />
            )}
        </span>
    );
}
