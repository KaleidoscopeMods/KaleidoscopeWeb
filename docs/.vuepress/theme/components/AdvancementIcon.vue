<script setup lang="ts">
import { computed } from 'vue'
import McTooltip from './McTooltip.vue'
import { getItemImageEntry } from '../data/item-images'

type FrameType = 'task' | 'goal' | 'challenge'

const props = defineProps<{
  item?: string
  frame?: FrameType
  size?: number | string
  title?: string
}>()

// Frame PNGs are 52x52. Each frame's slot has a measured center and size:
//   plain:     slot 32x32, center (24.5, 24.5) — bevel shadow biases right/bottom
//   oval:      slot 32x32, center (24.5, 24.5)
//   challenge: slot 32x32, center (25.5, 25.5) — symmetric tassels
const FRAME_META: Record<FrameType, {
  src: string
  slotSize: number
  slotCenterX: number
  slotCenterY: number
}> = {
  task: {
    src: '/image/mcui/Advancement-plain-raw.png',
    slotSize: 32,
    slotCenterX: 24.5,
    slotCenterY: 24.5,
  },
  goal: {
    src: '/image/mcui/Advancement-oval-raw.png',
    slotSize: 32,
    slotCenterX: 24.5,
    slotCenterY: 24.5,
  },
  challenge: {
    src: '/image/mcui/Advancement-fancy-raw.png',
    slotSize: 32,
    slotCenterX: 25.5,
    slotCenterY: 25.5,
  },
}

const FRAME_CANVAS = 52

const normalizedFrame = computed<FrameType>(() => {
  const f = props.frame?.trim().toLowerCase()
  if (f === 'goal' || f === 'challenge') return f
  return 'task'
})

const frameMeta = computed(() => FRAME_META[normalizedFrame.value])
const frameSrc = computed(() => frameMeta.value.src)

const normalizedSize = computed(() => {
  if (props.size === undefined || props.size === null || props.size === '') {
    return '52px'
  }
  return typeof props.size === 'number' ? `${props.size}px` : props.size
})

const sizeNumber = computed(() => {
  const parsed = parseFloat(normalizedSize.value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 52
})

const itemIconSize = computed(() => `${sizeNumber.value * frameMeta.value.slotSize / FRAME_CANVAS}px`)
const itemCenterX = computed(() => `${sizeNumber.value * frameMeta.value.slotCenterX / FRAME_CANVAS}px`)
const itemCenterY = computed(() => `${sizeNumber.value * frameMeta.value.slotCenterY / FRAME_CANVAS}px`)

const itemSrc = computed(() => {
  if (!props.item) return undefined
  const entry = getItemImageEntry(props.item)
  return entry?.src
})

const tooltipLabel = computed(() => props.title?.trim() || undefined)
</script>

<template>
  <McTooltip :label="tooltipLabel ?? ''" :disabled="!tooltipLabel" placement="top">
    <span
      class="advancement-icon"
      :style="{ width: normalizedSize, height: normalizedSize }"
      :aria-label="tooltipLabel"
    >
      <img
        class="advancement-icon__frame"
        :src="frameSrc"
        alt=""
        aria-hidden="true"
      >
      <img
        v-if="itemSrc"
        class="advancement-icon__item"
        :src="itemSrc"
        :alt="tooltipLabel || item || ''"
        :style="{
          width: itemIconSize,
          height: itemIconSize,
          left: itemCenterX,
          top: itemCenterY,
        }"
      >
    </span>
  </McTooltip>
</template>

<style scoped>
.advancement-icon {
  display: inline-block;
  position: relative;
  vertical-align: middle;
  line-height: 0;
}

.advancement-icon__frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.advancement-icon__item {
  position: absolute;
  transform: translate(-50%, -50%);
  object-fit: contain;
  image-rendering: pixelated;
  z-index: 1;
}
</style>
