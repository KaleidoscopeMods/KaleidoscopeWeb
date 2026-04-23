<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hunger: number
  saturation?: number
}>()

const iconStates = computed(() => {
  const hunger = Math.max(0, Math.min(20, Number(props.hunger) || 0))

  return Array.from({ length: 10 }, (_, index) => {
    const value = hunger - index * 2

    if (value >= 2) return 'full'
    if (value >= 1) return 'half'
    return null
  }).filter((state): state is 'full' | 'half' => state !== null)
})

const saturationText = computed(() => {
  if (props.saturation === undefined) return null
  const saturation = Number(props.saturation)
  return Number.isFinite(saturation) ? saturation.toString() : null
})

const ariaLabel = computed(() => {
  if (saturationText.value === null) {
    return `饥饿值 ${props.hunger}`
  }

  return `饥饿值 ${props.hunger}，饱和度 ${saturationText.value}`
})
</script>

<template>
  <span class="food-points" :aria-label="ariaLabel">
    <span class="food-points__icons" aria-hidden="true">
      <span
        v-for="(state, index) in iconStates"
        :key="index"
        class="food-points__icon"
        :class="`food-points__icon--${state}`"
      />
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
  gap: 0.45em;
  vertical-align: middle;
  white-space: nowrap;
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
}

.food-points__icon--full {
  background-image: url('/image/mcui/Hunger.svg');
}

.food-points__icon--half {
  background-image: url('/image/mcui/Half_Hunger.svg');
}

.food-points__text {
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-2);
  font-size: 0.92em;
}
</style>
