import { db } from "../prisma";
import { inngest } from "./client";

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
                            }
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

                if(percentageUsed >= 80 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))){
                    // send email

                    // update last alert sent in budgets db
                    await db.budget.update({
                        where: {id: budget.id},
                        data: {lastAlertSent : new Date() },
                    })
                }

                const lastAlertSent = budget.lastAlertSent;
                const isAlertSent = lastAlertSent && totalExpenses > budgetAmount;

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

function isNewMonth(lastAlertDate: Date, currentDate: Date){
    return(
        lastAlertDate.getMonth() !== currentDate.getMonth() ||
        lastAlertDate.getFullYear() !== currentDate.getFullYear()
    )
}
