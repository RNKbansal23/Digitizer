import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /teacher and /principal routes
  const isProtectedPath = request.nextUrl.pathname.startsWith('/teacher') || request.nextUrl.pathname.startsWith('/principal');
  
  if (isProtectedPath && !user) {
    // No user, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isProtectedPath && user) {
    // User is logged in. Let's check their profile to see their role and school status.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id, schools(status)')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // Something went wrong, no profile found for this user
      // Could redirect to a setup page, but for now just let it through or handle in component
    } else {
      // Check if school is suspended
      // Note: Supabase joins return arrays or single objects based on the relationship. 
      // schools(status) might be returned as an object.
      const schoolData = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools;
      if (schoolData && schoolData.status === 'paused') {
        const url = request.nextUrl.clone()
        url.pathname = '/suspended'
        return NextResponse.redirect(url)
      }

      // Enforce role-based routing
      if (request.nextUrl.pathname.startsWith('/teacher') && profile.role !== 'teacher') {
        const url = request.nextUrl.clone()
        url.pathname = profile.role === 'principal' ? '/principal' : '/login'
        return NextResponse.redirect(url)
      }

      if (request.nextUrl.pathname.startsWith('/principal') && profile.role !== 'principal') {
        const url = request.nextUrl.clone()
        url.pathname = profile.role === 'teacher' ? '/teacher' : '/login'
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect logged in users away from login page
  if (request.nextUrl.pathname === '/login' && user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'principal' ? '/principal' : '/teacher'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
