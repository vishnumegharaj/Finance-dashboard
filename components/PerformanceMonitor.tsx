"use client"

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Monitor page load performance
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            console.log('🚀 Page Load Time:', navEntry.loadEventEnd - navEntry.loadEventStart, 'ms')
            console.log('⚡ DOM Content Loaded:', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart, 'ms')
            console.log('🔗 Total Navigation Time:', navEntry.loadEventEnd - navEntry.fetchStart, 'ms')
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation'] })
      
      // Monitor API calls
      const originalFetch = window.fetch
      window.fetch = function(...args) {
        const startTime = performance.now()
        const url = args[0] as string
        
        return originalFetch.apply(this, args).then(response => {
          const endTime = performance.now()
          const duration = endTime - startTime
          console.log(`🌐 API Call: ${url} - ${duration.toFixed(2)}ms`)
          return response
        }).catch(error => {
          const endTime = performance.now()
          const duration = endTime - startTime
          console.log(`❌ API Error: ${url} - ${duration.toFixed(2)}ms`)
          throw error
        })
      }
      
      return () => {
        observer.disconnect()
        window.fetch = originalFetch
      }
    }
  }, [])

  return null
} 