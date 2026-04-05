import { z } from 'zod';

export const trendsQuerySchema = z.object({
  period: z.enum(['month', 'week']).optional().default('month'),
});

export type TrendsQueryInput = z.infer<typeof trendsQuerySchema>;
