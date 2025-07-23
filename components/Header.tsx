// components/header.tsx  (Server Component)
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { LayoutDashboard, Receipt } from "lucide-react";
import Logout from './logout'

export const dynamic = 'force-dynamic' // ensures no static caching of auth state; optional but helpful

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log("Header SSR User:", user);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 h-15 flex items-center justify-between px-8 sm:px-6 lg:px-20 shadow-md">
      {/* Logo */}
      <nav>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Fintrix Logo"
            width={36}
            height={36}
            className="w-9 h-9"
          />
          <span className="font-bold text-2xl text-primary-gradient bg-clip-text text-transparent">
            Fintrix
          </span>
        </Link>
      </nav>

      {user && (
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            prefetch
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            {/* Icon for mobile */}
            <LayoutDashboard className="w-5 h-5 md:hidden" />
            {/* Text for desktop */}
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link
            href="/transaction/create"
            prefetch
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <Receipt className="w-5 h-5 md:hidden" />
            <span className="hidden md:inline">Transactions</span>
          </Link>
        </div>
      )}

      {/* Right‑side Auth Controls */}
      {user ? (
        <div className="flex items-center gap-4">

          {/* Logout Button */}
          <Logout/>

          {/* Avatar or Initial */}
          {user.user_metadata?.avatar_url ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 shadow-sm">
              <Image
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name || "User"}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-sm font-bold">
              {user?.user_metadata?.full_name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                'G'}
            </div>
          )}

        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/login" prefetch>
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/sign-up" prefetch>
            <Button>Sign Up</Button>
          </Link>
        </div>
      )}


    </header>
  )
}
