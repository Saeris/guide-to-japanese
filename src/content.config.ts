// eslint-disable-next-line import/no-unresolved
import { z, defineCollection } from "astro:content";
import { glob } from 'astro/loaders';

const learnSchema = z.object({
  title: z.string(),
  chapterNumber: z.number(),
  chapter: z.string(),
  part: z.number()
});

export type LearnPage = z.infer<typeof learnSchema>;

export const collections = {
  learn: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./public/learn" }),
    schema: learnSchema
  })
};
