import React from 'react'
import { getUserSession } from '@/actions/auth';
import { redirect } from 'next/navigation';

const AuthLayout = async({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const response = await getUserSession();
    
    if(response) {
        redirect("/")
    }
    return (
        <div className='flex items-center justify-center py-10'>
            {children}
        </div>
    )
}

export default AuthLayout;