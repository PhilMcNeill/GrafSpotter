import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from './providers'
import { Nav } from '@/components/ui/Nav'

const ibmPlexMono = localFont({
  src: [
    { path: '../public/fonts/IBMPlexMono-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/IBMPlexMono-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../public/fonts/IBMPlexMono-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/IBMPlexMono-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: '../public/fonts/IBMPlexMono-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/IBMPlexMono-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-ibm-plex-mono',
})

export const metadata: Metadata = {
  title: 'GrafSpotter',
  description: 'Map and document graffiti writers in your area',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ibmPlexMono.variable} h-full`}>
      <body className="h-full flex flex-col bg-zinc-950 text-zinc-100 antialiased font-mono">
        <Providers>
          <Nav />
          <main className="flex-1 flex flex-col">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
