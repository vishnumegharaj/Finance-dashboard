import React from 'react'

const MainLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className='bg-white py-6 px-8 sm:px-6 lg:px-20'>
            {children}
        </div>
    )
}

export default MainLayout;