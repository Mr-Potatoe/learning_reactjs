import { z } from 'zod'

export const userSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
})

export type UserInput = z.infer<typeof userSchema>

