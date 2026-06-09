'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const linkClass = (path: string) =>
    `text-sm px-3 py-1.5 rounded transition-colors ${
      pathname === path
        ? 'bg-zinc-800 text-white'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Graf<span className="text-yellow-400">Spotter</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/map" className={linkClass('/map')}>Map</Link>
          {user ? (
            <>
              <Link href="/submit" className={linkClass('/submit')}>Submit</Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-2"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={linkClass('/auth/login')}>Log in</Link>
              <Link
                href="/auth/register"
                className="text-sm px-3 py-1.5 rounded bg-yellow-400 text-zinc-950 font-medium hover:bg-yellow-300 transition-colors ml-1"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
