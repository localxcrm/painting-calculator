import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function Home() {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder') && !supabaseKey.includes('placeholder')) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="display-4 fw-bold text-dark mb-4">
          Painting Calculator
        </h1>
        <p className="lead text-muted mb-4">
          Professional business tool for painting contractors
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link href="/login" className="btn btn-primary btn-lg">
            Sign In
          </Link>
          <Link href="/login" className="btn btn-outline-primary btn-lg">
            Create Account
          </Link>
        </div>
        <div className="mt-4">
          <small className="text-muted">
            Access advanced features with user accounts
          </small>
        </div>
      </div>
    </div>
  )
}
