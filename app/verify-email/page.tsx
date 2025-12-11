import { Sparkles, Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-6 shadow-lg shadow-purple-500/30">
          <Mail className="w-10 h-10 text-white" />
        </div>

        {/* Content */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-4">
            Check Your Email
          </h1>
          <p className="text-purple-200/80 mb-6">
            We've sent a verification link to your email address. Please click the link to verify your account and start your cosmic journey.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-purple-300/60 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>The stars are aligning for you...</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="space-y-3">
            <p className="text-purple-200/60 text-sm">
              Didn't receive the email? Check your spam folder or
            </p>
            <button className="text-purple-300 hover:text-white font-medium transition-colors text-sm">
              Resend verification email
            </button>
          </div>
        </div>

        {/* Back to signup */}
        <Link 
          href="/signup" 
          className="inline-block mt-6 text-purple-200/60 hover:text-purple-200 text-sm transition-colors"
        >
          ← Back to Sign Up
        </Link>
      </div>
    </div>
  )
}
