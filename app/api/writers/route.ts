import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('entries')
    .select('writer_name')
    .order('writer_name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Deduplicate by normalized name, preserve original casing of first occurrence
  const seen = new Set<string>()
  const writers: string[] = []
  for (const { writer_name } of data ?? []) {
    const normalized = writer_name.toLowerCase().trim()
    if (!seen.has(normalized)) {
      seen.add(normalized)
      writers.push(writer_name)
    }
  }

  return NextResponse.json({ writers })
}
