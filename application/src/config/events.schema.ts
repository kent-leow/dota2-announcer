import { z } from 'zod';

const positiveNumber = z.number().positive();

export const warningSchema = z.object({
  offsetSeconds: z.number().nonnegative(),
});

export const eventSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['fixed', 'dynamic']).optional(),
  spawnTime: z.number().nonnegative(),
  repeatEvery: positiveNumber.optional(),
  maxOccurrences: z.number().int().positive().optional(),
  warnings: z.array(warningSchema).optional(),
  icon: z.string().optional(),
});

export const roshanNotificationsSchema = z.object({
  kill: z.boolean(),
  countdown: z.boolean(),
  respawn: z.boolean(),
});

export const dynamicEventNotificationsSchema = z.record(z.boolean());

export const dynamicEventConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  enabled: z.boolean(),
  notifications: dynamicEventNotificationsSchema,
});

export const dynamicEventsConfigSchema = z.object({
  dynamicEvents: z.array(dynamicEventConfigSchema),
});

export const eventsConfigSchema = z.object({
  events: z.array(eventSchema),
  dynamicEvents: z.array(dynamicEventConfigSchema).optional(),
});

export type GameEvent = z.infer<typeof eventSchema>;
export type DynamicEventConfig = z.infer<typeof dynamicEventConfigSchema>;
export type DynamicEventsConfig = z.infer<typeof dynamicEventsConfigSchema>;
export type EventsConfig = z.infer<typeof eventsConfigSchema>;
