import React from 'react'
import { SignUp } from '@clerk/nextjs'

const page = () => {
  return (
    <div>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer',
          },
        }}
      />
    </div>
  )
}

export default page