import { defineCollection, z } from 'astro:content';

const cvCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    tagline: z.string().optional(),
    location: z.string(),
    phone: z.string().optional(),
    email: z.string().email(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    updated: z.string(),
  }),
});

export const collections = {
  cv: cvCollection,
};
