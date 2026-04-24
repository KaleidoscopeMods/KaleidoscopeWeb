<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import McTooltip from './McTooltip.vue'
import { resolveItemAnimateEntries } from '../utils/resolve-item-animate'
import { resolveItemDisplay } from '../utils/resolve-item-display'

type ItemAnimateAlign = 'left' | 'center' | 'right'

const props = defineProps<{
  name?: string | string[]
  items?: string[]
  interval?: number
  size?: number | string
  width?: number | string
  height?: number | string
  align?: ItemAnimateAlign
  alt?: string
  label?: string
}>()

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const resolved = computed(() => resolveItemAnimateEntries(props.name, props.items))
const entries = computed(() => resolved.value.entries)
const missingNames = computed(() => resolved.value.missingNames)

const normalizedInterval = computed(() => {
  const value = Number(props.interval)
  return Number.isFinite(value) && value > 0 ? value : 2000
})

const normalizedSize = computed(() => {
  if (props.size === undefined || props.size === null || props.size === '') {
    return undefined
  }

  return typeof props.size === 'number' ? `${props.size}px` : props.size
})

const normalizedWidth = computed(() => {
  if (props.width === undefined || props.width === null || props.width === '') {
    return normalizedSize.value ?? '24px'
  }

  return typeof props.width === 'number' ? `${props.width}px` : props.width
})

const normalizedHeight = computed(() => {
  if (props.height === undefined || props.height === null || props.height === '') {
    return normalizedSize.value ?? normalizedWidth.value
  }

  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

const normalizedAlign = computed<ItemAnimateAlign | undefined>(() => {
  if (!props.align) return undefined

  return ['left', 'center', 'right'].includes(props.align) ? props.align : undefined
})

const wrapperStyle = computed(() => {
  if (!normalizedAlign.value) {
    return undefined
  }

  return {
    display: 'block',
    width: '100%',
    textAlign: normalizedAlign.value,
  }
})

const currentEntry = computed(() => {
  if (entries.value.length === 0) {
    return null
  }

  return entries.value[currentIndex.value] ?? entries.value[0]
})

const currentDisplay = computed(() => {
  if (!currentEntry.value) {
    return null
  }

  return resolveItemDisplay(currentEntry.value.name)
})

const fallbackText = computed(() => {
  const rawValue = props.items?.length
    ? props.items.join(', ')
    : Array.isArray(props.name)
      ? props.name.join(', ')
      : props.name

  return rawValue?.trim() || 'ItemAnimate: unresolved'
})

const tooltipLabel = computed(() => props.label?.trim() || currentDisplay.value?.displayName || currentEntry.value?.name || fallbackText.value)
const altText = computed(() => props.alt?.trim() || tooltipLabel.value)

function stopTimer() {
  if (!timer) return
  clearInterval(timer)
  timer = undefined
}

function startTimer() {
  stopTimer()

  if (entries.value.length <= 1) {
    currentIndex.value = 0
    return
  }

  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % entries.value.length
  }, normalizedInterval.value)
}

watch(
  [entries, normalizedInterval],
  () => {
    currentIndex.value = 0
    startTimer()
  },
  { immediate: false }
)

watch(
  missingNames,
  (names) => {
    if (names.length > 0) {
      console.warn('[ItemAnimate] unresolved items:', names)
    }
  },
  { immediate: true }
)

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
})
</script>

<template>
  <span class="item-animate-wrapper" :style="wrapperStyle">
    <McTooltip
      v-if="currentEntry"
      :label="tooltipLabel"
      placement="top"
      :disabled="!tooltipLabel"
    >
      <span
        class="item-animate"
        :style="{ width: normalizedWidth, height: normalizedHeight }"
      >
        <img
          class="item-animate__image"
          :src="currentEntry.src"
          :alt="altText"
          :width="normalizedWidth"
          :height="normalizedHeight"
        >
      </span>
    </McTooltip>
    <span
      v-else
      class="item-animate item-animate--fallback"
      :title="missingNames.length ? `Missing: ${missingNames.join(', ')}` : undefined"
    >
      {{ fallbackText }}
    </span>
  </span>
</template>

<style scoped>
.item-animate-wrapper {
  display: inline-block;
  vertical-align: middle;
}

.item-animate {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  overflow: hidden;
}

.item-animate__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.item-animate--fallback {
  min-height: 1.5em;
  padding: 0 0.4em;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text-2);
  font-size: 0.9em;
  line-height: 1.5;
  white-space: nowrap;
}
</style>
