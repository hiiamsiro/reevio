import { z } from 'zod';

export const authCredentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});
