import { z } from "zod"

export const userProfileSchema = z.object({
  name: z.string().min(2, { message: "First name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  location: z.enum(["Ireland", "USA", "UK"], { message: "Invalid location" }),
  phone: z.string()
    .optional() 
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
      message: "Invalid phone number",
    })
});