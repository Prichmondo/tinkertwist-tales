import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const eventsCollection = defineCollection({
  loader: glob({ 
    pattern: "**/*.{md,mdoc}",
    base: "./src/content/events" 
  }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    date: z.date(),
  }),
});

const locationsCollection = defineCollection({
  loader: glob({ 
    pattern: "**/*.{md,mdoc}",
    base: "./src/content/locations" 
  }),
  schema: z.object({
    name: z.string(),
    region: z.string(),
    image: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export const collections = {
  events: eventsCollection,
  locations: locationsCollection,
};