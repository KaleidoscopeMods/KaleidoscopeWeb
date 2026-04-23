import { getItemImageEntry, normalizeItemName } from '../data/item-images'
import { itemAliasMap, itemGroupMap } from '../data/item-groups'

export interface ResolvedItemAnimateEntry {
  name: string
  src: string
}

export interface ResolveItemAnimateResult {
  entries: ResolvedItemAnimateEntry[]
  missingNames: string[]
}

type InputValue = string | string[] | undefined

const normalizedGroupMap = new Map(
  Object.entries(itemGroupMap).map(([name, items]) => [normalizeItemName(name), [...items]])
)

const normalizedAliasMap = new Map(
  Object.entries(itemAliasMap).map(([name, value]) => [normalizeItemName(name), value])
)

function toInputList(name: InputValue, items: string[] | undefined): string[] {
  if (Array.isArray(items) && items.length > 0) {
    return items
  }

  if (Array.isArray(name)) {
    return name
  }

  if (typeof name === 'string' && name.trim()) {
    return [name]
  }

  return []
}

function resolveToken(token: string, visited = new Set<string>()): { names: string[]; missing: string[] } {
  const normalizedToken = normalizeItemName(token)

  if (!normalizedToken) {
    return { names: [], missing: [] }
  }

  if (visited.has(normalizedToken)) {
    return { names: [], missing: [token] }
  }

  const nextVisited = new Set(visited)
  nextVisited.add(normalizedToken)

  const aliasTarget = normalizedAliasMap.get(normalizedToken)
  if (aliasTarget) {
    return resolveToken(aliasTarget, nextVisited)
  }

  const groupItems = normalizedGroupMap.get(normalizedToken)
  if (groupItems) {
    return groupItems.reduce(
      (result, itemName) => {
        const resolved = resolveToken(itemName, nextVisited)
        result.names.push(...resolved.names)
        result.missing.push(...resolved.missing)
        return result
      },
      { names: [] as string[], missing: [] as string[] }
    )
  }

  const itemEntry = getItemImageEntry(token)
  if (itemEntry) {
    return { names: [itemEntry.name], missing: [] }
  }

  return { names: [], missing: [token] }
}

export function resolveItemAnimateEntries(name: InputValue, items?: string[]): ResolveItemAnimateResult {
  const inputList = toInputList(name, items)
  const entries: ResolvedItemAnimateEntry[] = []
  const missingNames: string[] = []
  const seen = new Set<string>()

  for (const rawToken of inputList) {
    const token = typeof rawToken === 'string' ? rawToken.trim() : ''
    if (!token) continue

    const resolved = resolveToken(token)
    missingNames.push(...resolved.missing)

    for (const resolvedName of resolved.names) {
      const normalizedName = normalizeItemName(resolvedName)
      if (seen.has(normalizedName)) continue

      const entry = getItemImageEntry(resolvedName)
      if (!entry) {
        missingNames.push(resolvedName)
        continue
      }

      seen.add(normalizedName)
      entries.push({
        name: entry.name,
        src: entry.src,
      })
    }
  }

  return {
    entries,
    missingNames: Array.from(new Set(missingNames.map((item) => item.trim()).filter(Boolean))),
  }
}
