'use client'

export function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      // This is the track of the switch.
      // It changes from a bordered, transparent background (off) to a solid primary color (on).
      className={`
        relative inline-flex h-8 w-[52px] flex-shrink-0 cursor-pointer rounded-full border-2 
        transition-colors duration-300 ease-in-out 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--primary))]
        ${checked 
          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]' 
          : 'border-neutral-400 bg-transparent dark:border-neutral-600'
        }
      `}
    >
      {/* This is the thumb (the moving circle) of the switch. */}
      <span
        aria-hidden="true"
        className={`
          pointer-events-none absolute left-0 top-1/2 flex h-6 w-6 -translate-y-1/2 
          transform items-center justify-center rounded-full shadow-lg ring-0 
          transition-all duration-300 ease-in-out
          ${checked 
            ? 'translate-x-[22px] bg-white' // "On" state: moved right, white background
            : 'translate-x-[2px] bg-neutral-500 dark:bg-neutral-400' // "Off" state: initial position, gray background
          }
        `}
      >
        {/* The checkmark icon inside the thumb, which fades in when the switch is "on". */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`
            h-4 w-4 text-[hsl(var(--primary))] 
            transition-opacity duration-200 ease-in-out
            ${checked ? 'opacity-100' : 'opacity-0'}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </button>
  )
}
