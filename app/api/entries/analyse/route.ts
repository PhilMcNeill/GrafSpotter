import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analysePhoto } from '@/lib/openai'
import sharp from 'sharp'

const MAX_DIMENSION = 1024
const TIMEOUT_MS = 10000

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required to submit entries' }, { status: 401 })
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const photo = formData.get('photo') as File | null
  if (!photo) {
    return NextResponse.json({ error: 'photo is required' }, { status: 400 })
  }

  const rawBuffer = Buffer.from(await photo.arrayBuffer())

  // Resize to max 1024px on the long edge to reduce token cost
  const resized = await sharp(rawBuffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()

  const base64 = resized.toString('base64')

  try {
    const result = await Promise.race([
      analysePhoto(base64, 'image/jpeg'),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
      ),
    ])

    return NextResponse.json(result)
  } catch (err) {
    const isTimeout = err instanceof Error && err.message === 'timeout'
    console.error('AI analysis error:', err)
    return NextResponse.json(
      { error: isTimeout ? 'Analysis timed out' : 'Analysis failed' },
      { status: isTimeout ? 504 : 502 }
    )
  }
}
