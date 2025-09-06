// components/ui/loader.tsx
'use client'
import { PulseLoader } from 'react-spinners'
export function Loader({ size = 8 }: { size?: number }) {
  return <PulseLoader color="hsl(var(--primary))" size={size} />
}