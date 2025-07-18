"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

// const ACCOUNT_ID = "19ae0fce-f0c5-4eba-9a08-20d02604e4f5";
// const USER_ID = "1cc454fe-ae1d-4965-922a-f60f5ec6fe68";

// Categories with amount ranges
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// Sources for transactions
const SOURCES = {
  INCOME: [
    "Employer Payroll",
    "Freelance Client",
    "Broker Payout",
    "Investment Return",
    "Refund Credit",
    "Bonus",
  ],
  EXPENSE: {
    housing: ["Landlord", "RentCo", "Mortgage Bank"],
    transportation: ["Uber", "Ola", "Metro Card", "Fuel Station"],
    groceries: ["BigBazaar", "Reliance Fresh", "Local Market"],
    utilities: ["Electric Board", "Water Dept", "Internet Provider"],
    entertainment: ["Netflix", "Hotstar", "Movie Ticket"],
    food: ["Swiggy", "Zomato", "Restaurant"],
    shopping: ["Amazon", "Flipkart", "Local Store"],
    healthcare: ["Pharmacy", "Clinic", "Hospital"],
    education: ["Online Course", "Books Store", "Training Center"],
    travel: ["IRCTC", "Airline", "Bus Booking"],
    "other-income": ["Misc Credit"],
  },
};

// Helpers
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const cat = getRandomFrom(categories);
  const amount = getRandomAmount(cat.range[0], cat.range[1]);
  return { category: cat.name, amount };
}

function getSource(type, category) {
  if (type === "INCOME") {
    return getRandomFrom(SOURCES.INCOME);
  }
  const pool = SOURCES.EXPENSE[category] || ["Vendor", "Merchant", "Payment"];
  return getRandomFrom(pool);
}

// Main seeder
export async function seedTransactions() {
  try {
    const transactions = [];
    let totalBalance = 0;

    // Generate 90 days of transactions
    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const txCount = Math.floor(Math.random() * 3) + 1; // 1-3 per day

      for (let j = 0; j < txCount; j++) {
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);
        const source = getSource(type, category);

        const desc =
          type === "INCOME"
            ? `Received ${category} from ${source}`
            : `Paid ${source} for ${category}`;

        transactions.push({
          id: crypto.randomUUID(),
          type,
          source,
          amount,
          description: desc,
          date,
          category,
          receiptUrl: null,
          isRecurring: false,
          recurringInterval: null,
          nextRecurringDate: null,
          lastProcessed: null,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        });

        totalBalance += type === "INCOME" ? amount : -amount;
      }
    }

    // 1. Clear existing transactions
    await db.transaction.deleteMany({ where: { accountId: ACCOUNT_ID } });

    // 2. Insert new transactions in chunks
    const chunkSize = 500;
    for (let i = 0; i < transactions.length; i += chunkSize) {
      const chunk = transactions.slice(i, i + chunkSize);
      await db.transaction.createMany({ data: chunk });
    }

    // 3. Update account balance
    await db.account.update({
      where: { id: ACCOUNT_ID },
      data: { balance: totalBalance },
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions.`,
      balance: totalBalance,
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}
