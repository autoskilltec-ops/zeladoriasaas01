'use client'

import { Check } from 'lucide-react'

interface ChecklistItemProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ChecklistItem({ label, checked, onChange }: ChecklistItemProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 py-2 text-left"
    >
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors"
        style={{
          background: checked ? 'var(--forest-600)' : 'transparent',
          borderColor: checked ? 'var(--forest-600)' : '#dce3de',
        }}
      >
        {checked && <Check size={13} color="#fff" />}
      </span>
      <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
    </button>
  )
}
