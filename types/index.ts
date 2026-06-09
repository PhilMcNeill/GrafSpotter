export type GraffitiType = 'tag' | 'throw-up' | 'sticker' | 'stencil' | 'piece' | 'mural'

export const GRAFFITI_TYPES: GraffitiType[] = [
  'tag',
  'throw-up',
  'sticker',
  'stencil',
  'piece',
  'mural',
]

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Entry {
  id: string
  writer_name: string
  type: GraffitiType
  photo_url: string
  latitude: number
  longitude: number
  location_label: string | null
  date_spotted: string
  submitted_by: string
  created_at: string
  ai_suggested_name: string | null
  ai_detection_id: string | null
  bounding_box: BoundingBox | null
}

export interface DetectedPiece {
  piece_index: number
  suggested_name: string | null
  confidence: number | null
  bounding_box: BoundingBox
}

export interface AnalyseResponse {
  detection_id: string
  pieces: DetectedPiece[]
}

export interface EntryFilters {
  writer?: string
  type?: GraffitiType
  date_from?: string
  date_to?: string
  bbox?: string
}

export interface EntriesResponse {
  items: Entry[]
  total: number
  next_page_uri: string | null
}
