'use client';
import React, { useState, useEffect } from 'react'
import { AccountInterface } from '../../dashboard/page';
import { useUserContext } from '@/components/UserProvider';
import { getAccounts } from '@/actions/dashboard';
import AddTransactionForm from '../_components/transaction-form';

const CreateTransactionPage = () => {
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isUserInitialized } = useUserContext();

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

  // Fetch accounts after user is initialized
  useEffect(() => {
    if (isUserInitialized) {
      fetchAccounts();
    }
  }, [isUserInitialized]);
  return (
    <div className='w-fit flex flex-col justify-center items-center mx-auto border border-gray-100 bg-white dark:bg-zinc-900 p-7 rounded-lg shadow'>
      <h1 className="text-5xl text-primary font-bold mb-6">Add Transaction</h1>

      <AddTransactionForm
        accounts={accounts} 
        // isInitialLoading={isInitialLoading} 
        // isRefreshing={isRefreshing} 
        // fetchAccounts={fetchAccounts}
      />
    </div>
  )
}

export default CreateTransactionPage;