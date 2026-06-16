import { z } from 'zod';

const positiveNumber = z.number().positive();

export const warningSchema = z.object({
  offsetSeconds: z.number().nonnegative(),
});

export const eventSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  spawnTime: z.number().nonnegative(),
  repeatEvery: positiveNumber.optional(),
  maxOccurrences: z.number().int().positive().optional(),
  warnings: z.array(warningSchema).optional(),
  icon: z.string().optional(),
});

export const eventsConfigSchema = z.object({
  events: z.array(eventSchema),
});

export type GameEvent = z.infer<typeof eventSchema>;
export type EventsConfig = z.infer<typeof eventsConfigSchema>;
