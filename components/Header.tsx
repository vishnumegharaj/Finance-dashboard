"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { createClient } from '@/utils/supabase/client'; // Make sure this is the client-side version
import Logout from './logout';
import type { User } from '@supabase/supabase-js'; // Add this import
import Image from 'next/image';


const Header = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 h-15 flex items-center justify-between px-8 sm:px-6 lg:px-20 shadow-md">

            <nav>
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/images/logo.png"
                        alt="FinanceFlow Logo"
                        width={36}  // same as w-9 (9 * 4px = 36px)
                        height={36} // same as h-9
                        className="w-9 h-9"
                    />
                    <span className="font-bold text-xl text-primary-gradient bg-clip-text text-transparent">
                        FinanceFlow
                    </span>
                </Link>
            </nav>

            <div className="flex items-center gap-4">
                <Link href="/dashboard" prefetch={true} className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors">
                    <span className='hidden md:inline'> Dashboard </span>
                </Link>
                <Link href="/transaction/create" prefetch={true} className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors">
                    <span className='hidden md:inline'> Transactions </span>
                </Link>
                {/* <Link href="/settings" className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors">
                    <span className='hidden md:inline'> Settings </span>
                </Link> */}
            </div>

            {!user ? (
                <div className="flex items-center gap-4">
                    <Link href="/login" prefetch={true}>
                        <Button variant={"outline"} className="">
                            Login
                        </Button>
                    </Link>
                    <Link href="/sign-up" prefetch={true}>
                        <Button className="" >
                            Sign Up
                        </Button>
                    </Link>
                </div>
            ) : (
                <Logout />
            )}
        </header>
    );
}

export default Header