// components/topbar.tsx
'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Sun, Moon, Menu, Download } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import MobileSidebar from './mobile-sidebar'
import { usePWAInstall } from '@/lib/pwa'
import { ConfirmDialog } from './ui/dialog'

export default function Topbar() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)
  const { canInstall, installed, install, isIOS, isStandalone } = usePWAInstall()
  const current = theme === 'system' ? systemTheme : theme
  const toggleTheme = () => setTheme(current === 'dark' ? 'light' : 'dark')

  const onInstall = async () => {
    if (canInstall) {
      await install()
    } else if (isIOS && !isStandalone) {
      setIosHelp(true)
    }
  }

  return (
    <header className="sticky top-0 z-40 glass smooth">
      <div className="flex items-center justify-between px-3 md:px-6 py-3">
        <div className="flex items-center gap-2">
          {/* Hamburger for mobile */}
          <Button variant="ghost" size="icon" className="pill md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="font-semibold tracking-tight">Invoice Pro</Link>
        </div>
        <div className="flex items-center gap-2">
          {/* Install button: shown if not already installed */}
          {!installed && (
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={onInstall}>
              <Download className="h-4 w-4 mr-1.5" /> Install
            </Button>
          )}
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="pill">
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
          </Button>
        </div>
      </div>

      {/* Mobile slide-over sidebar */}
      <MobileSidebar open={open} onOpenChange={setOpen} />

      {/* iOS install instructions */}
      <ConfirmDialog
        open={iosHelp}
        onOpenChange={setIosHelp}
        title="Install on iOS"
        description="On iPhone/iPad, tap the Share button in Safari, then choose 'Add to Home Screen' to install."
        confirmText="Got it"
        onConfirm={() => setIosHelp(false)}
      />
    </header>
  )
}