'use client'

import { motion } from 'framer-motion'
import React from 'react'
import { cn } from '@/lib/utils' // optional, only if you're using the cn utility

interface LoadingSpinnerProps {
  size?: number
  className?: string
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  className,
  message = 'Loading...',
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-muted-foreground p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('animate-spin text-muted-foreground', className)}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span className="mt-4 text-sm">{message}</span>
    </motion.div>
  )
}

export default LoadingSpinner
