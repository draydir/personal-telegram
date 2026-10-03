import { z } from "zod";

export const notifySchema = z.object({
  text: z.string().trim().min(1).max(4096),
  chatId: z.union([z.string(), z.number()]).optional(),
  source: z.string().trim().max(120).optional(),
});
