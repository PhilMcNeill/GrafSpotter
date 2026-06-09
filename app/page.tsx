import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        Graf<span className="text-yellow-400">Spotter</span>
      </h1>
      <p className="text-zinc-400 text-lg max-w-md mb-8">
        Map and document graffiti writers in your city. See who&apos;s active and where.
      </p>
      <div className="flex gap-3">
        <Link
          href="/map"
          className="px-6 py-3 bg-yellow-400 text-zinc-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
        >
          Explore the map
        </Link>
        <Link
          href="/submit"
          className="px-6 py-3 border border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors"
        >
          Submit a sighting
        </Link>
      </div>
    </div>
  )
}
