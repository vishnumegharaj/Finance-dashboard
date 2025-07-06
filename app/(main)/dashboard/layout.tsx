import React, {Suspense} from 'react'
import DashboardPage from './page';
import {BarLoader} from 'react-spinners';
const DashboardLayout = () => {
    return (
        <div className=''>
            <h1 className='text-6xl font-bold text-primary mb-2' >DashBoard</h1>

            {/* Suspense is used to handle the loading state of the DashboardPage component */}
            <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color="primary" />}>
                <DashboardPage />
            </Suspense>
        </div>
    )
}

export default DashboardLayout;