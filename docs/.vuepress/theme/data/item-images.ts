export const itemImageMap = {
  'Coal Ore': '/image/items/coal_ore.png',
  'Iron Ore': '/image/items/iron_ore.png',
  'Gold Ore': '/image/items/gold_ore.png',
  'Lapis Lazuli Ore': '/image/items/lapis_lazuli_ore.png',
  'Redstone Ore': '/image/items/redstone_ore.png',
  'Emerald Ore': '/image/items/emerald_ore.png',
  'Diamond Ore': '/image/items/diamond_ore.png',
  'Nether Quartz Ore': '/image/items/nether_quartz_ore.png',
  'Nether Gold Ore': '/image/items/nether_gold_ore.png',
} as const

export type CanonicalItemName = keyof typeof itemImageMap

export function normalizeItemName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

const normalizedItemImageMap = new Map(
  Object.entries(itemImageMap).map(([name, src]) => [normalizeItemName(name), { name, src }])
)

export function getItemImageEntry(name: string): { name: CanonicalItemName; src: string } | undefined {
  const entry = normalizedItemImageMap.get(normalizeItemName(name))

  if (!entry) return undefined

  return {
    name: entry.name as CanonicalItemName,
    src: entry.src,
  }
}
