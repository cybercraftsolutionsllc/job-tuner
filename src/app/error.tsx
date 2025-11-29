'use client' // Error components must be Client Components

import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Something went wrong!</h2>
      <p className="text-slate-500 mb-8">We encountered an error processing your request.</p>
      <button
        onClick={() => reset()}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}