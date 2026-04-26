<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hunger: number
  saturation?: number
}>()

const normalizedHunger = computed(() => Math.max(0, Math.min(20, Number(props.hunger) || 0)))

const iconStates = computed(() => {
  return Array.from({ length: 10 }, (_, index) => {
    const value = normalizedHunger.value - index * 2

    if (value >= 2) return 'full'
    if (value >= 1) return 'half'
    return null
  }).filter((state): state is 'full' | 'half' => state !== null)
})

const hungerText = computed(() => normalizedHunger.value.toString())

const saturationText = computed(() => {
  if (props.saturation === undefined) return null
  const saturation = Number(props.saturation)
  return Number.isFinite(saturation) ? saturation.toString() : null
})

const ariaLabel = computed(() => {
  if (saturationText.value === null) {
    return `饥饿值 ${hungerText.value}`
  }

  return `饥饿值 ${hungerText.value}，饱和度 ${saturationText.value}`
})
</script>

<template>
  <span class="food-points" :aria-label="ariaLabel">
    <span class="food-points__value">{{ hungerText }}</span>
    <span class="food-points__tag" aria-hidden="true">
      <span class="food-points__paren">（</span>
      <span class="food-points__icons">
        <span
          v-for="(state, index) in iconStates"
          :key="index"
          class="food-points__icon"
          :class="`food-points__icon--${state}`"
        />
      </span>
      <span class="food-points__paren">）</span>
    </span>
    <span v-if="saturationText !== null" class="food-points__text">
      +{{ saturationText }} 饱和度
    </span>
  </span>
</template>

<style scoped>
.food-points {
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
  vertical-align: middle;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.food-points__value {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.food-points__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.12em;
  color: var(--vp-c-text-2);
}

.food-points__icons {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.food-points__icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  image-rendering: pixelated;
}

.food-points__icon--full {
  background-image: url('/image/mcui/Hunger.svg');
}

.food-points__icon--half {
  background-image: url('/image/mcui/Half_Hunger.svg');
}

.food-points__paren,
.food-points__text {
  color: var(--vp-c-text-2);
}

.food-points__text {
  margin-left: 0.18em;
  font-size: 0.92em;
  line-height: 1;
}
</style>
