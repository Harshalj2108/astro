import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>

        {/* Content */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-4">
            Authentication Error
          </h1>
          <p className="text-purple-200/80 mb-6">
            There was a problem signing you in. This could happen if the link expired or was already used.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/signup"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Try Again
            </Link>
            <Link 
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 text-purple-200 font-medium hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
