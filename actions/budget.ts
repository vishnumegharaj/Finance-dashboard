"use server";
import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { getAuthenticatedUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId: string) {
    try {
        const supabaseUser = await getAuthenticatedUser();
        const userId = supabaseUser.id; // UUID from auth.users

        const budget = await db.budget.findFirst({
            where: {
                userId
            }
        });

        const currrentDate = new Date();
        const startOfMonth = new Date(
            currrentDate.getFullYear(),
            currrentDate.getMonth(),
            1
        );
        const endOfMonth = new Date(
            currrentDate.getFullYear(),
            currrentDate.getMonth() + 1,
            0
        )

        const expenses = await db.transaction.aggregate({
            where: {
                userId,
                accountId,
                type: "EXPENSE",
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            _sum: {
                amount: true
            }
        })
        return {
            budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
            expenses: expenses._sum.amount ? expenses._sum.amount.toNumber() : 0
        }

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unknown error occurred");
        }
    }
}

export async function updateBudget(amount: number) {
    try {
        const supabaseUser = await getAuthenticatedUser();
        const userId = supabaseUser.id;

        const budget = await db.budget.upsert({
            where: {
                userId
            },
            update: {
                amount
            },
            create: {
                userId,
                amount
            }
        });

        revalidatePath("/dashboard");

        return {
            success: true,
            data: { ...budget, amount: budget.amount.toNumber() }
        }
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: true,
                error: error.message
            }
        } else {
            return {
                success: true,
                error: "An unknown error occurred"
            }
        }
    }

}