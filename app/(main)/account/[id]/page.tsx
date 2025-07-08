import { getAccountById } from '@/actions/accounts';
import React from 'react';

interface AccountParams {
    params: {
        id: string;
    };
}

const AccountPage = async ({ params }: AccountParams) => {
    const result = await getAccountById(params.id);
    if (!result || !result.data) {
        return <div className="p-8 text-center text-lg">Account not found</div>;
    }
    const account = result.data;
    console.log("Account Data:", account);
    return (
        <div className=" p-4">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-6">
                <div className="">
                    <h1 className='text-5xl font-bold text-primary-gradient' >{account.name}</h1>
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
        </div>
    );
};

export default AccountPage;