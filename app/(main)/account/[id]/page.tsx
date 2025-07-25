'use client'

import React, { useState, useEffect, use, useCallback } from 'react';
import { getAccountById } from '@/actions/accounts';
import TransactionTable from '../_components/transaction-table';
import { BarLoader } from 'react-spinners';
import { Transaction } from '@/lib/interface/transaction';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


interface AccountParams {
    params: Promise<{
        id: string;
    }>;
}

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    _count: {
        transactions: number;
    };
    transactions: Transaction[]; // Replace with proper Transaction type
}

const AccountPage = ({ params }: AccountParams) => {
    const resolvedParams = use(params);
    const [account, setAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]); // Local state for transactions
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Accept skipLoading argument to avoid spinner on silent refresh
    const fetchAccount = useCallback(async (skipLoading: boolean) => {
        try {
            if (!skipLoading) setLoading(true);
            setError(null);

            const result = await getAccountById(resolvedParams.id);

            if (!result || !result.data) {
                setError('Account not found');
                return;
            }
            setAccount(result.data);
            setTransactions(result.data.transactions || []); // Set local transactions
            console.log("Account Data:", result.data);
        } catch (err) {
            console.error('Error loading account:', err);
            setError('Error loading account');
        } finally {
            if (!skipLoading) setLoading(false);
        }
    }, [resolvedParams.id]);

    useEffect(() => {
        fetchAccount(false);
    }, [fetchAccount]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-4">
                    <BarLoader className='mt-4' width={"100%"} color="#3b82f6" />
                    <div className="text-blue-700 text-sm font-medium">Loading account...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center text-lg text-red-600">
                {error}
                <button
                    onClick={() => fetchAccount(false)}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    // No account found
    if (!account) {
        return <div className="p-8 text-center text-lg">Account not found</div>;
    }

    // Pass a silent refresh function to TransactionTable
    const refreshAccount = () => fetchAccount(true);
    // Button handler for manual refresh (with loading)
    const handleRefreshClick = () => { fetchAccount(false); };

    return (
        <div>
            {/* account details */}
            <div className="flex flex-col sm:flex-row items-start justify-between mb-2">
                <div className="">
                    <h1 className='text-5xl font-bold text-primary-gradient'>{account.name}</h1>
                    <div className="text-lg text-muted-foreground mb-4">
                        {account.type.toLowerCase()} Account
                    </div>
                </div>
                <div className="">
                    <div className="text-3xl font-bold text-green-700 mb-2">
                        ₹{account.balance.toLocaleString()}
                    </div>
                    <p>{account._count.transactions} Transactions</p>
                </div>
            </div>

            <Link href="/transaction/create" >
                <Button className='mb-6'>
                    <span>Add Transaction</span>
                </Button>
            </Link>

            {/* transaction table */}
            <TransactionTable
                transactions={transactions}
                refreshAccount={refreshAccount} // Pass silent refresh
            />

            {/* Optional: Refresh button */}
            <button
                onClick={handleRefreshClick}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
                Refresh Data
            </button>
        </div>
    );
};

export default AccountPage;