"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { _success } from "zod/v4/core";
import { Transaction } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";


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

export async function CreateTransaction(data: Transaction) {
    try {
        console.log("Creating transaction with data:", data);
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorised");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        //arcjet to add rate limiting

        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id,
            }
        });

        if (!account) throw new Error("Account not found");

        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null,
                }
            })
            return newTransaction
        });

        // Update account balance
        const balanceChange = data.type === "INCOME" ? data.amount : -data.amount;

        await db.account.update({
            where: { id: data.accountId },
            data: {
                balance: {
                    increment: balanceChange,
                },
            },
        });

        revalidatePath(`/dashboard`);
        revalidatePath(`/account/${data.accountId}`);

        return {
            success: true,
            data: {
                ...transaction,
                amount: transaction.amount.toNumber(), // Serialize amount
            },
        };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function getTransactionById(transactionId: string) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorised");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        const transaction = await db.transaction.findUnique({
            where: {
                id: transactionId,
                userId: user.id,
            },
            include: {
                account: true,
            }
        });

        if (!transaction) return null;

        // Serialize the amount before returning
        const serializedTransaction = {
            ...transaction,
            amount: transaction.amount.toNumber(),
            account: {
                ...transaction.account,
                balance: serializeBalance(transaction.account.balance), // Convert Decimal to number
            },
        };

        return {
            success: true,
            data: serializedTransaction,
        };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unexpected error occurred." };
    }

}

export async function updateTransactionById(transactionId: string, data: Transaction) {
    try {
        console.log("inside updating....", data);
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorised");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        const transaction = await db.transaction.findUnique({
            where: {
                id: transactionId,
                userId: user.id,
            },
        });

        if (!transaction) throw new Error("Transaction not found");

        const oldBalanceChange = transaction.type === "INCOME" ? transaction.amount.toNumber() : -transaction.amount.toNumber();

        const newBalanceChange = data.type === "INCOME"
            ? Number(data.amount)
            : -Number(data.amount);

        const netBalanceChange = newBalanceChange - oldBalanceChange;

        const updatedTransaction = await db.$transaction(async (tx) => {
            const updated = await tx.transaction.update({
                where: {
                    id: transactionId,
                    userId: user.id,
                },
                data: {
                    ...data,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null,
                },
            });

            await tx.account.update({
                where: { id: data.accountId },
                data: {
                    balance: {
                        increment: netBalanceChange,
                    },
                },
            });
            return updated;
        });


        revalidatePath(`/dashboard`);
        revalidatePath(`/account/${data.accountId}`);

        return {
            success: true,
            data: {
                ...updatedTransaction,
                amount: updatedTransaction.amount.toNumber(),
            },
        };
    } catch (error) {
        console.warn("error updating trans", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: error };
    }

}

const serializeBalance = (balance: Decimal) => {
    return balance.toNumber();
};

function calculateNextRecurringDate(startDate: string | number | Date, interval: string) {
    const date = new Date(startDate);

    switch (interval) {
        case "DAILY":
            date.setDate(date.getDate() + 1);
            break;
        case "WEEKLY":
            date.setDate(date.getDate() + 7);
            break;
        case "MONTHLY":
            date.setMonth(date.getMonth() + 1);
            break;
        case "YEARLY":
            date.setFullYear(date.getFullYear() + 1);
            break;
    }

    return date;
}