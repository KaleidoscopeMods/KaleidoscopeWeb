<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveItemAnimateEntries } from '../utils/resolve-item-animate'

const props = defineProps<{
  name?: string | string[]
  items?: string[]
  interval?: number
  width?: number | string
  height?: number | string
  containerWidth?: number | string
  containerHeight?: number | string
  align?: 'left' | 'center' | 'right'
  alt?: string
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

function normalizeSize(value: number | string | undefined | null, fallback: string): string {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  return typeof value === 'number' ? `${value}px` : value
}

const normalizedWidth = computed(() => normalizeSize(props.width, '24px'))
const normalizedHeight = computed(() => normalizeSize(props.height, normalizedWidth.value))
const normalizedContainerWidth = computed(() => normalizeSize(props.containerWidth, normalizedWidth.value))
const normalizedContainerHeight = computed(() => normalizeSize(props.containerHeight, normalizedHeight.value))

const normalizedAlign = computed(() => {
  if (props.align === 'left' || props.align === 'right' || props.align === 'center') {
    return props.align
  }

  return 'center'
})

const containerJustifyContent = computed(() => {
  switch (normalizedAlign.value) {
    case 'left':
      return 'flex-start'
    case 'right':
      return 'flex-end'
    default:
      return 'center'
  }
})

const currentEntry = computed(() => {
  if (entries.value.length === 0) {
    return null
  }

  return entries.value[currentIndex.value] ?? entries.value[0]
})

const fallbackText = computed(() => {
  const rawValue = props.items?.length
    ? props.items.join(', ')
    : Array.isArray(props.name)
      ? props.name.join(', ')
      : props.name

  return rawValue?.trim() || 'ItemAnimate: unresolved'
})

const altText = computed(() => props.alt?.trim() || currentEntry.value?.name || fallbackText.value)

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
  <span
    class="item-animate-container"
    :style="{
      width: normalizedContainerWidth,
      height: normalizedContainerHeight,
      justifyContent: containerJustifyContent,
    }"
  >
    <span
      v-if="currentEntry"
      class="item-animate"
      :style="{ width: normalizedWidth, height: normalizedHeight }"
    >
      <img
        class="item-animate__image"
        :src="currentEntry.src"
        :alt="altText"
        :title="currentEntry.name"
        :width="normalizedWidth"
        :height="normalizedHeight"
      >
    </span>
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
.item-animate-container {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  overflow: hidden;
}

.item-animate {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.item-animate__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
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
