"use client"
import { useState } from 'react'
import { Button } from './ui/button';
import { logout } from '@/actions/auth';
import { Loader2 } from 'lucide-react';


const Logout = () => {
    const [loading, setLoading] = useState(false);

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await logout();
        window.location.href = "/login";
        setLoading(false);
    }
    return (
        <div>
            <Button disabled={loading} variant={"outline"} onClick={handleLogout}>
                {loading ? (
                    <>
                        <Loader2 className=' h-4 w-4 animate-spin' /> logging out...
                    </>
                ) : "Logout"}
            </Button>
        </div>
    )
}

export default Logout;