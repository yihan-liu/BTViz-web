"use client"

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  value: string          // "14:30"
  onChange: (v: string) => void
  step?: number          // minute increment (default 15)
  className?: string
  placeholder?: string   // shown when no time picked
}

/* --- helpers ----------------------------------------------------------- */
const to12h = (t: string) => {
  const [H, M] = t.split(":").map(Number)
  const ampm = H >= 12 ? "PM" : "AM"
  const hour = ((H + 11) % 12) + 1 // converts 0‒23 ➜ 1‒12
  return `${hour}:${M.toString().padStart(2, "0")} ${ampm}`
}
/* ---------------------------------------------------------------------- */

export default function TimePicker({
  value,
  onChange,
  step = 15,
  className = "",
  placeholder = "– : –",
}: Props) {
  // build ["00:00","00:15",…]
  const times = Array.from({ length: (60 / step) * 24 }, (_, i) => {
    const h = String(Math.floor((i * step) / 60)).padStart(2, "0")
    const m = String((i * step) % 60).padStart(2, "0")
    return `${h}:${m}`
  })

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-[100px] justify-between ${className}`}>
        <SelectValue placeholder={placeholder}>
          {value ? to12h(value) : null}
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="max-h-60">
        {times.map((t) => (
          <SelectItem key={t} value={t} className="text-sm">
            {to12h(t)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
