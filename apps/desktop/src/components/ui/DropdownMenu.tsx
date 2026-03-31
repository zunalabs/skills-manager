import * as RadixDropdown from '@radix-ui/react-dropdown-menu'

export const DropdownMenu = RadixDropdown.Root
export const DropdownMenuTrigger = RadixDropdown.Trigger

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function DropdownMenuContent({ children, align = 'end', className = '' }: DropdownMenuContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        sideOffset={6}
        className={`z-50 min-w-[160px] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden py-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${className}`}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function DropdownMenuItem({ children, onClick, className = '' }: DropdownMenuItemProps) {
  return (
    <RadixDropdown.Item
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer outline-none transition-colors ${className}`}
    >
      {children}
    </RadixDropdown.Item>
  )
}

export function DropdownMenuSeparator() {
  return <RadixDropdown.Separator className="h-px bg-zinc-800 mx-2 my-1" />
}
