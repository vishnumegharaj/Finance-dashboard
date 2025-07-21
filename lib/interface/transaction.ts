// Assuming these enums exist in your codebase
import { 
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
  description?: string | null;
  date: Date;
  category: string;
  receiptUrl?: string | null;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval | null;
  nextRecurringDate?: Date | null;
  lastProcessed?: Date | null;
  status?: TransactionStatus | null;
  userId: string;
  accountId: string;
}