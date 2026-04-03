import { z } from "zod";

export const recoverIdBodySchema = z.object({
    email: z.string().trim().email("Enter a valid email address."),
});

export type RecoverIdBody = z.infer<typeof recoverIdBodySchema>;
