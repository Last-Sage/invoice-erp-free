// app/layout.tsx (wrap with AuthProvider and AuthGuard)
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import Sidebar from '@/components/sidebar'
import Topbar from '@/components/topbar'
import { AuthProvider } from '@/lib/auth-client'
import AuthGuard from '@/components/auth-guard'
import { ToastProvider } from '@/components/ui/toast'
import MobileTabbar from '@/components/mobile-tabbar'

export const metadata: Metadata = { /* unchanged */ }
export const viewport: Viewport = { /* unchanged */ }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0A84FF" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider>
              <div className="flex min-h-screen w-full">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Topbar />
                  <AuthGuard>
                    <main className="flex-1 p-4 md:p-8 pt-[var(--topbar-h)] pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom,0px))] md:pb-8">
  {children}
</main>
                    <MobileTabbar />
                  </AuthGuard>
                </div>
              </div>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered', reg.scope))
            .catch(console.error)
        })
      }`
          }}
        />
      </body>
    </html>
  )
}