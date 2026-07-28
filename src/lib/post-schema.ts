import { z } from "zod";

export const POST_KINDS = ["script", "macro", "executor", "tutorial"] as const;
export type PostKind = (typeof POST_KINDS)[number];

export const KIND_LABEL: Record<PostKind, string> = {
  script: "Scripts",
  macro: "Macros",
  executor: "Executors",
  tutorial: "Tutorials",
};

export const KIND_SINGULAR: Record<PostKind, string> = {
  script: "Script",
  macro: "Macro",
  executor: "Executor",
  tutorial: "Tutorial",
};

export const createPostSchema = z.object({
  kind: z.enum(POST_KINDS),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).default(""),
  robloxGameId: z
    .union([z.string().regex(/^\d+$/), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  customBannerUrl: z
    .union([z.string().trim().url(), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  keySystem: z.boolean().default(false),
  keyLink: z
    .union([z.string().trim().url(), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  luaContent: z.string().max(500_000).default(""),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
