import * as RadixTooltip from '@radix-ui/react-tooltip'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={600} skipDelayDuration={100}>
      {children}
    </RadixTooltip.Provider>
  )
}

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function Tooltip({ content, children, side = 'bottom' }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-[100] px-2 py-1 text-[11px] font-medium text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl select-none animate-in fade-in-0 zoom-in-95"
        >
          {content}
          <RadixTooltip.Arrow className="fill-zinc-700" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
