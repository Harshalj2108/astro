'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sparkles, Star, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ChartVisualization from '@/components/ChartVisualization'

interface BirthDetail {
  id: string
  full_name: string
  date_of_birth: string
  time_of_birth: string
  place_of_birth: string
  is_owner: boolean
}

export default function CreateChartPage() {
  const router = useRouter()
  const [birthDetails, setBirthDetails] = useState<BirthDetail[]>([])
  const [selectedBirthDetailId, setSelectedBirthDetailId] = useState('')
  const [chartName, setChartName] = useState('')
  const [chartType, setChartType] = useState('D1')
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedChart, setGeneratedChart] = useState<any>(null)

  useEffect(() => {
    fetchBirthDetails()
  }, [])

  const fetchBirthDetails = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('birth_details')
      .select('*')
      .order('is_owner', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      setError('Failed to load birth details')
    } else {
      setBirthDetails(data || [])
      if (data && data.length > 0) {
        setSelectedBirthDetailId(data[0].id)
        setChartName(`${data[0].full_name}'s Birth Chart`)
      }
    }
    setIsLoading(false)
  }

  const handleBirthDetailChange = (id: string) => {
    setSelectedBirthDetailId(id)
    const selected = birthDetails.find(bd => bd.id === id)
    if (selected) {
      setChartName(`${selected.full_name}'s Birth Chart`)
    }
  }

  const handleGenerateChart = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)
    setGeneratedChart(null)

    try {
      const response = await fetch('/api/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDetailsId: selectedBirthDetailId,
          chartName,
          chartType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate chart')
      }

      setGeneratedChart(data.chartData)
      
      // Optionally redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 5000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate chart')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-purple-200/60 hover:text-purple-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-4 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Astrology Chart</h1>
          <p className="text-purple-200/80">Generate detailed Vedic astrology charts</p>
        </div>

        {!generatedChart ? (
          /* Form Card */
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            {birthDetails.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-purple-300/30 mx-auto mb-3" />
                <p className="text-purple-200/60 mb-4">No birth details found</p>
                <Link
                  href="/birth-details/new"
                  className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Add Birth Details
                </Link>
              </div>
            ) : (
              <form onSubmit={handleGenerateChart} className="space-y-6">
                {/* Select Birth Details */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Select Person
                  </label>
                  <select
                    value={selectedBirthDetailId}
                    onChange={(e) => handleBirthDetailChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  >
                    {birthDetails.map((detail) => (
                      <option key={detail.id} value={detail.id} className="bg-slate-800">
                        {detail.full_name} {detail.is_owner && '(You)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Birth Details Preview */}
                {selectedBirthDetailId && (() => {
                  const selected = birthDetails.find(bd => bd.id === selectedBirthDetailId)
                  return selected ? (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-white font-medium mb-2">{selected.full_name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-purple-200/60">
                        <div>Date: {new Date(selected.date_of_birth).toLocaleDateString()}</div>
                        <div>Time: {selected.time_of_birth || 'Not specified'}</div>
                        <div className="col-span-2">Place: {selected.place_of_birth}</div>
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Chart Name */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Chart Name
                  </label>
                  <input
                    type="text"
                    value={chartName}
                    onChange={(e) => setChartName(e.target.value)}
                    placeholder="e.g., John's Birth Chart"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                {/* Chart Type */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Chart Type
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  >
                    <option value="D1" className="bg-slate-800">D1 - Birth Chart (Rasi)</option>
                    <option value="D9" className="bg-slate-800">D9 - Navamsa</option>
                    <option value="D10" className="bg-slate-800">D10 - Dasamsa (Career)</option>
                    <option value="D12" className="bg-slate-800">D12 - Dwadasamsa (Parents)</option>
                  </select>
                  <p className="mt-1 text-xs text-purple-200/40">
                    Currently only D1 (Birth Chart) is fully calculated
                  </p>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={isGenerating || !selectedBirthDetailId}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Chart...
                    </span>
                  ) : (
                    'Generate Chart'
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Generated Chart Display */
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="mb-6 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm text-center">
              ✓ Chart generated successfully! Redirecting to dashboard...
            </div>
            
            <ChartVisualization chartData={generatedChart} />
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setGeneratedChart(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
