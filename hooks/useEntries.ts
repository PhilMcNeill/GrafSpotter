import { useQuery } from '@tanstack/react-query'
import { EntryFilters, EntriesResponse } from '@/types'

export function useEntries(filters: EntryFilters) {
  const params = new URLSearchParams()
  if (filters.writer) params.set('writer', filters.writer)
  if (filters.type) params.set('type', filters.type)
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.bbox) params.set('bbox', filters.bbox)

  const queryKey = ['entries', params.toString()]

  const { data, isLoading, error } = useQuery<EntriesResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/entries?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch entries')
      return res.json()
    },
    staleTime: 30_000,
  })

  return { entries: data?.items ?? [], total: data?.total ?? 0, isLoading, error }
}
