'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, Star, Moon, Sun, Calendar, MapPin, Clock,
  MoreVertical, Settings, LogOut, Trash2, Edit, User,
  Plus, X
} from 'lucide-react'
import Link from 'next/link'

interface BirthDetail {
  id: string
  user_id: string
  full_name: string
  date_of_birth: string
  time_of_birth: string
  place_of_birth: string
  is_owner: boolean
  created_at: string
}

interface Chart {
  id: string
  user_id: string
  chart_name: string
  chart_type: string
  birth_details_id: string
  chart_data: any
  created_at: string
}

interface DashboardClientProps {
  user: any
  ownerBirthDetails: BirthDetail[]
  otherBirthDetails: BirthDetail[]
  charts: Chart[]
}

export default function DashboardClient({ 
  user, 
  ownerBirthDetails, 
  otherBirthDetails, 
  charts 
}: DashboardClientProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editingBirthDetail, setEditingBirthDetail] = useState<BirthDetail | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'birth' | 'chart', id: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleDeleteBirthDetail = async (id: string) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('birth_details')
      .delete()
      .eq('id', id)
    
    if (!error) {
      router.refresh()
    }
    setIsLoading(false)
    setDeleteConfirm(null)
  }

  const handleDeleteChart = async (id: string) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('astrology_charts')
      .delete()
      .eq('id', id)
    
    if (!error) {
      router.refresh()
    }
    setIsLoading(false)
    setDeleteConfirm(null)
  }

  const handleUpdateBirthDetail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBirthDetail) return

    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('birth_details')
      .update({
        full_name: editingBirthDetail.full_name,
        date_of_birth: editingBirthDetail.date_of_birth,
        time_of_birth: editingBirthDetail.time_of_birth,
        place_of_birth: editingBirthDetail.place_of_birth,
      })
      .eq('id', editingBirthDetail.id)
    
    if (!error) {
      router.refresh()
    }
    setIsLoading(false)
    setEditingBirthDetail(null)
  }

  const ownerProfile = ownerBirthDetails[0]
  const totalBirthProfiles = ownerBirthDetails.length + otherBirthDetails.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with 3-dot menu */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
              <p className="text-purple-200/60">{user.email || user.phone}</p>
            </div>
          </div>
          
          {/* 3-dot Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-800 border border-white/20 shadow-xl z-50 overflow-hidden">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-purple-200 hover:bg-white/10 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-purple-200 hover:bg-white/10 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <hr className="border-white/10" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-300" />
              <span className="text-purple-200/60 text-sm">Birth Profiles</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalBirthProfiles}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-purple-200/60 text-sm">Charts Created</span>
            </div>
            <p className="text-3xl font-bold text-white">{charts.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Moon className="w-5 h-5 text-blue-300" />
              <span className="text-purple-200/60 text-sm">Moon Phase</span>
            </div>
            <p className="text-xl font-bold text-white">Waxing Gibbous</p>
          </div>
        </div>

        {/* Owner's Birth Profile (Primary) */}
        {ownerProfile && (
          <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl p-6 border border-purple-500/30 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Your Birth Profile
                <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs">
                  Primary
                </span>
              </h2>
              <button
                onClick={() => setEditingBirthDetail(ownerProfile)}
                className="p-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-purple-200/60 text-sm">Full Name</p>
                <p className="text-white font-medium">{ownerProfile.full_name}</p>
              </div>
              <div>
                <p className="text-purple-200/60 text-sm">Date of Birth</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-purple-300" />
                  {new Date(ownerProfile.date_of_birth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-purple-200/60 text-sm">Time of Birth</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-300" />
                  {ownerProfile.time_of_birth || 'Not specified'}
                </p>
              </div>
              <div className="md:col-span-3">
                <p className="text-purple-200/60 text-sm">Place of Birth</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-purple-300" />
                  {ownerProfile.place_of_birth}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Other Birth Profiles */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-400" />
                Other Profiles
              </h2>
              <Link 
                href="/birth-details/new"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add New
              </Link>
            </div>
            
            {otherBirthDetails.length > 0 ? (
              <div className="space-y-3">
                {otherBirthDetails.map((detail) => (
                  <div 
                    key={detail.id} 
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{detail.full_name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-purple-200/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(detail.date_of_birth).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {detail.place_of_birth}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingBirthDetail(detail)}
                          className="p-2 rounded-lg text-purple-300 hover:bg-white/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'birth', id: detail.id })}
                          className="p-2 rounded-lg text-red-400 hover:bg-white/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Moon className="w-12 h-12 text-purple-300/30 mx-auto mb-3" />
                <p className="text-purple-200/60">No other profiles yet</p>
                <p className="text-purple-200/40 text-sm">Add profiles for friends & family</p>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Your Charts
              </h2>
              <Link 
                href="/charts/new"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Create Chart
              </Link>
            </div>
            
            {charts.length > 0 ? (
              <div className="space-y-3">
                {charts.map((chart) => (
                  <div 
                    key={chart.id} 
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <Link href={`/charts/${chart.id}`} className="flex-1 cursor-pointer">
                        <h3 className="font-medium text-white">{chart.chart_name || 'Untitled Chart'}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-purple-200/60">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                            {chart.chart_type}
                          </span>
                          <span>{new Date(chart.created_at).toLocaleDateString()}</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'chart', id: chart.id })}
                        className="p-2 rounded-lg text-red-400 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-purple-300/30 mx-auto mb-3" />
                <p className="text-purple-200/60">No charts created yet</p>
                <p className="text-purple-200/40 text-sm">Create your first astrology chart</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/charts/natal"
            className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            <Sun className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium">Natal Chart</span>
          </Link>
          <Link 
            href="/charts/compatibility"
            className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            <Star className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium">Compatibility</span>
          </Link>
          <Link 
            href="/charts/transit"
            className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            <Moon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium">Transit Chart</span>
          </Link>
          <Link 
            href="/horoscope"
            className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium">Daily Horoscope</span>
          </Link>
        </div>
      </div>

      {/* Edit Birth Detail Modal */}
      {editingBirthDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Birth Details</h3>
              <button
                onClick={() => setEditingBirthDetail(null)}
                className="p-2 rounded-lg text-purple-200 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateBirthDetail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingBirthDetail.full_name}
                  onChange={(e) => setEditingBirthDetail({ ...editingBirthDetail, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={editingBirthDetail.date_of_birth}
                  onChange={(e) => setEditingBirthDetail({ ...editingBirthDetail, date_of_birth: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Time of Birth</label>
                <input
                  type="time"
                  value={editingBirthDetail.time_of_birth || ''}
                  onChange={(e) => setEditingBirthDetail({ ...editingBirthDetail, time_of_birth: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Place of Birth</label>
                <input
                  type="text"
                  value={editingBirthDetail.place_of_birth}
                  onChange={(e) => setEditingBirthDetail({ ...editingBirthDetail, place_of_birth: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBirthDetail(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-white/20">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete {deleteConfirm.type === 'birth' ? 'Profile' : 'Chart'}?</h3>
              <p className="text-purple-200/60 text-sm">
                This action cannot be undone. This will permanently delete the {deleteConfirm.type === 'birth' ? 'birth profile' : 'chart'}.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.type === 'birth' 
                  ? handleDeleteBirthDetail(deleteConfirm.id) 
                  : handleDeleteChart(deleteConfirm.id)
                }
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
