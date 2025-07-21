'use client';
import React, { useState, useEffect } from 'react'
import { AccountInterface } from '../../dashboard/page';

import { getAccounts } from '@/actions/dashboard';
import AddTransactionForm from '../_components/transaction-form';
import { getTransactionById } from '@/actions/transactions';
import { useSearchParams } from 'next/navigation';
import { Transaction } from '@/lib/interface/transaction';


const CreateTransactionPage = () => {
  const searchParams = useSearchParams(); // ✅ get the searchParams object
  const editId = searchParams.get('edit'); // ✅ access query param

  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (editId) {
        try {
          const transactionToEdit = await getTransactionById(editId); // ✅ await the async call
          console.log("Transaction to edit:", transactionToEdit?.data); // ✅ now you can safely access `.data`
          setTransaction(transactionToEdit?.data as Transaction);
        } catch (err) {
          console.error("Error fetching transaction:", err);
        }
      }
    };

    fetchTransaction();
  }, [editId]);

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts();
      console.log("Fetched Accounts:", response.data);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } 
  };

  useEffect(()=>{
    fetchAccounts();
  }, []);

  return (
    <div className='w-fit flex flex-col justify-center items-center mx-auto border border-gray-100 bg-white dark:bg-zinc-900 p-7 rounded-lg shadow'>
      <h1 className="text-5xl text-primary font-bold mb-6">Add Transaction</h1>
      <AddTransactionForm
        accounts={accounts}
        editMode={!!editId}
        transaction={transaction}
      />
    </div>
  );
};

export default CreateTransactionPage;
