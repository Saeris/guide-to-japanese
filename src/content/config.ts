import { z, defineCollection } from "astro:content";

export const collections = {
  learn: defineCollection({
    type: "content",
    schema: z.object({
      title: z.string(),
      chapter: z.string(),
      part: z.number().optional(),
    }),
  }),
};
