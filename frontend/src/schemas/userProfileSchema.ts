import { z } from "zod"

export const userProfileSchema = z.object({
  name: z.string()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(20, { message: "First name must be at most 50 characters long" }),
    
  email: z.string()
    .email({ message: "Invalid email address" }),
    
  location: z.enum(["Ireland", "USA", "UK"], { message: "Invalid location" }),
  
  phone: z.string()
    .max(15, { message: "Phone number must be at most 15 digits long" }) 
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
      message: "Invalid phone number",
    })
});
