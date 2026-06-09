import { z } from 'zod'

export const graffitiTypes = ['tag', 'throw-up', 'sticker', 'stencil', 'piece', 'mural'] as const

export const entrySchema = z.object({
  writer_name: z.string().min(1, 'writer_name is required').max(100),
  type: z.enum(graffitiTypes, {
    error: 'type must be one of: tag, throw-up, sticker, stencil, piece, mural',
  }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  location_label: z.string().max(255).optional(),
  date_spotted: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_spotted must be YYYY-MM-DD'),
  ai_suggested_name: z.string().max(100).nullable().optional(),
  ai_detection_id: z.string().max(100).nullable().optional(),
  bounding_box: z
    .object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() })
    .nullable()
    .optional(),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const entryFiltersSchema = z.object({
  writer: z.string().optional(),
  type: z.enum(graffitiTypes).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bbox: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/).optional(),
  cursor: z.string().optional(),
})
