import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signup')
  }

  // Fetch user's birth details
  const { data: birthDetails } = await supabase
    .from('birth_details')
    .select('*')
    .eq('user_id', user.id)
    .order('is_owner', { ascending: false })
    .order('created_at', { ascending: false })

  // Fetch user's charts
  const { data: charts } = await supabase
    .from('astrology_charts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Separate owner's birth details from others
  const ownerBirthDetails = birthDetails?.filter((d: any) => d.is_owner) || []
  const otherBirthDetails = birthDetails?.filter((d: any) => !d.is_owner) || []

  return (
    <DashboardClient
      user={user}
      ownerBirthDetails={ownerBirthDetails}
      otherBirthDetails={otherBirthDetails}
      charts={charts || []}
    />
  )
}
