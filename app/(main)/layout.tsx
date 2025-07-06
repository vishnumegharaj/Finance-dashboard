import React from 'react'

const MainLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className='px-5 py-6'>
            {children}
        </div>
    )
}

export default MainLayout;