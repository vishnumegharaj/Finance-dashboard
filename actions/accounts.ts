"use server";
import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { getAuthenticatedUser } from "./auth";

const serializeBalance = (balance: Decimal) => {
    return balance.toNumber();
};

export async function getAccountById(accountId: string) {
    const supabaseUser = await getAuthenticatedUser();
    const userId = supabaseUser.id; // UUID from auth.users

    const account = await db.account.findUnique({
        where: {
            id: accountId,
            userId
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