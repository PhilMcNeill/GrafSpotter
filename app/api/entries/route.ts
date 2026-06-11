import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { entrySchema, entryFiltersSchema } from '@/lib/validators'

const PAGE_SIZE = 50

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = entryFiltersSchema.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { writer, type, date_from, date_to, bbox, cursor } = parsed.data
  const supabase = await createClient()

  let query = supabase
    .from('entries')
    .select('id,writer_name,type,photo_url,latitude,longitude,location_label,date_spotted,submitted_by,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (writer) {
    query = query.ilike('writer_name_normalized', `%${writer.toLowerCase()}%`)
  }
  if (type) {
    query = query.eq('type', type)
  }
  if (date_from) {
    query = query.gte('date_spotted', date_from)
  }
  if (date_to) {
    query = query.lte('date_spotted', date_to)
  }
  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  if (bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number)
    // Use PostGIS function for spatial filter
    const { data: bboxData, error: bboxError } = await supabase.rpc('entries_in_bbox', {
      min_lng: minLng,
      min_lat: minLat,
      max_lng: maxLng,
      max_lat: maxLat,
    })
    if (bboxError) {
      return NextResponse.json({ error: 'Spatial query failed' }, { status: 500 })
    }
    // Apply remaining filters in-memory for bbox results
    let filtered = bboxData ?? []
    if (writer) filtered = filtered.filter((e: { writer_name_normalized: string }) => e.writer_name_normalized.includes(writer.toLowerCase()))
    if (type) filtered = filtered.filter((e: { type: string }) => e.type === type)
    if (date_from) filtered = filtered.filter((e: { date_spotted: string }) => e.date_spotted >= date_from)
    if (date_to) filtered = filtered.filter((e: { date_spotted: string }) => e.date_spotted <= date_to)

    return NextResponse.json({ items: filtered, total: filtered.length, next_page_uri: null })
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const lastItem = data?.[data.length - 1]
  const next_page_uri =
    data && data.length === PAGE_SIZE && lastItem
      ? `/api/entries?cursor=${encodeURIComponent(lastItem.created_at)}`
      : null

  return NextResponse.json({ items: data ?? [], total: count ?? 0, next_page_uri })
}

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

  const fields = {
    writer_name: formData.get('writer_name'),
    type: formData.get('type'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    location_label: formData.get('location_label') ?? undefined,
    date_spotted: formData.get('date_spotted'),
    ai_suggested_name: formData.get('ai_suggested_name') ?? undefined,
    ai_detection_id: formData.get('ai_detection_id') ?? undefined,
    bounding_box: formData.get('bounding_box')
      ? JSON.parse(formData.get('bounding_box') as string)
      : undefined,
  }

  const parsed = entrySchema.safeParse(fields)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  // Upload photo to Supabase Storage
  const serviceClient = await createServiceClient()
  const photoBuffer = Buffer.from(await photo.arrayBuffer())
  const fileName = `${user.id}/${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const { error: uploadError } = await serviceClient.storage
    .from('photos')
    .upload(fileName, photoBuffer, { contentType: photo.type, upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json(
      { error: `Photo upload failed: ${uploadError.message}` },
      { status: 500 }
    )
  }

  const { data: { publicUrl } } = serviceClient.storage.from('photos').getPublicUrl(fileName)

  const { latitude, longitude } = parsed.data
  const { data: entry, error: insertError } = await serviceClient
    .from('entries')
    .insert({
      ...parsed.data,
      photo_url: publicUrl,
      submitted_by: user.id,
      location: `POINT(${longitude} ${latitude})`,
    })
    .select('id,writer_name,type,photo_url,latitude,longitude,location_label,date_spotted,submitted_by,created_at')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(entry, { status: 201 })
}
