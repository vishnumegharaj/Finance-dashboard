import React from 'react'

const MainLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className='bg-white px-6 py-6'>
            {children}
        </div>
    )
}

export default MainLayout;