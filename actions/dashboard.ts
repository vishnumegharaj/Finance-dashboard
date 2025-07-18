"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { getAuthenticatedUser } from "./auth";
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
    const supabaseUser = await getAuthenticatedUser();
    const userId = supabaseUser.id; // UUID from auth.users

    //convert balance to float before saving
    const balanceFloat = parseFloat(data.balance.toString());
    if (isNaN(balanceFloat)) throw new Error("Invalid balance value");

    const existingAccounts = await db.account.findMany({
      where: { userId },
    });

    const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      // Set all other accounts to not default
      await db.account.updateMany({
        where: { userId, isDefault: true },
        data: {
          isDefault: false,
        },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
        userId,
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
  console.log("fetching accounts ")
  const supabaseUser = await getAuthenticatedUser();
  const userId = supabaseUser.id; 

  const accounts = await db.account.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
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

   console.log("fetching completed ")
  return {
    success: true,
    data: serializedAccounts,
  };
}

const serializeBalance = (balance: Decimal) => {
  return balance.toNumber();
};
