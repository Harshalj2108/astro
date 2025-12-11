'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Sparkles, Star, Moon, Sun, ArrowRight } from 'lucide-react'

interface OnboardingFormProps {
  userId: string
  userName: string
  userEmail: string
}

export default function OnboardingForm({ userId, userName, userEmail }: OnboardingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    knowExactTime: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    // Save birth details (owner's profile)
    const { error: insertError } = await supabase
      .from('birth_details')
      .insert({
        user_id: userId,
        full_name: userName || userEmail,
        date_of_birth: formData.dateOfBirth,
        time_of_birth: formData.knowExactTime ? formData.timeOfBirth : '12:00',
        place_of_birth: formData.placeOfBirth,
        is_owner: true, // This is the user's own birth profile
      })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const nextStep = () => {
    if (step === 1 && !formData.dateOfBirth) {
      setError('Please select your date of birth')
      return
    }
    if (step === 2 && formData.knowExactTime && !formData.timeOfBirth) {
      setError('Please enter your birth time or uncheck if you don\'t know it')
      return
    }
    setError(null)
    setStep(prev => prev + 1)
  }

  const prevStep = () => {
    setError(null)
    setStep(prev => prev - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background stars animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white rounded-full top-20 left-[10%] animate-pulse opacity-60"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-32 left-[25%] animate-pulse opacity-40"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-16 left-[45%] animate-pulse opacity-50"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-40 left-[60%] animate-pulse opacity-70"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-24 left-[80%] animate-pulse opacity-40"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-48 left-[90%] animate-pulse opacity-60"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-60 left-[15%] animate-pulse opacity-50"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-72 left-[35%] animate-pulse opacity-30"></div>
      </div>

      {/* Floating celestial elements */}
      <div className="absolute top-20 left-10 text-yellow-300/20 animate-pulse">
        <Star size={40} />
      </div>
      <div className="absolute top-40 right-20 text-purple-300/20 animate-bounce">
        <Moon size={50} />
      </div>
      <div className="absolute bottom-40 left-20 text-orange-300/20 animate-pulse">
        <Sun size={45} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-6 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome, {userName || 'Cosmic Explorer'}!
          </h1>
          <p className="text-purple-200/80 text-lg max-w-md">
            Let's discover your unique cosmic blueprint. We need a few details about your birth.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= s 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                  : 'bg-white/10 text-purple-200/50'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 mx-1 rounded transition-all ${
                  step > s ? 'bg-purple-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="w-full max-w-lg backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Date of Birth */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">When were you born?</h2>
                  <p className="text-purple-200/60 mt-2">Your birth date determines your Sun sign and planetary positions</p>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-purple-200 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 [color-scheme:dark]"
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Time of Birth */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">What time were you born?</h2>
                  <p className="text-purple-200/60 mt-2">Birth time determines your Rising sign and house placements</p>
                </div>

                <div>
                  <label htmlFor="timeOfBirth" className="block text-sm font-medium text-purple-200 mb-2">
                    Time of Birth
                  </label>
                  <input
                    type="time"
                    id="timeOfBirth"
                    name="timeOfBirth"
                    value={formData.timeOfBirth}
                    onChange={handleChange}
                    disabled={!formData.knowExactTime}
                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 [color-scheme:dark] disabled:opacity-50"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="knowExactTime"
                    checked={!formData.knowExactTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, knowExactTime: !e.target.checked }))}
                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500/50"
                  />
                  <span className="text-purple-200/80">I don't know my exact birth time</span>
                </label>

                {!formData.knowExactTime && (
                  <p className="text-purple-200/50 text-sm bg-white/5 p-3 rounded-lg">
                    💡 We'll use 12:00 PM (noon) as a default. Your Rising sign and house placements may not be accurate, but Sun, Moon, and planetary aspects will still be calculated.
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-4 px-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Place of Birth */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Where were you born?</h2>
                  <p className="text-purple-200/60 mt-2">Birth location helps calculate precise planetary positions</p>
                </div>

                <div>
                  <label htmlFor="placeOfBirth" className="block text-sm font-medium text-purple-200 mb-2">
                    Place of Birth
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" />
                    <input
                      type="text"
                      id="placeOfBirth"
                      name="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={handleChange}
                      required
                      placeholder="e.g., New York, USA or Mumbai, India"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <p className="text-purple-200/50 text-sm mt-2">
                    Enter your city and country for accurate calculations
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-purple-200 font-medium mb-3">Your Birth Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-200/60">Date:</span>
                      <span className="text-white">{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200/60">Time:</span>
                      <span className="text-white">{formData.knowExactTime ? (formData.timeOfBirth || '-') : '12:00 (noon)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200/60">Place:</span>
                      <span className="text-white">{formData.placeOfBirth || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-4 px-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.placeOfBirth}
                    className="flex-1 py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Your Chart...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Reveal My Cosmic Blueprint
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Skip for later */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 text-purple-200/50 hover:text-purple-200 text-sm transition-colors"
        >
          Skip for now, I'll add this later
        </button>
      </div>
    </div>
  )
}
