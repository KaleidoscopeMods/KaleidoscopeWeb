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

const frameMap: Record<FrameType, string> = {
  task: '/image/mcui/Advancement-plain-raw.png',
  goal: '/image/mcui/Advancement-oval-raw.png',
  challenge: '/image/mcui/Advancement-fancy-raw.png',
}

const normalizedFrame = computed<FrameType>(() => {
  const f = props.frame?.trim().toLowerCase()
  if (f === 'goal' || f === 'challenge') return f
  return 'task'
})

const frameSrc = computed(() => frameMap[normalizedFrame.value])

const normalizedSize = computed(() => {
  if (props.size === undefined || props.size === null || props.size === '') {
    return '52px'
  }
  return typeof props.size === 'number' ? `${props.size}px` : props.size
})

const itemIconSize = computed(() => {
  const sizeNum = parseInt(normalizedSize.value)
  const iconSize = Math.round(sizeNum * 0.615)
  return `${iconSize}px`
})

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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  vertical-align: middle;
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
  position: relative;
  object-fit: contain;
  image-rendering: pixelated;
  z-index: 1;
}
</style>
