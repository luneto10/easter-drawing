import {
    DESIRED_ITEM_MAX_LENGTH,
    DESIRED_ITEMS_MAX_COUNT,
} from "@/lib/desired-items-limits";
import { cn } from "@/lib/utils";

type Props = {
    roomLabel: string;
    className?: string;
    roomClassName?: string;
};

/** Single source for wish list help copy (card + dialog). */
export function HomeWishListDescription({
    roomLabel,
    className,
    roomClassName,
}: Props) {
    return (
        <span className={className}>
            For{" "}
            <span className={cn("text-zinc-400", roomClassName)}>{roomLabel}</span>
            . One idea per line & up to {DESIRED_ITEMS_MAX_COUNT} items,{" "}
            {DESIRED_ITEM_MAX_LENGTH} characters each.
        </span>
    );
}
