"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { _success } from "zod/v4/core";


export async function DeleteManyTransaction(transactionIds: string[]) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorised");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        const transactions = await db.transaction.findMany({
            where: {
                id: {
                    in: transactionIds,
                },
                userId: user.id,
            }
        })

        const accountBalanceChanges = transactions.reduce<Record<string, number>>((acc, transaction) => {
            if (transaction.type === "INCOME") {
                acc[transaction.accountId] = (acc[transaction.accountId] ?? 0) - Number(transaction.amount);
            } else if (transaction.type === "EXPENSE") {
                acc[transaction.accountId] = (acc[transaction.accountId] ?? 0) + Number(transaction.amount);
            }
            return acc;
        }, {});

        // Delete transactions
        await db.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
                where: {
                    id: {
                        in: transactionIds,
                    },
                    userId: user.id,
                }

            });

            for (const [accountId, BalanceChange] of Object.entries(accountBalanceChanges)) {
                await tx.account.update({
                    where: { id: accountId, userId: user.id },
                    data: {
                        balance: {
                            increment: BalanceChange,
                        },
                    },
                });
            }
        })

        revalidatePath(`/dashboard`);
        revalidatePath(`/account/[id]`);

        return {
            success: true,
            message: "Transactions deleted successfully",
        }
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unexpected error occurred." };
    }
}