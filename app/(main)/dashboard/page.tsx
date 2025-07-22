"use client";

import CreateAccountDialog from '@/components/ui/CreateAccountDialog';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAccounts } from '@/actions/dashboard';
import { AccountCard } from './components/AccountCard';
import { AccountTypeTypes } from '@/actions/dashboard';
import { createClient } from '@/utils/supabase/client';

function DashboardPage() {
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUser(data.user.user_metadata);
      }
    };

    fetchUser();
  }, []);

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

  useEffect(() => {
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

      <div className="relative w-full rounded-2xl  py-6 pl-2">
        <div className="flex items-center gap-4">
          {/* <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {user?.username?.[0]?.toUpperCase() || user?.full_name?.[0]?.toUpperCase() || 'G'}
          </div> */}
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Welcome, {user?.username || user?.full_name || "Guest"}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Glad to have you back. Let’s manage your finances efficiently.
            </p>
          </div>
        </div>
      </div>

      <div>
        <CreateAccountDialog fetchAccounts={fetchAccounts}>
          <Button asChild>
            <span>Add account</span>
          </Button>
        </CreateAccountDialog>
      </div>

      {isRefreshing &&
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-3 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-blue-700 text-sm font-medium">Loading accounts...</div>
          </div>
        </div>}

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