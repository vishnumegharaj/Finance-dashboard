import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z.string()
        .min(1, "Password is required")
        .min(8, "Password must Ae at least 8 characters long"),
});

// Signup Schema
export const signupSchema = z.object({
    name: z.string()
        .min(1, "Full name is required")
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z.string()
        .min(1, "Email is required")
        .email("Please enter a valid email address")
        .max(255, "Email cannot exceed 255 characters"),
    password: z.string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters long")
        .max(100, "Password cannot exceed 100 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
    confirmPassword: z.string()
        .min(1, "Please confirm your password"),
    terms: z.boolean()
        .refine((val) => val === true, "You must accept the terms and conditions"),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Passwords do not match",
            path: ["confirmPassword"],
        });
    }
});

export const accountSchema = z.object({
    name: z.string().min(1, "Account name is required"),
    type: z.enum(["personal", "work", "business", "savings", "investment"]),
    balance: z.string().min(1, "Balance must be a positive number"),
    isDefault: z.boolean().optional(),
})

export const transactionSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    source: z.string().min(1, "Source is required"),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account ID is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
    recurringEndDate: z.date().optional(),
}).superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Recurring interval is required for recurring transactions",
            path: ["recurringInterval"],
        });
    }
}); 