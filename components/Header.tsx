import React from 'react'
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'
import Link from 'next/link';
import { Button } from './ui/button';
import { checkUser } from '@/lib/checkUser';

const Header = async () => {
    await checkUser();
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 h-15 flex items-center justify-between px-8 sm:px-6 lg:px-20 shadow-md">

            <nav>
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        💰
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        FinanceFlow
                    </span>
                </Link>
            </nav>

            <div className="flex items-center gap-4">
                <SignedIn>
                    <Link href="/dashboard" className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors">
                        <span className='hidden md:inline'> Dashboard </span>
                    </Link>
                    <Link href="/transactions" className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors">
                        <span className='hidden md:inline'> Transactions </span>
                    </Link>
                    <Link href="/settings" className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors">
                        <span className='hidden md:inline'> Settings </span>
                    </Link>
                </SignedIn>
            </div>

            <div className="flex items-center gap-4">
                <SignedOut>
                    <SignInButton forceRedirectUrl={"/dashboard"}>
                        <Button variant={"outline"} className="bg-white text-primary border border-primary cursor-pointer">
                            Login
                        </Button>
                    </SignInButton>
                    <SignUpButton>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer">
                            Sign Up
                        </Button>   
                    </SignUpButton>
                </SignedOut>
                <SignedIn>
                    
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: 'w-20 h-20',
                            },
                        }}
                    />
                </SignedIn>
            </div>
        </header>
    );
}

export default Header