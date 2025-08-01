import { sendEmail } from "@/actions/sendEmails";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "../../emails/template";

interface UserMetaData {
    username?: string;
    full_name?: string;
    name?: string;
    [key: string]: unknown; // Allow other properties
}

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { message: `Hello ${event.data.email}!` };
    },
);

export const SendBudgetAlerts = inngest.createFunction(

    { id: "budget-alerts", name: "Check Budget Alerts" },
    { cron: "0 */6 * * *" },
    async ({ step }) => {
        const budgets = await step.run("get-current-budget", async () => {
            return await db.budget.findMany({
                include: {
                    users: {
                        include: {
                            accounts: {
                                where: {
                                    isDefault: true,
                                }
                            },
                        }
                    }
                }
            })
        });

        for (const budget of budgets) {
            const defaultAccount = budget.users.accounts[0];
            if (!defaultAccount) continue;

            await step.run(`check-budget-${budget.id}`, async () => {
                const startDate = new Date();
                startDate.setDate(1);
                const expenses = await db.transaction.aggregate({
                    where: {
                        userId: budget.userId,
                        accountId: defaultAccount.id,
                        type: "EXPENSE",
                        date: {
                            gte: startDate
                        }
                    },
                    _sum: {
                        amount: true
                    }
                });
                const totalExpenses = expenses._sum.amount?.toNumber() || 0;
                const budgetAmount = Number(budget?.amount);
                const percentageUsed = (totalExpenses / budgetAmount) * 100;

                if (percentageUsed >= 80
                    && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))
                ) {

                    // finding username
                    const userData = budget.users.raw_user_meta_data;
                    let displayName = 'Unknown User';

                    // Type guard to check if userData is an object
                    if (userData && typeof userData === 'object' && !Array.isArray(userData)) {
                        const metaData = userData as UserMetaData;
                        displayName = metaData.username || metaData.full_name || budget.users.email || 'Unknown User';
                    } else {
                        displayName = budget.users.email || 'Unknown User';
                    }


                    // send email
                    await sendEmail({
                        to: budget.users.email || " ",
                        subject: "Budget Alert for " + defaultAccount.name,
                        react: EmailTemplate({
                            userName: displayName,
                            type: "budget-alert",
                            data: {
                                usedPercentage: percentageUsed,
                                budgetAmount,
                                totalExpenses,
                            }
                        }),
                    });

                    // update last alert sent in budgets db
                    await db.budget.update({
                        where: { id: budget.id },
                        data: { lastAlertSent: new Date() },
                    })
                }
            });

            await step.run("send-budget-alert", async () => {
                return await db.budget.update({
                    where: {
                        id: budget.id
                    },
                    data: {
                        lastAlertSent: new Date()
                    }
                })
            });
        }
    },
);

function isNewMonth(lastAlertDate: Date, currentDate: Date) {
    return (
        lastAlertDate.getMonth() !== currentDate.getMonth() ||
        lastAlertDate.getFullYear() !== currentDate.getFullYear()
    )
}

export const triggerRecuringTransactions = inngest.createFunction(
    { id: "trigger-recurring-transactions", name: "Trigger Recurring Transactions" },
    { cron: "0 0 * * *" },
    async ({ step }) => {
        const recurringTransactions = await step.run("get-recurring-transactions", async () => {
            return await db.transaction.findMany({
                where: {
                    isRecurring: true,
                    status: "COMPLETED",
                    OR: [
                        { nextRecurringDate: { lte: new Date() } },
                        { lastProcessed: null }
                    ]
                }
            })
        });

        // create events for each transaction
        if (recurringTransactions.length > 0) {
            const events = recurringTransactions.map(transaction => ({
                name: "transaction/recurring",
                data: {
                    transactionId: transaction.id,
                    userId: transaction.userId,
                }
            }));

            await inngest.send(events);
        }
        return { countTriggered: recurringTransactions.length };
    }
);

export const processRecuringTransactions = inngest.createFunction({
    id: "process-recurring-transactions",
    throttle: {
        limit: 10,
        period: "1m",
        key: "event.data.userId",
    },
}
    , { event: "transaction/recurring" },
    async ({ event, step }) => {
        if (!event.data || !event.data.transactionId || !event.data.userId) {
            console.error("Invalid event data: transactionId and userId are required.");
            return { error: "Invalid event data" };
        }
        const transactionId = event.data.transactionId;
        const userId = event.data.userId;

        await step.run("process-recurring-transaction", async () => {
            const transaction = await db.transaction.findUnique({
                where: { id: transactionId, userId: userId },
                include: { account: true }
            });

            if (!transaction || !isTransactionDue(transaction)) return;

            await db.$transaction(async (tx) => {
                // Create a new transaction based on the recurring transaction
                const { id, account, createdAt, updatedAt, ...transactionData } = transaction;
                const newTransaction = await tx.transaction.create({
                    data: {
                        type: transaction.type,
                        amount: transaction.amount,
                        description: transaction.description,
                        date: new Date(),
                        category: transaction.category,
                        source: transaction.source,
                        userId: transaction.userId,
                        accountId: transaction.accountId,
                        isRecurring: false, // New transaction should not be recurring
                    }
                });

                // Update account balance
                const balanceChange = transaction.type === "INCOME" ? transaction.amount.toNumber() : -transaction.amount.toNumber();
                await tx.account.update({
                    where: { id: transaction.accountId },
                    data: { balance: { increment: balanceChange } }
                });

                await tx.transaction.update({
                    where: { id: transactionId },
                    data: {
                        lastProcessed: new Date(),
                        nextRecurringDate: calculateNextRecurringDate(new Date(), transaction.recurringInterval),
                    }
                })
            });
        });
    },
);

function isTransactionDue(transaction: any): boolean {
    if (!transaction.lastProcessed) return true;

    const today = new Date();
    const nextRecurringDate = new Date(transaction.nextRecurringDate);
    return nextRecurringDate <= today;
}
function calculateNextRecurringDate(startDate: string | number | Date, interval: string | null) {
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
