<script setup lang="ts">
import { computed } from 'vue'

type HeartState = 'full' | 'half' | 'empty'

const props = defineProps<{
  value?: number | string
  size?: number | string
  total?: number | string
  absorption?: boolean | number | string
  notag?: boolean | number | string
}>()

function toNumber(value: unknown, fallback = 0) {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : fallback
}

function toBoolean(value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return true
    return !['0', 'false', 'no', 'off'].includes(normalized)
  }
  return false
}

function formatHalfStep(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

const normalizedValue = computed(() => Math.max(0, toNumber(props.value, 0)))

const normalizedSize = computed(() => {
  if (props.size === undefined || props.size === null || props.size === '') {
    return '9px'
  }

  return typeof props.size === 'number' ? `${props.size}px` : props.size
})

const normalizedTotal = computed(() => Math.max(0, toNumber(props.total, 0)))
const isAbsorption = computed(() => toBoolean(props.absorption))
const hideTag = computed(() => toBoolean(props.notag))
const compactMode = computed(() => normalizedValue.value >= 16)
const compactCount = computed(() => normalizedValue.value / 2)
const valueText = computed(() => formatHalfStep(normalizedValue.value))
const compactCountText = computed(() => formatHalfStep(compactCount.value))

const iconStates = computed<HeartState[]>(() => {
  if (compactMode.value) {
    return []
  }

  const slotCount = normalizedTotal.value > 0
    ? Math.max(1, Math.ceil(normalizedTotal.value / 2))
    : Math.max(1, Math.ceil(normalizedValue.value / 2))

  return Array.from({ length: slotCount }, (_, index) => {
    const slotValue = normalizedValue.value - index * 2

    if (slotValue >= 2) return 'full'
    if (slotValue >= 1) return 'half'
    return 'empty'
  }).filter((state, index) => normalizedTotal.value > 0 || state !== 'empty' || index === 0)
})

const themeClass = computed(() => isAbsorption.value ? 'health-points--absorption' : 'health-points--normal')

const ariaLabel = computed(() => {
  const prefix = isAbsorption.value ? '伤害吸收值' : '生命值'

  if (hideTag.value) {
    return `${prefix} ${valueText.value}`
  }

  return compactMode.value
    ? `${prefix} ${valueText.value}，${compactCountText.value} 颗心`
    : `${prefix} ${valueText.value}`
})
</script>

<template>
  <span class="health-points" :class="themeClass" :aria-label="ariaLabel">
    <span class="health-points__value">{{ valueText }}</span>
    <span v-if="!hideTag" class="health-points__tag">
      <span class="health-points__paren">（</span>
      <span v-if="compactMode" class="health-points__compact" aria-hidden="true">
        <span class="health-points__icon health-points__icon--full" :style="{ width: normalizedSize, height: normalizedSize }" />
        <span class="health-points__times">×</span>
        <span class="health-points__count">{{ compactCountText }}</span>
      </span>
      <span v-else class="health-points__icons" aria-hidden="true">
        <span
          v-for="(state, index) in iconStates"
          :key="index"
          class="health-points__icon"
          :class="`health-points__icon--${state}`"
          :style="{ width: normalizedSize, height: normalizedSize }"
        />
      </span>
      <span class="health-points__paren">）</span>
    </span>
  </span>
</template>

<style scoped>
.health-points {
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
  vertical-align: middle;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.health-points__value {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.health-points__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.12em;
  color: var(--vp-c-text-2);
}

.health-points__icons,
.health-points__compact {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.health-points__icon {
  display: inline-block;
  flex: 0 0 auto;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  image-rendering: pixelated;
}

.health-points--normal .health-points__icon--full {
  background-image: url('/image/mcui/Heart_(icon).png');
}

.health-points--normal .health-points__icon--half {
  background-image: url('/image/mcui/Half_Heart_(icon).png');
}

.health-points--normal .health-points__icon--empty {
  background-image: url('/image/mcui/Empty_Heart_(icon).png');
}

.health-points--absorption .health-points__icon--full {
  background-image: url('/image/mcui/Absorption_Heart_(icon).png');
}

.health-points--absorption .health-points__icon--half {
  background-image: url('/image/mcui/Half_Absorption_Heart_(icon).png');
}

.health-points--absorption .health-points__icon--empty {
  background-image: url('/image/mcui/Empty_Heart_(icon).png');
}

.health-points__paren,
.health-points__times,
.health-points__count {
  line-height: 1;
}
</style>
