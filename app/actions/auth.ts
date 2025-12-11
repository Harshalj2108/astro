'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signupSchema } from '@/lib/validations/auth'
import { headers } from 'next/headers'

export async function signupWithEmail(formData: FormData) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  const data = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    phoneNumber: formData.get('phoneNumber') as string,
    password: formData.get('password') as string,
  }

  // Validate data
  const validation = signupSchema.safeParse(data)
  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    }
  }

  // Sign up with Supabase
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        phone_number: data.phoneNumber,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  redirect('/onboarding')
}

export async function signupWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  if (data.url) {
    redirect(data.url)
  }
}
