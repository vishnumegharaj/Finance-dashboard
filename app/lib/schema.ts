import {z} from 'zod';

export const accountSchema = z.object({
    name: z.string().min(1, "Account name is required"),
    type: z.enum(["SAVINGS", "CURRENT"]),
    balance: z.string().min(1, "Balance must be a positive number"),
    isDefault: z.boolean().default(false),
})