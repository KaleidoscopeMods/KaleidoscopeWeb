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

// Frame PNGs are 52x52 with the slot interior (RGB 198,198,198) centered at (25.5, 25.5).
// Item icons are rendered at 16/26 of the frame, matching vanilla Minecraft's 16x16 item
// inside a 26x26 advancement texture.
const FRAME_SRC: Record<FrameType, string> = {
  task: '/image/mcui/Advancement-plain-raw.png',
  goal: '/image/mcui/Advancement-oval-raw.png',
  challenge: '/image/mcui/Advancement-fancy-raw.png',
}

const ITEM_RATIO = 16 / 26

const normalizedFrame = computed<FrameType>(() => {
  const f = props.frame?.trim().toLowerCase()
  if (f === 'goal' || f === 'challenge') return f
  return 'task'
})

const frameSrc = computed(() => FRAME_SRC[normalizedFrame.value])

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

const itemIconSize = computed(() => `${sizeNumber.value * ITEM_RATIO}px`)

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
        :style="{ width: itemIconSize, height: itemIconSize }"
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  object-fit: contain;
  image-rendering: pixelated;
  z-index: 1;
}
</style>
