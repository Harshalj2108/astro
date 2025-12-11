import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingForm from '@/components/OnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signup')
  }

  // Check if user already has birth details
  const { data: existingBirthDetails } = await supabase
    .from('birth_details')
    .select('id')
    .eq('user_id', user.id)
    .eq('full_name', user.user_metadata?.full_name || user.email)
    .single()

  // If user already completed onboarding, redirect to dashboard
  if (existingBirthDetails) {
    redirect('/dashboard')
  }

  return (
    <OnboardingForm 
      userId={user.id} 
      userName={user.user_metadata?.full_name || ''} 
      userEmail={user.email || ''}
    />
  )
}
