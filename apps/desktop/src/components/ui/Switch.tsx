import * as RadixSwitch from '@radix-ui/react-switch'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
}

export function Switch({ checked, onCheckedChange, id }: SwitchProps) {
  return (
    <RadixSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="flex-shrink-0 w-8 rounded-full relative transition-colors outline-none cursor-pointer data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-700"
      style={{ height: '18px', width: '32px' }}
    >
      <RadixSwitch.Thumb
        className="block bg-white rounded-full shadow transition-transform"
        style={{
          width: 14,
          height: 14,
          transform: checked ? 'translateX(16px)' : 'translateX(2px)',
        }}
      />
    </RadixSwitch.Root>
  )
}
