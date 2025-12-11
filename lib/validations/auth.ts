import { z } from 'zod'

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  password: z.string().min(1, 'Password is required').optional(),
}).refine(data => data.email || data.phoneNumber, {
  message: 'Either email or phone number is required',
  path: ['email'],
})

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().optional(),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
  useOtp: z.boolean().default(false),
})

export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
