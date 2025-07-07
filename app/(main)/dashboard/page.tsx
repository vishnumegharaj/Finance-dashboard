"use client";

import CreateAccountDialog from '@/components/ui/CreateAccountDialog';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAccounts } from '@/actions/dashboard';
import { AccountCard } from './components/AccountCard';
import { AccountTypeTypes } from '@/actions/dashboard';
import { Banknote, Star, User, Briefcase, PiggyBank, Wallet } from "lucide-react";

function DashboardPage() {
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);

  const fetchAccounts = async () => {
    const response = await getAccounts();
    setAccounts(response.data);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);
  // Dummy income/expense for demo
  const dummyData = [
    { income: '₹5,000.00', expense: '₹2,000.00', icon: <Briefcase />, typeColor: 'bg-purple-100 text-purple-700' },
    { income: '₹2,500.00', expense: '₹1,200.00', icon: <User />, typeColor: 'bg-blue-100 text-blue-700' },
    { income: '₹10,000.00', expense: '₹500.00', icon: <PiggyBank />, typeColor: 'bg-yellow-100 text-yellow-700' },
    { income: '₹3,000.00', expense: '₹1,000.00', icon: <Wallet />, typeColor: 'bg-green-100 text-green-700' },
  ];
  return (
    <div className=''>
      {/* Budget progress */}
      {/* Overview */}
      {/* Accounts */}
      <div>
        <CreateAccountDialog fetchAccounts={fetchAccounts}>
          <Button asChild>
            <span>Add account</span>
          </Button>
        </CreateAccountDialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {accounts.map((account: AccountInterface) => {
          const formattedAccount = {
            ...account,
            createdAt: new Date(account.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            balance: `₹${account.balance.toLocaleString()}`,
          };
          return <AccountCard key={account.id} account={formattedAccount} />;
        })}
      </div>
      {/* Transactions */}
    </div>
  )
}

export type AccountInterface = {
  id: string;
  name: string;
  type: AccountTypeTypes;
  balance: number;
  isDefault: boolean;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export default DashboardPage;