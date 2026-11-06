import { z } from "zod";

const date = z.iso.date();
const amount = z
  .number()
  .finite()
  .min(0)
  .max(999999999.99)
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001,
    "Не более двух знаков после запятой",
  );
export const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  budget: amount,
  start_date: date,
  team_size: z.number().int().min(1).max(10000),
});
export const taskSchema = z.object({
  project_id: z.number().int().positive(),
  title: z.string().trim().min(1).max(160),
  cost: amount,
  due_date: date,
  priority: z.number().int().min(1).max(3),
});
export const idSchema = z.coerce.number().int().positive();
export const pageSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(10000000).default(0),
});
