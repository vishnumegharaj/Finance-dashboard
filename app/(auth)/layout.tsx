import React from 'react'

const AuthLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className='flex items-center justify-center py-10'>
            {children}
        </div>
    )
}

export default AuthLayout;