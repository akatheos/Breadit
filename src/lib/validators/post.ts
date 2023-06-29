import { z } from "zod";

export const postValidator = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(128, { message: "Title must be shorter than 128 characters" }),
  subbreaditId: z.string(),
  content: z.any({
    required_error: "Content inside the post is required",
  }),
});

export type PostValidator = z.infer<typeof postValidator>;
