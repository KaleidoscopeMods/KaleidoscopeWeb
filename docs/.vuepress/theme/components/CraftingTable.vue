<script setup lang="ts">
import { computed } from 'vue'
import ItemAnimate from './ItemAnimate.vue'
import McTooltip from './McTooltip.vue'
import { resolveItemAnimateEntries } from '../utils/resolve-item-animate'
import { resolveItemDisplay } from '../utils/resolve-item-display'

const RECIPE_ICONS = {
  shapeless: '/image/mcui/Grid_layout_Shapeless.png',
  fixed: '/image/mcui/Grid_layout_Fixed.png',
  custom: '/image/mcui/Grid_layout_Custom.png',
  transmute: '/image/mcui/Grid_layout_Transmute.png',
} as const

type CraftingRecipeIcon = keyof typeof RECIPE_ICONS

interface CraftingSlotInputObject {
  id?: string
  ids?: string[]
  count?: number | string
  title?: string
}

type CraftingSlotInput = string | string[] | CraftingSlotInputObject | null | undefined

type NormalizedSlotMode = 'single' | 'multi'

interface NormalizedSlot {
  key: string
  empty: boolean
  mode?: NormalizedSlotMode
  id?: string
  src?: string
  displayName?: string
  tooltipLabel?: string
  count?: number
  unresolved?: boolean
  items?: string[]
}

const props = defineProps<{
  grid: CraftingSlotInput[]
  result?: CraftingSlotInput
  icon?: CraftingRecipeIcon | ''
}>()

function normalizeCount(value: unknown) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 1
    ? Math.floor(numericValue)
    : undefined
}

function normalizeStringArray(values: string[] | undefined) {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => typeof value === 'string' ? value.trim() : '')
    .filter(Boolean)
}

function toSlotInput(value: CraftingSlotInput) {
  if (value === null || value === undefined) {
    return null
  }

  if (Array.isArray(value)) {
    const ids = normalizeStringArray(value)
    return ids.length > 0
      ? {
          ids,
        }
      : null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? { id: trimmed } : null
  }

  const ids = normalizeStringArray(value.ids)
  const id = value.id?.trim()

  if (!id && ids.length === 0) {
    return null
  }

  return {
    id: id || undefined,
    ids: ids.length > 0 ? ids : undefined,
    count: normalizeCount(value.count),
    title: value.title?.trim() || undefined,
  }
}

function normalizeSlot(value: CraftingSlotInput, key: string): NormalizedSlot {
  const slotInput = toSlotInput(value)

  if (!slotInput) {
    return {
      key,
      empty: true,
    }
  }

  const candidateTokens = slotInput.ids?.length
    ? slotInput.ids
    : slotInput.id
      ? [slotInput.id]
      : []

  const resolvedCandidates = resolveItemAnimateEntries(undefined, candidateTokens, { preserveDuplicates: true })
  const resolvedItems = resolvedCandidates.entries.map((entry) => entry.name)

  if (resolvedItems.length === 0) {
    const fallbackLabel = slotInput.title || candidateTokens.join(', ') || slotInput.id || 'Unknown item'

    if (__VUEPRESS_DEV__) {
      console.warn('[CraftingTable] unresolved item id(s):', candidateTokens)
    }

    return {
      key,
      empty: false,
      mode: slotInput.ids?.length ? 'multi' : 'single',
      id: slotInput.id,
      displayName: fallbackLabel,
      tooltipLabel: fallbackLabel,
      count: slotInput.count,
      unresolved: true,
      items: slotInput.ids?.length ? candidateTokens : undefined,
    }
  }

  if (resolvedCandidates.missingNames.length > 0 && __VUEPRESS_DEV__) {
    console.warn('[CraftingTable] partially unresolved item id(s):', resolvedCandidates.missingNames)
  }

  if (resolvedItems.length > 1) {
    return {
      key,
      empty: false,
      mode: 'multi',
      tooltipLabel: slotInput.title,
      count: slotInput.count,
      items: resolvedItems,
    }
  }

  const resolved = resolveItemDisplay(resolvedItems[0]!)

  if (!resolved) {
    return {
      key,
      empty: false,
      mode: 'single',
      id: resolvedItems[0],
      displayName: slotInput.title || resolvedItems[0],
      tooltipLabel: slotInput.title || resolvedItems[0],
      count: slotInput.count,
      unresolved: true,
    }
  }

  return {
    key,
    empty: false,
    mode: 'single',
    id: resolved.id,
    src: resolved.src,
    displayName: slotInput.title || resolved.displayName,
    tooltipLabel: slotInput.title || resolved.displayName,
    count: slotInput.count,
  }
}

const normalizedGrid = computed(() => {
  const inputGrid = Array.isArray(props.grid) ? props.grid.slice(0, 9) : []

  if (__VUEPRESS_DEV__ && inputGrid.length !== 9) {
    console.warn(`[CraftingTable] expected grid length 9, received ${inputGrid.length}`)
  }

  const paddedGrid = [...inputGrid]
  while (paddedGrid.length < 9) {
    paddedGrid.push(null)
  }

  return paddedGrid.map((slot, index) => normalizeSlot(slot, `grid-${index}`))
})

const normalizedResult = computed(() => normalizeSlot(props.result, 'result'))

const normalizedIcon = computed<CraftingRecipeIcon | undefined>(() => {
  if (!props.icon) {
    return undefined
  }

  if (props.icon in RECIPE_ICONS) {
    return props.icon
  }

  if (__VUEPRESS_DEV__) {
    console.warn('[CraftingTable] unsupported icon type:', props.icon)
  }

  return undefined
})

const iconSrc = computed(() => normalizedIcon.value ? RECIPE_ICONS[normalizedIcon.value] : undefined)
const iconAlt = computed(() => normalizedIcon.value ? `${normalizedIcon.value} recipe` : '')

function countText(slot: NormalizedSlot) {
  return slot.count && slot.count > 1 ? String(slot.count) : ''
}
</script>

<template>
  <span class="mcui mcui-crafting-table">
    <span v-if="iconSrc" class="mcui-crafting-table__icons">
      <span
        class="mcui-crafting-table__recipe-icon"
        :class="`mcui-crafting-table__recipe-icon--${normalizedIcon}`"
        :title="normalizedIcon"
      >
        <img :src="iconSrc" :alt="iconAlt">
      </span>
    </span>

    <span class="mcui-crafting-table__grid" aria-label="crafting ingredients">
      <span
        v-for="slot in normalizedGrid"
        :key="slot.key"
        class="mcui-crafting-table__slot"
        :class="{
          'mcui-crafting-table__slot--empty': slot.empty,
          'mcui-crafting-table__slot--unresolved': slot.unresolved,
        }"
      >
        <template v-if="!slot.empty">
          <ItemAnimate
            v-if="slot.mode === 'multi' && slot.items?.length"
            class="mcui-crafting-table__slot-inner"
            :items="slot.items"
            width="24px"
            height="24px"
            :label="slot.tooltipLabel"
            :alt="slot.tooltipLabel"
          />
          <McTooltip v-else :label="slot.tooltipLabel" placement="top">
            <span class="mcui-crafting-table__slot-inner">
              <img
                v-if="slot.src"
                class="mcui-crafting-table__item-image"
                :src="slot.src"
                :alt="slot.displayName || slot.id"
              >
              <span v-else class="mcui-crafting-table__missing-item" aria-hidden="true">?</span>
            </span>
          </McTooltip>
          <span v-if="countText(slot)" class="mcui-crafting-table__count">{{ countText(slot) }}</span>
        </template>
      </span>
    </span>

    <span class="mcui-crafting-table__arrow" aria-hidden="true" />

    <span class="mcui-crafting-table__output" aria-label="crafting result">
      <span
        class="mcui-crafting-table__slot"
        :class="{
          'mcui-crafting-table__slot--empty': normalizedResult.empty,
          'mcui-crafting-table__slot--unresolved': normalizedResult.unresolved,
        }"
      >
        <template v-if="!normalizedResult.empty">
          <ItemAnimate
            v-if="normalizedResult.mode === 'multi' && normalizedResult.items?.length"
            class="mcui-crafting-table__slot-inner"
            :items="normalizedResult.items"
            width="24px"
            height="24px"
            :label="normalizedResult.tooltipLabel"
            :alt="normalizedResult.tooltipLabel"
          />
          <McTooltip v-else :label="normalizedResult.tooltipLabel" placement="top">
            <span class="mcui-crafting-table__slot-inner">
              <img
                v-if="normalizedResult.src"
                class="mcui-crafting-table__item-image"
                :src="normalizedResult.src"
                :alt="normalizedResult.displayName || normalizedResult.id"
              >
              <span v-else class="mcui-crafting-table__missing-item" aria-hidden="true">?</span>
            </span>
          </McTooltip>
          <span v-if="countText(normalizedResult)" class="mcui-crafting-table__count">{{ countText(normalizedResult) }}</span>
        </template>
      </span>
    </span>
  </span>
</template>

<style scoped>
.mcui-crafting-table {
  display: inline-grid;
  grid-template-columns: auto 32px auto;
  align-items: start;
  gap: 4px;
  position: relative;
}

.mcui-crafting-table__grid {
  display: grid;
  grid-template-columns: repeat(3, 32px);
  grid-template-rows: repeat(3, 32px);
  gap: 2px;
}

.mcui-crafting-table__output {
  padding-top: 34px;
}

.mcui-crafting-table__slot {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #8b8b8b;
  border: 2px solid;
  border-color: #373737 #fff #fff #373737;
  box-shadow: inset 2px 2px 0 rgb(0 0 0 / 25%);
}

.mcui-crafting-table__slot-inner {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.mcui-crafting-table__slot--empty {
  background: #8b8b8b;
}

.mcui-crafting-table__slot--unresolved {
  color: #fff;
}

.mcui-crafting-table__item-image {
  display: block;
  width: 24px;
  height: 24px;
  object-fit: contain;
  image-rendering: pixelated;
}

.mcui-crafting-table :deep(.item-animate-wrapper) {
  display: inline-flex;
  width: 24px;
  height: 24px;
}

.mcui-crafting-table :deep(.item-animate) {
  width: 24px;
  height: 24px;
}

.mcui-crafting-table__missing-item {
  font-family: var(--mc-tooltip-font-stack);
  font-size: 16px;
  line-height: 1;
}

.mcui-crafting-table__count {
  position: absolute;
  right: 1px;
  bottom: 0;
  color: #fff;
  font-family: var(--mc-tooltip-font-stack);
  font-size: 12px;
  line-height: 1;
  text-shadow: 1px 1px 0 #000;
  pointer-events: none;
}

.mcui-crafting-table__arrow {
  width: 32px;
  height: 26px;
  align-self: center;
  background: url('/image/mcui/Grid_layout_Arrow_(small).png') center / contain no-repeat;
}

.mcui-crafting-table__icons {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
}

.mcui-crafting-table__recipe-icon {
  display: inline-flex;
  width: 19px;
  height: 15px;
}

.mcui-crafting-table__recipe-icon img {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}
</style>
