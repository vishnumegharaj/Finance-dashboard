// Assuming these enums exist in your codebase
import { 
  Transaction,
  TransactionType,
  RecurringInterval,
  TransactionStatus 
} from '@prisma/client';




// If you need the interface without relations for creation/updates
export interface Transaction {
  id: string;
  type: TransactionType;
  source: string;
  amount: number;
  description?: string;
  date: Date;
  category: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  nextRecurringDate?: Date;
  lastProcessed?: Date;
  status?: TransactionStatus;
  userId: string;
  accountId: string;
}

// For database operations where you might not have all fields
interface TransactionCreate extends Omit<Transaction, 'userId' | 'accountId'> {
  userId: string;
  accountId: string;
}

interface TransactionUpdate extends Partial<Transaction> {
  id: string;
}