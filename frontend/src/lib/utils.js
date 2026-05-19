import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names safely, handling Tailwind CSS conflicts.
 * Common in shadcn/ui components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
