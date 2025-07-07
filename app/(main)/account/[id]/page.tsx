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
            {/* <div>
                <h2 className="font-semibold text-lg mb-2">Recent Transactions</h2>
                {account.transactions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No transactions for this account.</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {account.transactions.map((tx: any) => (
                            <Card key={tx.id} className="flex flex-row items-center justify-between p-3">
                                <div className="flex items-center gap-2">
                                    {tx.type === 'INCOME' ? (
                                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                                    )}
                                    <div>
                                        <div className="font-medium text-sm">{tx.description || tx.category}</div>
                                        <div className="text-xs text-muted-foreground">{tx.createdAt}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={tx.type === 'INCOME' ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                                        {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                    </span>
                                    <Badge variant="outline" className="capitalize px-2 py-0.5 text-xs mt-1">
                                        {tx.status.toLowerCase()}
                                    </Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div> */}
        </div>
    );
};

export default AccountPage;