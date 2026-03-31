import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger

interface DialogContentProps {
  children: React.ReactNode
  className?: string
  maxWidth?: string
}

export function DialogContent({ children, className = '', maxWidth = 'max-w-md' }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <RadixDialog.Content
        className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full ${maxWidth} bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${className}`}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
      {children}
    </div>
  )
}

export function DialogClose({ className = '' }: { className?: string }) {
  return (
    <RadixDialog.Close asChild>
      <button
        className={`w-6 h-6 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors ml-auto ${className}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </RadixDialog.Close>
  )
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-zinc-800">
      <div className="flex items-center justify-end gap-2 px-5 py-3">
        {children}
      </div>
    </div>
  )
}

export const DialogTitle = RadixDialog.Title
export const DialogDescription = RadixDialog.Description
