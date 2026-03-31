import * as RadixTabs from '@radix-ui/react-tabs'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange}>
      <RadixTabs.List className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
        {children}
      </RadixTabs.List>
    </RadixTabs.Root>
  )
}

interface TabProps {
  value: string
  children: React.ReactNode
}

export function Tab({ value, children }: TabProps) {
  return (
    <RadixTabs.Trigger
      value={value}
      className="px-2.5 py-1 text-xs rounded transition-all capitalize text-zinc-500 hover:text-zinc-300 active:text-zinc-300 active:bg-zinc-800 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 data-[state=active]:active:bg-zinc-700 outline-none"
    >
      {children}
    </RadixTabs.Trigger>
  )
}
