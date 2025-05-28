// src/lib/dashboard-accent.ts
export const accent = {
  heart:   { ring: "ring-rose-00",  icon: "text-rose-500",   badge: "bg-rose-50" },
  oxygen:  { ring: "ring-teal-100",  icon: "text-teal-500",   badge: "bg-teal-50" },
  temp:    { ring: "ring-amber-100", icon: "text-amber-500", badge: "bg-amber-50" },
  humid:   { ring: "ring-sky-100",   icon: "text-sky-500",    badge: "bg-sky-50"  },
  pressure:{ ring: "ring-indigo-100", icon: "text-indigo-500",  badge: "bg-indigo-50" },
} as const;

export type AccentKey = keyof typeof accent;
