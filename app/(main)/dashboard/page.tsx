'client'
import CreateAccountDialog from '@/components/ui/CreateAccountDialog';
import React from 'react'
import { Button } from '@/components/ui/button';
const DashboardPage = () => {
  return (
    <div className=''>
      content

      {/* Budget progress */}

      {/* Overview */}

      {/* Accounts */}
      <div>
        <CreateAccountDialog >
          <Button asChild>
            <span>Add account</span>
          </Button>
        </CreateAccountDialog>
      </div>


      {/* Transactions */}
    </div>
  )
}

export default DashboardPage;