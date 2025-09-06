// lib/pwa.ts
'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
}

const isIOS = () =>
  typeof navigator !== 'undefined' &&
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !/crios|fxios/i.test(navigator.userAgent)

const isStandalone = () =>
  typeof window !== 'undefined' &&
  ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window as any).navigator.standalone)

export function usePWAInstall() {
  const deferred = useRef<BIPEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(isStandalone())

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault()
      deferred.current = e as BIPEvent
      setCanInstall(true)
    }
    const onInstalled = () => {
      deferred.current = null
      setCanInstall(false)
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (deferred.current) {
      await deferred.current.prompt()
      await deferred.current.userChoice
      deferred.current = null
      setCanInstall(false)
    }
  }, [])

  return {
    canInstall,
    installed,
    install,
    isIOS: isIOS(),
    isStandalone: installed,
  }
}