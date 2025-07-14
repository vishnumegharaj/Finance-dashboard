"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface UserContextType {
  isUserInitialized: boolean
  initializeUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Simple cache to prevent repeated API calls
const userInitCache = new Map()

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [isUserInitialized, setIsUserInitialized] = useState(false)

  const initializeUser = async () => {
    if (!user || isUserInitialized) return

    const userId = user.id
    const cacheKey = `user_init_${userId}`
    const cacheExpiry = 5 * 60 * 1000 // 5 minutes
    
    // Check cache first
    const cached = userInitCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cacheExpiry) {
      console.log('Using cached user initialization')
      setIsUserInitialized(true)
      return
    }

    try {
      const response = await fetch('/api/user/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        console.log('User initialized successfully')
        // Cache the result
        userInitCache.set(cacheKey, {
          timestamp: Date.now(),
          success: true
        })
        setIsUserInitialized(true)
      }
    } catch (error) {
      console.error('Error initializing user:', error)
      setIsUserInitialized(true) // Mark as initialized even if there's an error
    }
  }

  useEffect(() => {
    if (isLoaded && user && !isUserInitialized) {
      initializeUser()
    }
  }, [user, isLoaded, isUserInitialized])

  return (
    <UserContext.Provider value={{ isUserInitialized, initializeUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
} 