"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getAuthenticatedUser() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorised");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    return user;
} 