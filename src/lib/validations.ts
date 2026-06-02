import * as z from 'zod';

// Base Team schema (currently unused but available for future use)
// const teamSchema = z.object({
//   name: z.string().min(1, "Team name is required"),
//   code: z.string().length(3, "Team code must be exactly 3 characters").toUpperCase(),
//   flag: z.string().min(1, "Flag icon/emoji is required")
// });

// Event Settings schema
const eventSettingsSchema = z.object({
  ticketLimitPerUser: z.number().int().min(1),
  allowResale: z.boolean(),
  requireId: z.boolean()
});

export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  tournament: z.string().min(2, "Tournament name is required"),
  date: z.string().refine(str => !isNaN(Date.parse(str)), "Invalid date format"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM format"),
  venue: z.string().min(2, "Venue is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  state: z.string().optional(),
  stage: z.string().min(2, "Stage is required"),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
  image: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  description: z.string().optional(),
  priceMin: z.coerce.number().min(0, "Min price cannot be negative"),
  priceMax: z.coerce.number().min(0, "Max price cannot be negative"),
  ticketsLeftPercent: z.coerce.number().min(0).max(100).default(100),
  team1Name: z.string().min(1, "Team 1 name is required"),
  team1Flag: z.string().min(1, "Team 1 flag is required"),
  team1Code: z.string().length(3, "Code must be 3 chars").toUpperCase(),
  team2Name: z.string().min(1, "Team 2 name is required"),
  team2Flag: z.string().min(1, "Team 2 flag is required"),
  team2Code: z.string().length(3, "Code must be 3 chars").toUpperCase(),
  settings: eventSettingsSchema.default({
    ticketLimitPerUser: 4,
    allowResale: true,
    requireId: false
  })
});

export type CreateEventPayload = z.infer<typeof createEventSchema>;

// Create Section Validation Schema
export const createSectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  available: z.coerce.number().int().min(0, "Available tickets cannot be negative"),
  row: z.string().min(1, "Row is required"),
  features: z.string().optional(),
  sectionImage: z.string().url("Must be a valid URL").optional().or(z.literal(''))
});

export type CreateSectionPayload = z.infer<typeof createSectionSchema>;
