<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, useSlots } from 'vue'

type TooltipPlacement = 'top' | 'bottom'
type TooltipMode = 'pointer' | 'focus'

interface TooltipPoint {
  x: number
  y: number
}

const props = withDefaults(defineProps<{
  label?: string
  placement?: TooltipPlacement
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
const triggerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const tooltipMode = ref<TooltipMode>('pointer')
const pointerPosition = ref<TooltipPoint>({ x: 0, y: 0 })
const contentStyle = ref<Record<string, string>>({})

const normalizedLabel = computed(() => props.label?.trim() || '')
const hasTooltip = computed(() => !props.disabled && Boolean(normalizedLabel.value || slots.content))
const describedBy = computed(() => (hasTooltip.value ? tooltipId : undefined))
const triggerTabIndex = computed(() => (hasTooltip.value ? 0 : undefined))

function clamp(value: number, min: number, max: number) {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

function calculateFixedPosition(baseX: number, baseY: number, preferTop: boolean) {
  const contentEl = contentRef.value

  if (!contentEl || typeof window === 'undefined') {
    return {
      left: `${baseX}px`,
      top: `${baseY}px`,
    }
  }

  const screenPadding = 8
  const { innerWidth, innerHeight } = window
  const tooltipWidth = contentEl.offsetWidth
  const tooltipHeight = contentEl.offsetHeight

  let left = baseX
  let top = preferTop
    ? baseY - tooltipHeight - props.offset
    : baseY + props.offset

  left = clamp(left, screenPadding, Math.max(screenPadding, innerWidth - tooltipWidth - screenPadding))

  if (preferTop && top < screenPadding) {
    top = Math.min(baseY + props.offset, innerHeight - tooltipHeight - screenPadding)
  }

  if (!preferTop && top + tooltipHeight > innerHeight - screenPadding) {
    top = Math.max(screenPadding, baseY - tooltipHeight - props.offset)
  }

  top = clamp(top, screenPadding, Math.max(screenPadding, innerHeight - tooltipHeight - screenPadding))

  return {
    left: `${left}px`,
    top: `${top}px`,
  }
}

function updatePosition() {
  if (!isVisible.value || !hasTooltip.value) {
    return
  }

  if (tooltipMode.value === 'pointer') {
    const preferTop = props.placement === 'top'
    contentStyle.value = calculateFixedPosition(
      pointerPosition.value.x + props.offset,
      pointerPosition.value.y,
      preferTop,
    )
    return
  }

  const triggerEl = triggerRef.value

  if (!triggerEl) {
    return
  }

  const rect = triggerEl.getBoundingClientRect()
  const contentEl = contentRef.value

  if (!contentEl || typeof window === 'undefined') {
    contentStyle.value = {
      left: `${rect.left}px`,
      top: `${rect.bottom + props.offset}px`,
    }
    return
  }

  const screenPadding = 8
  const tooltipWidth = contentEl.offsetWidth
  const anchorX = rect.left + (rect.width - tooltipWidth) / 2
  const preferTop = props.placement === 'top'
  const baseY = preferTop ? rect.top : rect.bottom

  contentStyle.value = calculateFixedPosition(anchorX, baseY, preferTop)

  if (rect.width === 0 && rect.height === 0) {
    contentStyle.value.left = `${screenPadding}px`
  }
}

async function openTooltip(mode: TooltipMode) {
  if (!hasTooltip.value) return

  tooltipMode.value = mode
  isVisible.value = true
  await nextTick()
  updatePosition()
}

function hideTooltip() {
  isVisible.value = false
}

function handleMouseEnter(event: MouseEvent) {
  pointerPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }
  void openTooltip('pointer')
}

function handleMouseMove(event: MouseEvent) {
  pointerPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }

  if (!isVisible.value) {
    void openTooltip('pointer')
    return
  }

  if (tooltipMode.value !== 'pointer') {
    tooltipMode.value = 'pointer'
  }

  updatePosition()
}

function handleMouseLeave() {
  hideTooltip()
}

function handleFocusIn() {
  void openTooltip('focus')
}

function handleFocusOut() {
  hideTooltip()
}

function handleWindowChange() {
  updatePosition()
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleWindowChange)
  window.addEventListener('scroll', handleWindowChange, true)
}

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleWindowChange)
    window.removeEventListener('scroll', handleWindowChange, true)
  }
})
</script>

<template>
  <span
    class="mc-tooltip"
    :class="{ 'mc-tooltip--visible': isVisible, 'mc-tooltip--disabled': !hasTooltip }"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
  >
    <span
      ref="triggerRef"
      class="mc-tooltip__trigger"
      :tabindex="triggerTabIndex"
      :aria-describedby="describedBy"
    >
      <slot />
    </span>

    <span
      v-if="hasTooltip"
      :id="tooltipId"
      ref="contentRef"
      class="mc-tooltip__content"
      role="tooltip"
      :aria-hidden="!isVisible"
      :style="contentStyle"
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
  position: fixed;
  z-index: 40;
  min-width: max-content;
  max-width: min(20rem, calc(100vw - 2rem));
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translateY(2px);
  transition: opacity 0.12s ease, transform 0.12s ease, visibility 0.12s step-end;
}

.mc-tooltip--visible .mc-tooltip__content {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity 0.12s ease, transform 0.12s ease, visibility 0.12s step-start;
}

.mc-tooltip__surface {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: var(--mc-tooltip-padding-y) var(--mc-tooltip-padding-x);
  border: 2px solid var(--mc-tooltip-border);
  outline: 2px solid var(--mc-tooltip-outline);
  background: linear-gradient(180deg, var(--mc-tooltip-bg-start) 0%, var(--mc-tooltip-bg-end) 100%);
  color: var(--mc-tooltip-text);
  font-family: var(--mc-tooltip-font-stack);
  font-size: var(--mc-tooltip-font-size);
  font-weight: 700;
  line-height: var(--mc-tooltip-line-height);
  letter-spacing: var(--mc-tooltip-letter-spacing);
  text-shadow: 2px 2px 0 var(--mc-tooltip-shadow);
  box-shadow:
    0 0 0 2px var(--mc-tooltip-outline),
    inset 0 0 0 1px #5f3a86,
    2px 2px 0 0 var(--mc-tooltip-shadow-drop);
  white-space: nowrap;
}

.mc-tooltip__surface::before {
  content: '';
  position: absolute;
  inset: 2px;
  border: 1px solid var(--mc-tooltip-inner-border);
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
