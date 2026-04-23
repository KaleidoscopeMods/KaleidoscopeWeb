<script setup lang="ts">
import { computed, ref, useId, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  placement?: 'top' | 'bottom'
  disabled?: boolean
  offset?: number
}>(), {
  placement: 'top',
  disabled: false,
  offset: 8,
})

const slots = useSlots()
const isVisible = ref(false)
const tooltipId = useId()

const normalizedLabel = computed(() => props.label?.trim() || '')
const hasTooltip = computed(() => !props.disabled && Boolean(normalizedLabel.value || slots.content))
const describedBy = computed(() => (hasTooltip.value ? tooltipId : undefined))
const triggerTabIndex = computed(() => (hasTooltip.value ? 0 : undefined))
const tooltipStyle = computed(() => ({
  '--mc-tooltip-offset': `${props.offset}px`,
}))

function showTooltip() {
  if (!hasTooltip.value) return
  isVisible.value = true
}

function hideTooltip() {
  isVisible.value = false
}
</script>

<template>
  <span
    class="mc-tooltip"
    :class="[`mc-tooltip--${placement}`, { 'mc-tooltip--visible': isVisible, 'mc-tooltip--disabled': !hasTooltip }]"
    :style="tooltipStyle"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focusin="showTooltip"
    @focusout="hideTooltip"
  >
    <span
      class="mc-tooltip__trigger"
      :tabindex="triggerTabIndex"
      :aria-describedby="describedBy"
    >
      <slot />
    </span>

    <span
      v-if="hasTooltip"
      :id="tooltipId"
      class="mc-tooltip__content"
      role="tooltip"
      :aria-hidden="!isVisible"
    >
      <span class="mc-tooltip__surface">
        <span class="mc-tooltip__title">
          <slot name="content">{{ normalizedLabel }}</slot>
        </span>
      </span>
    </span>
  </span>
</template>

<style scoped>
.mc-tooltip {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
}

.mc-tooltip__trigger {
  display: inline-flex;
  vertical-align: middle;
}

.mc-tooltip__trigger:focus-visible {
  outline: 2px solid #fff8;
  outline-offset: 2px;
}

.mc-tooltip__content {
  position: absolute;
  left: 50%;
  z-index: 40;
  min-width: max-content;
  max-width: min(20rem, calc(100vw - 2rem));
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(2px);
  transition: opacity 0.12s ease, transform 0.12s ease, visibility 0.12s step-end;
}

.mc-tooltip--top .mc-tooltip__content {
  bottom: calc(100% + var(--mc-tooltip-offset, 8px));
}

.mc-tooltip--bottom .mc-tooltip__content {
  top: calc(100% + var(--mc-tooltip-offset, 8px));
}

.mc-tooltip--visible .mc-tooltip__content {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  transition: opacity 0.12s ease, transform 0.12s ease, visibility 0.12s step-start;
}

.mc-tooltip__surface {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.3rem 0.55rem;
  border: 2px solid #2a103e;
  outline: 2px solid #100214;
  background: linear-gradient(180deg, #16071f 0%, #0b0613 100%);
  color: #f6efff;
  font-family: 'Minecraft', 'Press Start 2P', 'Fusion Pixel', 'Microsoft YaHei', 'PingFang SC', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.02em;
  text-shadow: 2px 2px 0 #22102c;
  box-shadow:
    0 0 0 2px #100214,
    inset 0 0 0 1px #5f3a86,
    2px 2px 0 0 rgb(0 0 0 / 45%);
  white-space: nowrap;
}

.mc-tooltip__surface::before {
  content: '';
  position: absolute;
  inset: 2px;
  border: 1px solid rgb(183 128 255 / 30%);
  pointer-events: none;
}

.mc-tooltip__title {
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  .mc-tooltip__content {
    transition: none;
  }
}
</style>
