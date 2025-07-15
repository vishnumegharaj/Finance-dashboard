import { is } from 'date-fns/locale';
import { z } from 'zod';

export const accountSchema = z.object({
    name: z.string().min(1, "Account name is required"),
    type: z.enum(["personal", "work", "business", "savings", "investment"]),
    balance: z.string().min(1, "Balance must be a positive number"),
    isDefault: z.boolean().default(false),
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