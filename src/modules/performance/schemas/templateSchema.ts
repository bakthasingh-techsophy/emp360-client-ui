/**
 * Template Form Validation Schema
 * Zod schema for performance template creation and editing
 */

import { z } from 'zod';

export const templateColumnSchema = z.object({
  id: z.string().min(1, 'Column ID is required'),
  name: z.string().min(1, 'Column name is required').max(100, 'Column name must be less than 100 characters'),
  columnType: z.enum(['TEXT', 'NUMBER', 'RATING', 'SELECT', 'CALCULATED'], {
    errorMap: () => ({ message: 'Invalid column type' }),
  }),
  type: z.string().optional(),
  mandatory: z.boolean().default(false),
  ratingRange: z.object({
    min: z.number().min(1, 'Minimum rating must be at least 1'),
    max: z.number().min(1, 'Maximum rating must be at least 1'),
  }).optional(),
  options: z.array(z.string().min(1, 'Option cannot be empty')).optional(),
  calculationFormula: z.string().optional(),
  displayOrder: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const templateRowSchema = z.object({
  id: z.string().min(1, 'Row ID is required'),
  label: z.string().min(1, 'Row label is required').max(100, 'Row label must be less than 100 characters'),
  weightage: z.number().min(0, 'Weightage cannot be negative').optional(),
  displayOrder: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const templateFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Template title is required')
    .min(3, 'Template title must be at least 3 characters')
    .max(150, 'Template title must be less than 150 characters'),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform((val) => val || ''),
  
  department: z
    .string()
    .min(1, 'Department is required'),
  
  columns: z
    .array(templateColumnSchema)
    .min(1, 'At least one column is required')
    .max(50, 'Maximum 50 columns allowed'),
  
  rows: z
    .array(templateRowSchema)
    .min(1, 'At least one row is required')
    .max(100, 'Maximum 100 rows allowed'),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;
