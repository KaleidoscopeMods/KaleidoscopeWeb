import type { CanonicalItemName } from '../data/item-images'
import { getItemImageEntry } from '../data/item-images'
import { getItemMeta, type ItemMeta } from '../data/item-meta'

export interface ResolvedItemDisplay {
  id: CanonicalItemName
  src: string
  displayName: string
  meta?: ItemMeta
}

function fallbackDisplayName(id: CanonicalItemName): string {
  return id
}

export function resolveItemDisplay(name: string): ResolvedItemDisplay | undefined {
  const entry = getItemImageEntry(name)

  if (!entry) return undefined

  const meta = getItemMeta(entry.name)

  return {
    id: entry.name,
    src: entry.src,
    displayName: meta?.name?.zhCN?.trim() || fallbackDisplayName(entry.name),
    meta,
  }
}
