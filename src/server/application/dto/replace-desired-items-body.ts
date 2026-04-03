import { z } from "zod";

import {
    DESIRED_ITEM_MAX_LENGTH,
    DESIRED_ITEMS_MAX_COUNT,
} from "@/lib/desired-items-limits";

/** Expected JSON body for PUT /api/users/:id/rooms/:roomId/desired-items */
export const replaceDesiredItemsBodySchema = z.object({
    items: z
        .array(z.string().max(DESIRED_ITEM_MAX_LENGTH, "item too long"))
        .max(DESIRED_ITEMS_MAX_COUNT, "too many items")
        .default([]),
});

export type ReplaceDesiredItemsBody = z.infer<
    typeof replaceDesiredItemsBodySchema
>;
