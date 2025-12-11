'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Phone, User, Lock, Sparkles, Star, Moon } from 'lucide-react'
import Link from 'next/link'

type SignupMethod = 'email' | 'phone'

export default function SignupForm() {
  const router = useRouter()
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    otp: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleSendOtp = async () => {
    if (!formData.phoneNumber || !validatePhone(formData.phoneNumber)) {
      setError('Please enter a valid phone number')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithOtp({
      phone: formData.phoneNumber,
      options: {
        data: {
          full_name: formData.fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setOtpSent(true)
    }
    setIsLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    
    const { error } = await supabase.auth.verifyOtp({
      phone: formData.phoneNumber,
      token: formData.otp,
      type: 'sms',
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/onboarding')
      router.refresh()
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || formData.fullName.length < 2) {
      setError('Please enter your full name (at least 2 characters)')
      return
    }

    if (!formData.email || !validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!formData.password) {
      setError('Please enter a password')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/onboarding')
      router.refresh()
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError(null)
    
    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white rounded-full top-20 left-[10%] animate-pulse opacity-60"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-32 left-[25%] animate-pulse opacity-40"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-16 left-[45%] animate-pulse opacity-50"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-40 left-[60%] animate-pulse opacity-70"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-24 left-[80%] animate-pulse opacity-40"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 text-yellow-300/20 animate-pulse">
        <Star size={40} />
      </div>
      <div className="absolute top-40 right-20 text-purple-300/20 animate-bounce">
        <Moon size={50} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-4 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Celestial Journey</h1>
          <p className="text-purple-200/80">Discover your cosmic destiny</p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Create Your Account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-purple-200/60">or sign up with</span>
            </div>
          </div>

          {/* Method Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setSignupMethod('email'); setOtpSent(false); setError(null); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                signupMethod === 'email'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-purple-200/60 hover:bg-white/10'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => { setSignupMethod('phone'); setOtpSent(false); setError(null); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                signupMethod === 'phone'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-purple-200/60 hover:bg-white/10'
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </div>

          {/* Email Signup Form */}
          {signupMethod === 'email' && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-purple-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          )}

          {/* Phone Signup Form */}
          {signupMethod === 'phone' && !otpSent && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
                <p className="text-purple-200/40 text-xs mt-1">Include country code (e.g., +91 for India)</p>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          )}

          {/* OTP Verification */}
          {signupMethod === 'phone' && otpSent && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-purple-200/80">We sent a code to</p>
                <p className="text-white font-medium">{formData.phoneNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl tracking-widest placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => { setOtpSent(false); setFormData(prev => ({ ...prev, otp: '' })); }}
                className="w-full py-2 text-purple-200/60 hover:text-purple-200 text-sm transition-colors"
              >
                Change phone number
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-purple-200/60 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-300 hover:text-white font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-purple-200/40 text-xs">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-purple-200">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-purple-200">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
