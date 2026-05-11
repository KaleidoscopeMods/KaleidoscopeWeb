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

const FRAME_SRC: Record<FrameType, string> = {
  task: '/image/mcui/Advancement-plain-raw.png',
  goal: '/image/mcui/Advancement-oval-raw.png',
  challenge: '/image/mcui/Advancement-fancy-raw.png',
}

// Frame PNGs are 52x52. The slot floor (where items rest) is centered at (25.5, 25.5),
// matching the geometric center. Items are rendered at 16/26 of the frame to match the
// vanilla Minecraft ratio of a 16x16 item inside a 26x26 advancement texture.
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

const frameStyle = computed(() => ({
  width: normalizedSize.value,
  height: normalizedSize.value,
  backgroundImage: `url(${frameSrc.value})`,
}))

const itemSrc = computed(() => {
  if (!props.item) return undefined
  const entry = getItemImageEntry(props.item)
  return entry?.src
})

const tooltipLabel = computed(() => props.title?.trim() || undefined)
</script>

<template>
  <McTooltip :label="tooltipLabel ?? ''" :disabled="!tooltipLabel" placement="top">
    <span class="advancement-icon" :style="frameStyle" :aria-label="tooltipLabel">
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  image-rendering: pixelated;
  line-height: 0;
  box-sizing: content-box;
  padding: 0;
  margin: 0;
}

.advancement-icon__item {
  display: block;
  object-fit: contain;
  image-rendering: pixelated;
  flex: 0 0 auto;
}
</style>
