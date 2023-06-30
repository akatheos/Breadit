import { z } from "zod";

export const subbreaditValidator = z.object({
  name: z
    .string()
    .min(3)
    .max(21)
    .regex(/^[a-zA-Z0-9]+$/),
});

export const subbreaditSubscriptionValidator = z.object({
  subbreaditId: z.string(),
});

export type CreateSubbreaditPayload = z.infer<typeof subbreaditValidator>;
export type SubbreaditSubscriptionPayload = z.infer<
  typeof subbreaditSubscriptionValidator
>;
