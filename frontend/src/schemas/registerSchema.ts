import { z } from "zod";

export const registerSchema = z.object({
    name: z
      .string()
      .max(50, "Name must be less than 50 characters")
      .regex(/^[A-Za-z\s]+$/, "Name must contain only letters")
      .refine((val) => val.trim().length > 0, { message: "Name is required" }),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  });