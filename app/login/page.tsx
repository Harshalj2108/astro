'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Phone, Lock, Sparkles, Star, Moon, KeyRound } from 'lucide-react'
import Link from 'next/link'

type LoginMethod = 'email' | 'phone'
type AuthType = 'password' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email')
  const [authType, setAuthType] = useState<AuthType>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  
  const [formData, setFormData] = useState({
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
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    
    if (loginMethod === 'email') {
      if (!formData.email || !validateEmail(formData.email)) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        return
      }
      
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setOtpSent(true)
      }
    } else {
      if (!formData.phoneNumber || !validatePhone(formData.phoneNumber)) {
        setError('Please enter a valid phone number')
        setIsLoading(false)
        return
      }
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formData.phoneNumber,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setOtpSent(true)
      }
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
      ...(loginMethod === 'email' 
        ? { email: formData.email, type: 'email' as const }
        : { phone: formData.phoneNumber, type: 'sms' as const }
      ),
      token: formData.otp,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      await redirectAfterLogin()
    }
  }

  const redirectAfterLogin = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: birthDetails } = await supabase
        .from('birth_details')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (birthDetails) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    }
    router.refresh()
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loginMethod === 'email') {
      if (!formData.email || !validateEmail(formData.email)) {
        setError('Please enter a valid email address')
        return
      }
    } else {
      if (!formData.phoneNumber || !validatePhone(formData.phoneNumber)) {
        setError('Please enter a valid phone number')
        return
      }
    }

    if (!formData.password) {
      setError('Please enter your password')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithPassword({
      email: loginMethod === 'email' ? formData.email : formData.phoneNumber,
      password: formData.password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      await redirectAfterLogin()
    }
  }

  const handleGoogleLogin = async () => {
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
      {/* Background elements */}
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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-purple-200/80">Continue your cosmic journey</p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
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
              <span className="px-4 text-purple-200/60">or sign in with</span>
            </div>
          </div>

          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setOtpSent(false); setError(null); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'email'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-purple-200/60 hover:bg-white/10'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setOtpSent(false); setError(null); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'phone'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-purple-200/60 hover:bg-white/10'
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </div>

          {/* Auth Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setAuthType('password'); setOtpSent(false); setError(null); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                authType === 'password'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-purple-200/60 hover:bg-white/10'
              }`}
            >
              <Lock className="w-4 h-4" />
              Password
            </button>
            <button
              type="button"
              onClick={() => { setAuthType('otp'); setOtpSent(false); setError(null); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                authType === 'otp'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-purple-200/60 hover:bg-white/10'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              OTP
            </button>
          </div>

          {/* Password Login Form */}
          {authType === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative">
                  {loginMethod === 'email' ? (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                  )}
                  <input
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    name={loginMethod === 'email' ? 'email' : 'phoneNumber'}
                    value={loginMethod === 'email' ? formData.email : formData.phoneNumber}
                    onChange={handleChange}
                    placeholder={loginMethod === 'email' ? 'Enter your email' : '+91 98765 43210'}
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
                    placeholder="Enter your password"
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

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-purple-300 hover:text-white transition-colors">
                  Forgot password?
                </Link>
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
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          )}

          {/* OTP Login */}
          {authType === 'otp' && !otpSent && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative">
                  {loginMethod === 'email' ? (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                  )}
                  <input
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    name={loginMethod === 'email' ? 'email' : 'phoneNumber'}
                    value={loginMethod === 'email' ? formData.email : formData.phoneNumber}
                    onChange={handleChange}
                    placeholder={loginMethod === 'email' ? 'Enter your email' : '+91 98765 43210'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
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
          {authType === 'otp' && otpSent && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-purple-200/80">We sent a code to</p>
                <p className="text-white font-medium">
                  {loginMethod === 'email' ? formData.email : formData.phoneNumber}
                </p>
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
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setFormData(prev => ({ ...prev, otp: '' })); }}
                  className="text-purple-200/60 hover:text-purple-200 transition-colors"
                >
                  Change {loginMethod === 'email' ? 'email' : 'number'}
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-purple-300 hover:text-white transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-purple-200/60 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-purple-300 hover:text-white font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
