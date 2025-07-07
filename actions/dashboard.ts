"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
export type AccountTypeTypes =
  | "personal"
  | "work"
  | "business"
  | "savings"
  | "investment";

export interface Account {
  name: string;
  type: AccountTypeTypes;
  balance: Number;
  isDefault: boolean;
}

export async function createAccount(data: Account) {
  try {
    console.log("Creating account with data:", data);
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorised");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    //convert balance to float before saving
    const balanceFloat = parseFloat(data.balance.toString());
    if (isNaN(balanceFloat)) throw new Error("Invalid balance value");

    const existingAccounts = await db.account.findMany({
      where: {
        userId: user.id,
      },
    });

    const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      // Set all other accounts to not default
      await db.account.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
        userId: user.id,
        balance: balanceFloat,
        isDefault: shouldBeDefault,
      },
    });

    // Serialize the balance before returning
    const serializedAccount = {
      ...account,
      balance: serializeBalance(account.balance),
    };

    return {
      success: true,
      data: serializedAccount,
    };

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message); // Re-throw the error to handle it in the calling function
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

export async function getAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorised");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  const accounts = await db.account.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include:{
      _count: {
        select: {
          transactions: true,
        },  
      },
    }
  });

  // Serialize the balances before returning
  const serializedAccounts = accounts.map(account => ({
    ...account,
    balance: serializeBalance(account.balance),
  }));

  return {
    success: true,
    data: serializedAccounts,
  };
}

const serializeBalance = (balance: Decimal) => {
  return balance.toNumber();
};
