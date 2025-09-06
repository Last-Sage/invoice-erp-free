// components/topbar.tsx
'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Sun, Moon, Menu, Download } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import MobileSidebar from './mobile-sidebar'
import { usePWAInstall } from '@/lib/pwa'
import { useToast } from './ui/toast'

export default function Topbar() {
  const { theme, setTheme, systemTheme } = useTheme()
  const current = theme === 'system' ? systemTheme : theme
  const [open, setOpen] = useState(false)
  const { canInstall, install, isIOS, isStandalone, installed } = usePWAInstall()
  const { push } = useToast()

  const toggleTheme = () => setTheme(current === 'dark' ? 'light' : 'dark')

  const onInstall = async () => {
    if (canInstall) await install()
    else if (isIOS && !isStandalone) {
      push({ variant: 'info', message: "On iOS, tap Share → Add to Home Screen to install." })
    } else {
      push({ variant: 'info', message: 'Use your browser menu to Install (HTTPS or localhost required).' })
    }
  }

  return (
    <header className="sticky top-0 z-40 glass smooth">
      <div className="flex items-center justify-between px-3 md:px-6 py-3">
        <div className="flex items-center gap-2">
          {/* Hamburger for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="pill md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="font-semibold tracking-tight">Invoice Pro</Link>
        </div>
        <div className="flex items-center gap-2">
          {!installed && (
            <Button variant="ghost" size="sm" onClick={onInstall}>
              <Download className="h-4 w-4 mr-1.5" /> Install
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="pill">
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
          </Button>
        </div>
      </div>

      {/* Mobile slide-over sidebar */}
      <MobileSidebar open={open} onOpenChange={setOpen} />
    </header>
  )
}