"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/Spinner'

interface AuthWrapperProps {
  children: React.ReactNode
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession()
  const [sessionLoaded, setSessionLoaded] = useState(false) // Track session loading status
  const router = useRouter()

  // This effect will run once to set sessionLoaded to true after the session has been loaded
  useEffect(() => {
    if (status !== 'loading') {
      setSessionLoaded(true)
    }
  }, [status])

  // If still loading, show the loading spinner
  if (!sessionLoaded) {
    return <div className="p-10 text-center text-gray-500"><LoadingSpinner size={48} message='hahahhaa' /></div>
  }

  // If unauthenticated, redirect to login
  if (status === 'unauthenticated') {
    router.push('/login')
    return null // Don't render the children until redirected
  }

  return <>{children}</> // Render the wrapped component
}

export default AuthWrapper
