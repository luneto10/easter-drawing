import { z } from "zod";

/** Expected JSON body for POST /api/users */
export const createUserBodySchema = z.object({
    name: z
        .string()
        .min(1, "name must not be empty")
        .max(120, "name is too long"),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
