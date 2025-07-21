"use client";

import CreateAccountDialog from '@/components/ui/CreateAccountDialog';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAccounts } from '@/actions/dashboard';
import { AccountCard } from './components/AccountCard';
import { AccountTypeTypes } from '@/actions/dashboard';
import { BarLoader } from 'react-spinners/';

function DashboardPage() {
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchAccounts = async () => {
    try {
      setIsRefreshing(true);
      const response = await getAccounts();
      console.log("Fetched Accounts:", response.data);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() =>{
    fetchAccounts();
  }, [])

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-3 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-blue-700 text-sm font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className=''>
      {isRefreshing && <BarLoader className='mt-4' width={"100%"} />}
      
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