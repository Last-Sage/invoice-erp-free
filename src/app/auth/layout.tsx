// src/app/auth/layout.tsx
import { Suspense } from 'react'
import { Loader } from '@/components/ui/loader'

export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader size={10} />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}