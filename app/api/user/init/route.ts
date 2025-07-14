import { NextRequest, NextResponse } from 'next/server'
import { checkUser } from '@/lib/checkUser'

export async function POST(request: NextRequest) {
  try {
    const user = await checkUser()
    
    if (user) {
      return NextResponse.json({ 
        success: true, 
        message: 'User initialized successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }, {
        headers: {
          'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
        }
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'No user found or not authenticated' 
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Error in user init API:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
} 