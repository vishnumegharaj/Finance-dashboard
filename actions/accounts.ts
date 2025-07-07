"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Decimal } from "@prisma/client/runtime/library";

const serializeBalance = (balance: Decimal) => {
    return balance.toNumber();
};

export async function getAccountById(accountId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorised");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");
    const account = await db.account.findUnique({
        where: {
            id: accountId,
            userId: user.id,
        },
        include: {
            transactions: {
                orderBy: {
                    createdAt: "desc",
                }
            },
            _count: {
                select: {
                    transactions: true,
                },
            },
        }
    });

    if (!account) return null;

    // Serialize the balance before returning
    const serializedAccount = {
        ...account,
        balance: serializeBalance(account.balance),
        transactions: account.transactions.map(transaction => ({
            ...transaction,
            amount: serializeBalance(transaction.amount),
            createdAt: new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        })),
    };

    return {
        success: true,
        data: serializedAccount,
    };
}