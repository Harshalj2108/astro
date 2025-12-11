import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user already has birth details
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: birthDetails } = await supabase
          .from('birth_details')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .single()
        
        // If user already has birth details, go to dashboard
        if (birthDetails) {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
