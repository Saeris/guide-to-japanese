// eslint-disable-next-line import/no-unresolved
import { z, defineCollection } from "astro:content";

const learnSchema = z.object({
  title: z.string(),
  chapterNumber: z.number(),
  chapter: z.string(),
  part: z.number()
});

export type LearnPage = z.infer<typeof learnSchema>;

export const collections = {
  learn: defineCollection({
    type: `content`,
    schema: learnSchema
  })
};
