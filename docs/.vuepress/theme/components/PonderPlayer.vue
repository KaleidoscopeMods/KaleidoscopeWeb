<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type {
  Group,
  Material,
  Mesh,
  Object3D,
  OrthographicCamera,
  Raycaster,
  Scene,
  Sprite,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import {
  getPonderScenes,
  type PonderEffect,
  type PonderModule,
  type PonderObject,
  type PonderObjectPatch,
} from '../ponder/scenes'

interface DisplayObject extends PonderObject {
  displayOpacity: number
  displayScale: number
  displayRotate: number
  effect: PonderEffect
}

interface RenderEntry {
  root: Object3D
  sprite?: Sprite
  materials: Material[]
  textures: Texture[]
  aspect: number
  baseWidth: number
}

const props = withDefaults(defineProps<{
  module: PonderModule
  scene?: string
  autoplay?: boolean
}>(), {
  scene: undefined,
  autoplay: true,
})

const root = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const sceneIndex = ref(0)
const time = ref(0)
const playing = ref(false)
const inspectMode = ref(false)
const selectedObjectId = ref<string>()
const hoveredObjectId = ref<string>()
const inView = ref(true)
const reducedMotion = ref(false)
const canvasReady = ref(false)
const renderError = ref('')
const focusScreen = ref({ x: 50, y: 52 })

let three: typeof import('three') | undefined
let renderer: WebGLRenderer | undefined
let threeScene: Scene | undefined
let camera: OrthographicCamera | undefined
let contentGroup: Group | undefined
let floorGroup: Group | undefined
let floorRim: Mesh | undefined
let accentRing: Mesh | undefined
let accentLight: import('three').PointLight | undefined
let raycaster: Raycaster | undefined
let pointer: Vector2 | undefined
let projectedPosition: Vector3 | undefined
let animationFrame = 0
let lastFrame = 0
let visualTime = 0
let resumeWhenVisible = false
let intersectionObserver: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let sceneGeneration = 0
let pointerStart = { x: 0, y: 0 }

const renderEntries = new Map<string, RenderEntry>()

const scenes = computed(() => getPonderScenes(props.module))
const activeScene = computed(() => scenes.value[sceneIndex.value] ?? scenes.value[0]!)
const totalDuration = computed(() => activeScene.value.steps.reduce((total, step) => total + step.duration, 0))
const stepStarts = computed(() => {
  let cursor = 0
  return activeScene.value.steps.map((step) => {
    const start = cursor
    cursor += step.duration
    return start
  })
})

const activeStepIndex = computed(() => {
  let cursor = 0

  for (let index = 0; index < activeScene.value.steps.length; index++) {
    cursor += activeScene.value.steps[index]!.duration
    if (time.value < cursor) return index
  }

  return Math.max(0, activeScene.value.steps.length - 1)
})

const activeStep = computed(() => activeScene.value.steps[activeStepIndex.value]!)
const moduleLabel = computed(() => props.module === 'cookery' ? 'KALEIDOSCOPE COOKERY' : 'KALEIDOSCOPE TAVERN')

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function ease(value: number) {
  const t = clamp(value)
  return 1 - Math.pow(1 - t, 3)
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

function applyPatch(target: DisplayObject, patch: PonderObjectPatch, amount = 1) {
  const eased = ease(amount)

  if (patch.x !== undefined) target.x = lerp(target.x, patch.x, eased)
  if (patch.y !== undefined) target.y = lerp(target.y, patch.y, eased)
  if (patch.z !== undefined) target.z = lerp(target.z, patch.z, eased)
  if (patch.opacity !== undefined) target.displayOpacity = lerp(target.displayOpacity, patch.opacity, eased)
  if (patch.scale !== undefined) target.displayScale = lerp(target.displayScale, patch.scale, eased)
  if (patch.rotate !== undefined) target.displayRotate = lerp(target.displayRotate, patch.rotate, eased)
}

const displayObjects = computed<DisplayObject[]>(() => {
  const scene = activeScene.value
  const objects = scene.objects.map((object): DisplayObject => ({
    ...object,
    displayOpacity: object.opacity ?? 1,
    displayScale: object.scale ?? 1,
    displayRotate: object.rotate ?? 0,
    effect: 'none',
  }))

  let cursor = 0
  for (let stepIndex = 0; stepIndex < scene.steps.length; stepIndex++) {
    const step = scene.steps[stepIndex]!
    const stepEnd = cursor + step.duration
    const isCurrentStep = time.value < stepEnd
    const amount = isCurrentStep ? clamp((time.value - cursor) / step.duration) : 1

    if (time.value >= cursor) {
      for (const [objectId, patch] of Object.entries(step.objects ?? {})) {
        const object = objects.find(candidate => candidate.id === objectId)
        if (!object) continue

        applyPatch(object, patch, amount)
        if (isCurrentStep && patch.effect) object.effect = patch.effect
      }
    }

    cursor = stepEnd
    if (isCurrentStep) break
  }

  return objects
})

const visibleObjects = computed(() => displayObjects.value.filter(object => object.displayOpacity > 0.08))
const focusObjectId = computed(() => inspectMode.value ? selectedObjectId.value : activeStep.value.focus)
const selectedObject = computed(() => displayObjects.value.find(object => object.id === selectedObjectId.value))
const calloutLayout = computed(() => {
  const bubbleX = focusScreen.value.x > 54 ? 7.2 : 62
  const bubbleY = 11
  const anchorX = bubbleX < 50 ? bubbleX * 10 + 238 : bubbleX * 10
  const anchorY = 150
  const targetX = focusScreen.value.x * 10
  const targetY = focusScreen.value.y * 5.6
  const bendX = anchorX < targetX ? anchorX + 90 : anchorX - 90

  return {
    bubbleStyle: { left: `${bubbleX}%`, top: `${bubbleY}%` },
    path: `M ${anchorX} ${anchorY} C ${bendX} ${anchorY}, ${targetX} ${targetY - 70}, ${targetX} ${targetY}`,
    targetX,
    targetY,
  }
})

function materialList(rootObject: Object3D) {
  const materials: Material[] = []
  rootObject.traverse((child) => {
    const material = (child as Mesh).material
    if (Array.isArray(material)) materials.push(...material)
    else if (material) materials.push(material)
  })
  return materials
}

function markPickable(rootObject: Object3D, id: string) {
  rootObject.userData.ponderId = id
  rootObject.traverse((child) => {
    child.userData.ponderId = id
  })
}

function createPixelMaterial(color: number, opacity = 1) {
  const t = three!
  const material = new t.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
  })
  material.userData.baseOpacity = opacity
  return material
}

function addInvisibleHitbox(group: Group, id: string, width: number, height: number) {
  const t = three!
  const hitbox = new t.Mesh(
    new t.BoxGeometry(width, height, width),
    new t.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  )
  ;(hitbox.material as Material).userData.baseOpacity = 0
  hitbox.position.y = height / 2
  hitbox.userData.ponderId = id
  group.add(hitbox)
}

function createFire(id: string) {
  const t = three!
  const group = new t.Group()
  const colors = [0xd95a31, 0xf0a13b, 0xffd468]
  const heights = [0.62, 0.92, 0.52]

  heights.forEach((height, index) => {
    const flame = new t.Mesh(new t.BoxGeometry(0.3, height, 0.3), createPixelMaterial(colors[index]!))
    flame.position.set((index - 1) * 0.28, height / 2, index === 1 ? 0.08 : 0)
    flame.userData.flameIndex = index
    flame.userData.baseX = flame.position.x
    group.add(flame)
  })

  addInvisibleHitbox(group, id, 1.2, 1.1)
  markPickable(group, id)
  return group
}

function createSteam(id: string) {
  const t = three!
  const group = new t.Group()
  const geometry = new t.BoxGeometry(0.16, 0.16, 0.16)

  for (let index = 0; index < 8; index++) {
    const puff = new t.Mesh(geometry.clone(), createPixelMaterial(index % 2 ? 0xc7d0cc : 0xe7ece9, 0.72))
    puff.userData.puffIndex = index
    group.add(puff)
  }

  addInvisibleHitbox(group, id, 1.4, 1.8)
  markPickable(group, id)
  return group
}

function createLiquid(id: string) {
  const t = three!
  const group = new t.Group()

  for (let index = 0; index < 3; index++) {
    const layer = new t.Mesh(
      new t.CylinderGeometry(0.62 - index * 0.08, 0.68 - index * 0.08, 0.14, 16),
      createPixelMaterial(index === 0 ? 0x753044 : 0xa35468, 0.72 - index * 0.14),
    )
    layer.position.y = index * 0.16
    layer.userData.liquidIndex = index
    group.add(layer)
  }

  addInvisibleHitbox(group, id, 1.5, 0.8)
  markPickable(group, id)
  return group
}

function createSprite(object: PonderObject, generation: number) {
  const t = three!
  const material = new t.SpriteMaterial({
    color: 0xffffff,
    transparent: true,
    alphaTest: 0.015,
    depthWrite: false,
    sizeAttenuation: true,
  })
  material.userData.baseOpacity = 0

  const sprite = new t.Sprite(material)
  sprite.center.set(0.5, 0)
  markPickable(sprite, object.id)

  const entry: RenderEntry = {
    root: sprite,
    sprite,
    materials: [material],
    textures: [],
    aspect: 1,
    baseWidth: (object.width ?? 80) / 50,
  }
  renderEntries.set(object.id, entry)

  if (object.asset) {
    new t.TextureLoader().load(
      object.asset,
      (texture) => {
        if (generation !== sceneGeneration || !renderEntries.has(object.id)) {
          texture.dispose()
          return
        }

        texture.colorSpace = t.SRGBColorSpace
        texture.magFilter = t.NearestFilter
        texture.minFilter = t.NearestMipmapNearestFilter
        texture.generateMipmaps = true
        material.map = texture
        material.userData.baseOpacity = 1
        material.needsUpdate = true
        entry.textures.push(texture)

        const image = texture.image as { width?: number, height?: number }
        if (image.width && image.height) entry.aspect = image.width / image.height
        renderOnce()
      },
      undefined,
      () => {
        material.userData.baseOpacity = 0.3
        material.color.set(0xe7a33b)
        renderOnce()
      },
    )
  }

  return entry
}

function createStove(id: string, generation: number) {
  const t = three!
  const group = new t.Group()
  const sideMaterials = [0, 1, 5].map(() => new t.MeshStandardMaterial({
    color: 0x8d8a80,
    roughness: 0.86,
    metalness: 0.04,
  }))
  const topMaterial = new t.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff8a32,
    emissiveIntensity: 0.24,
    roughness: 0.82,
  })
  const bottomMaterial = new t.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff8a32,
    emissiveIntensity: 0.12,
    roughness: 0.86,
  })
  const frontMaterial = new t.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff7626,
    emissiveIntensity: 0.36,
    roughness: 0.82,
  })
  const materials = [sideMaterials[0]!, sideMaterials[1]!, topMaterial, bottomMaterial, frontMaterial, sideMaterials[2]!]
  materials.forEach((material) => {
    material.userData.baseOpacity = 1
  })

  const stove = new t.Mesh(new t.BoxGeometry(2.05, 2.05, 2.05), materials)
  stove.position.y = 1.025
  stove.castShadow = true
  stove.receiveShadow = true
  group.add(stove)
  markPickable(group, id)

  const entry: RenderEntry = {
    root: group,
    materials,
    textures: [],
    aspect: 1,
    baseWidth: 2.05,
  }
  renderEntries.set(id, entry)

  const loadTexture = (asset: string, targets: import('three').MeshStandardMaterial[], emissive = false) => {
    new t.TextureLoader().load(asset, (texture) => {
      if (generation !== sceneGeneration || !renderEntries.has(id)) {
        texture.dispose()
        return
      }

      texture.colorSpace = t.SRGBColorSpace
      texture.magFilter = t.NearestFilter
      texture.minFilter = t.NearestFilter
      texture.generateMipmaps = false
      targets.forEach((material) => {
        material.map = texture
        if (emissive) material.emissiveMap = texture
        material.needsUpdate = true
      })
      entry.textures.push(texture)
      renderOnce()
    })
  }

  loadTexture('/image/blocks/stove_side.png', sideMaterials)
  loadTexture('/image/blocks/stove_top_lit.png', [topMaterial, bottomMaterial], true)
  loadTexture('/image/blocks/stove_front_lit.png', [frontMaterial], true)
  return entry
}

function createRenderEntry(object: PonderObject, generation: number) {
  if (object.asset) return createSprite(object, generation)
  if (object.kind === 'stove') return createStove(object.id, generation)

  let rootObject: Object3D
  if (object.kind === 'fire') rootObject = createFire(object.id)
  else if (object.kind === 'steam') rootObject = createSteam(object.id)
  else if (object.kind === 'liquid') rootObject = createLiquid(object.id)
  else rootObject = new three!.Group()

  const entry: RenderEntry = {
    root: rootObject,
    materials: materialList(rootObject),
    textures: [],
    aspect: 1,
    baseWidth: 1,
  }
  renderEntries.set(object.id, entry)
  return entry
}

function disposeObject(object: Object3D) {
  object.traverse((child) => {
    const mesh = child as Mesh
    mesh.geometry?.dispose()

    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
    materials.forEach((material) => material.dispose())
  })
}

function clearContent() {
  sceneGeneration++
  renderEntries.forEach((entry) => {
    entry.textures.forEach(texture => texture.dispose())
    disposeObject(entry.root)
    entry.root.removeFromParent()
  })
  renderEntries.clear()
}

function updateScenePalette() {
  if (!three || !threeScene || !floorGroup || !accentRing) return

  const accent = new three.Color(activeScene.value.accent)
  const background = new three.Color(props.module === 'cookery' ? 0xf4eedf : 0xf5e8e1)
  threeScene.background = background
  if (threeScene.fog) threeScene.fog.color.copy(background)
  accentLight?.color.copy(accent)

  const ringMaterial = accentRing.material as import('three').MeshBasicMaterial
  ringMaterial.color.copy(accent)

  floorGroup.children.forEach((child, index) => {
    const material = (child as Mesh).material as import('three').MeshStandardMaterial
    const base = props.module === 'cookery'
      ? (index % 3 === 0 ? 0xc8d4b8 : 0xded2b5)
      : (index % 3 === 0 ? 0xdab9ad : 0xe4cfb2)
    material.color.setHex(base)
  })

  const rimMaterial = floorRim?.material as import('three').MeshStandardMaterial | undefined
  rimMaterial?.color.setHex(props.module === 'cookery' ? 0xb7a98a : 0xc3a18f)
}

function rebuildThreeScene() {
  if (!three || !contentGroup) return

  clearContent()
  updateScenePalette()
  const generation = sceneGeneration

  activeScene.value.objects.forEach((object) => {
    const entry = createRenderEntry(object, generation)
    contentGroup!.add(entry.root)
  })

  resetCamera()
  syncThreeObjects()
  renderOnce()
}

function setEntryOpacity(entry: RenderEntry, opacity: number) {
  entry.materials.forEach((material) => {
    const visualMaterial = material as Material & { opacity?: number, transparent?: boolean }
    if (visualMaterial.opacity === undefined) return
    const baseOpacity = Number(material.userData.baseOpacity ?? 1)
    visualMaterial.opacity = opacity * baseOpacity
    visualMaterial.transparent = visualMaterial.opacity < 1
  })
}

function animateProcedural(entry: RenderEntry, object: DisplayObject, seconds: number) {
  if (object.kind === 'fire') {
    entry.root.children.forEach((child) => {
      if (child.userData.flameIndex === undefined) return
      const phase = seconds * 8 + Number(child.userData.flameIndex) * 1.7
      child.scale.y = 0.84 + Math.sin(phase) * 0.16
      child.position.x = Number(child.userData.baseX) + Math.sin(phase * 0.7) * 0.025
    })
  } else if (object.kind === 'steam') {
    entry.root.children.forEach((child) => {
      if (child.userData.puffIndex === undefined) return
      const index = Number(child.userData.puffIndex)
      const cycle = (seconds * 0.42 + index / 8) % 1
      child.position.set(
        Math.sin(index * 2.1 + seconds) * 0.34,
        0.12 + cycle * 1.58,
        Math.cos(index * 1.7) * 0.22,
      )
      const material = (child as Mesh).material as import('three').MeshBasicMaterial
      material.opacity = object.displayOpacity * Math.sin(cycle * Math.PI) * 0.72
    })
  } else if (object.kind === 'liquid') {
    entry.root.children.forEach((child) => {
      if (child.userData.liquidIndex === undefined) return
      const index = Number(child.userData.liquidIndex)
      child.rotation.y = seconds * (index % 2 ? -0.45 : 0.45)
      child.scale.x = 1 + Math.sin(seconds * 2 + index) * 0.045
      child.scale.z = 1 - Math.sin(seconds * 2 + index) * 0.045
    })
  }
}

function syncThreeObjects() {
  if (!three) return

  const seconds = visualTime / 1000
  displayObjects.value.forEach((object) => {
    const entry = renderEntries.get(object.id)
    if (!entry) return

    const effectAmount = reducedMotion.value ? 0 : seconds
    let bob = 0
    let pulse = 1
    let rotation = object.displayRotate

    if (object.effect === 'bob') bob = Math.sin(effectAmount * 4.5) * 0.12
    if (object.effect === 'shake') rotation += Math.sin(effectAmount * 22) * 8
    if (object.effect === 'spin') rotation += effectAmount * 120
    if (object.effect === 'pulse') pulse = 1 + Math.sin(effectAmount * 5.5) * 0.055

    entry.root.position.set(object.x, object.y + bob, object.z)
    entry.root.visible = object.displayOpacity > 0.01
    setEntryOpacity(entry, object.displayOpacity)

    if (entry.sprite) {
      const width = entry.baseWidth * object.displayScale * pulse
      entry.sprite.scale.set(width, width / entry.aspect, 1)
      const material = entry.sprite.material as import('three').SpriteMaterial
      material.rotation = three.MathUtils.degToRad(rotation)
    } else {
      const scale = object.displayScale * pulse
      entry.root.scale.setScalar(scale)
      entry.root.rotation.z = three.MathUtils.degToRad(rotation)
      if (!reducedMotion.value) animateProcedural(entry, object, seconds)
    }
  })

  updateFocusIndicator()
}

function updateFocusIndicator() {
  if (!three || !accentRing || !camera || !stage.value || !projectedPosition) return

  const focusId = focusObjectId.value
  const entry = focusId ? renderEntries.get(focusId) : undefined
  const object = focusId ? displayObjects.value.find(candidate => candidate.id === focusId) : undefined

  if (!entry || !object || object.displayOpacity <= 0.08) {
    accentRing.visible = false
    return
  }

  accentRing.visible = true
  accentRing.position.set(object.x, object.y + 0.025, object.z)
  const width = Math.max(0.52, entry.baseWidth * object.displayScale * 0.48)
  accentRing.scale.setScalar(width)

  entry.root.getWorldPosition(projectedPosition)
  projectedPosition.y += entry.sprite ? (entry.baseWidth / entry.aspect) * object.displayScale * 0.54 : 0.7
  projectedPosition.project(camera)
  const nextX = clamp(projectedPosition.x * 50 + 50, 3, 97)
  const nextY = clamp(-projectedPosition.y * 50 + 50, 5, 94)
  if (Math.abs(nextX - focusScreen.value.x) > 0.25 || Math.abs(nextY - focusScreen.value.y) > 0.25) {
    focusScreen.value = { x: nextX, y: nextY }
  }
}

function createFloor() {
  const t = three!
  floorGroup = new t.Group()
  const geometry = new t.BoxGeometry(1.36, 0.14, 1.36)

  for (let z = -3; z <= 3; z++) {
    for (let x = -4; x <= 4; x++) {
      const material = new t.MeshStandardMaterial({ color: 0xded2b5, roughness: 0.92, metalness: 0 })
      const tile = new t.Mesh(geometry.clone(), material)
      tile.position.set(x * 1.4, -0.12, z * 1.4)
      tile.receiveShadow = true
      floorGroup.add(tile)
    }
  }

  threeScene!.add(floorGroup)

  floorRim = new t.Mesh(
    new t.BoxGeometry(12.8, 0.28, 10),
    new t.MeshStandardMaterial({ color: 0xb7a98a, roughness: 0.88 }),
  )
  floorRim.position.y = -0.28
  floorRim.receiveShadow = true
  threeScene!.add(floorRim)
}

function resetCamera() {
  if (!camera) return
  camera.position.set(7.8, 6.5, 8.6)
  camera.lookAt(0, 1.05, 0)
  camera.updateMatrixWorld()
  renderOnce()
}

function resizeRenderer() {
  if (!renderer || !camera || !stage.value) return
  const width = Math.max(1, stage.value.clientWidth)
  const height = Math.max(1, stage.value.clientHeight)
  const aspect = width / height
  const viewHeight = aspect < 1.2 ? 14 / aspect : 8
  const viewWidth = viewHeight * aspect
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height, false)
  camera.left = -viewWidth / 2
  camera.right = viewWidth / 2
  camera.top = viewHeight / 2
  camera.bottom = -viewHeight / 2
  camera.updateProjectionMatrix()
  renderOnce()
}

function renderOnce() {
  if (!renderer || !threeScene || !camera) return
  syncThreeObjects()
  renderer.render(threeScene, camera)
  canvasReady.value = true
}

function startRenderLoop() {
  cancelAnimationFrame(animationFrame)
  lastFrame = performance.now()
  animationFrame = requestAnimationFrame(renderFrame)
}

function renderFrame(now: number) {
  if (!inView.value || !renderer || !threeScene || !camera) return

  const delta = Math.min(80, now - lastFrame)
  lastFrame = now

  if (playing.value) {
    time.value = Math.min(totalDuration.value, time.value + delta)
    visualTime += delta
    if (time.value >= totalDuration.value) playing.value = false
  }

  syncThreeObjects()
  renderer.render(threeScene, camera)
  canvasReady.value = true
  animationFrame = requestAnimationFrame(renderFrame)
}

function raycastObject(event: PointerEvent) {
  if (!raycaster || !pointer || !camera || !canvas.value || !contentGroup) return undefined
  const bounds = canvas.value.getBoundingClientRect()
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)

  const hit = raycaster.intersectObjects(contentGroup.children, true)
    .find(intersection => intersection.object.visible && intersection.object.userData.ponderId)
  return hit?.object.userData.ponderId as string | undefined
}

function handlePointerDown(event: PointerEvent) {
  pointerStart = { x: event.clientX, y: event.clientY }
}

function handlePointerMove(event: PointerEvent) {
  if (!inspectMode.value || !canvas.value) return
  hoveredObjectId.value = raycastObject(event)
  canvas.value.style.cursor = hoveredObjectId.value ? 'crosshair' : 'default'
}

function handlePointerLeave() {
  hoveredObjectId.value = undefined
  if (canvas.value) canvas.value.style.cursor = 'default'
}

function handlePointerUp(event: PointerEvent) {
  if (!inspectMode.value) return
  const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
  if (moved > 6) return
  const id = raycastObject(event)
  if (id) selectedObjectId.value = id
}

async function initThree() {
  if (!canvas.value || !stage.value) return

  try {
    const threeModule = await import('three')
    three = threeModule
    const t = threeModule

    renderer = new t.WebGLRenderer({
      canvas: canvas.value,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.outputColorSpace = t.SRGBColorSpace
    renderer.toneMapping = t.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.02
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = t.PCFShadowMap

    threeScene = new t.Scene()
    threeScene.fog = new t.Fog(0xf4eedf, 9, 20)
    camera = new t.OrthographicCamera(-6, 6, 4, -4, 0.1, 50)
    contentGroup = new t.Group()
    threeScene.add(contentGroup)

    const hemisphere = new t.HemisphereLight(0xfffbef, 0xcbbca3, 2.15)
    threeScene.add(hemisphere)

    const keyLight = new t.DirectionalLight(0xfff1d1, 3.2)
    keyLight.position.set(4.5, 9, 5.5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -7
    keyLight.shadow.camera.right = 7
    keyLight.shadow.camera.top = 7
    keyLight.shadow.camera.bottom = -7
    threeScene.add(keyLight)

    accentLight = new t.PointLight(activeScene.value.accent, 7, 8, 2)
    accentLight.position.set(-2.5, 4, 2.5)
    threeScene.add(accentLight)

    createFloor()

    accentRing = new t.Mesh(
      new t.RingGeometry(0.55, 0.66, 32),
      new t.MeshBasicMaterial({
        color: activeScene.value.accent,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        side: t.DoubleSide,
      }),
    )
    accentRing.rotation.x = -Math.PI / 2
    accentRing.renderOrder = 5
    threeScene.add(accentRing)

    raycaster = new t.Raycaster()
    pointer = new t.Vector2()
    projectedPosition = new t.Vector3()

    canvas.value.addEventListener('pointerdown', handlePointerDown)
    canvas.value.addEventListener('pointermove', handlePointerMove)
    canvas.value.addEventListener('pointerleave', handlePointerLeave)
    canvas.value.addEventListener('pointerup', handlePointerUp)
    canvas.value.addEventListener('webglcontextlost', handleContextLost)

    resizeObserver = new ResizeObserver(resizeRenderer)
    resizeObserver.observe(stage.value)
    rebuildThreeScene()
    resizeRenderer()
    startRenderLoop()
    return true
  } catch (error) {
    renderError.value = '无法初始化 3D 场景'
    console.error('[Ponder] Three.js initialization failed', error)
    return false
  }
}

function handleContextLost(event: Event) {
  event.preventDefault()
  renderError.value = '3D 场景暂时不可用'
  playing.value = false
  cancelAnimationFrame(animationFrame)
}

function play() {
  inspectMode.value = false
  selectedObjectId.value = undefined
  if (time.value >= totalDuration.value) time.value = 0
  playing.value = true
  if (inView.value && !animationFrame) startRenderLoop()
}

function pause() {
  playing.value = false
}

function togglePlayback() {
  if (playing.value) pause()
  else play()
}

function replay() {
  pause()
  time.value = 0
  visualTime = 0
  selectedObjectId.value = undefined
  inspectMode.value = false
  nextTick(() => play())
}

function seek(event: Event) {
  time.value = clamp(Number((event.target as HTMLInputElement).value), 0, totalDuration.value)
  renderOnce()
}

function jumpToStep(index: number) {
  const target = Math.max(0, Math.min(activeScene.value.steps.length - 1, index))
  time.value = stepStarts.value[target] ?? 0
  selectedObjectId.value = undefined
  renderOnce()
}

function previousStep() {
  const currentStart = stepStarts.value[activeStepIndex.value] ?? 0
  jumpToStep(time.value - currentStart < 240 ? activeStepIndex.value - 1 : activeStepIndex.value)
}

function nextStep() {
  jumpToStep(activeStepIndex.value + 1)
}

function selectScene(index: number) {
  if (index === sceneIndex.value) return
  pause()
  sceneIndex.value = index
  time.value = 0
  visualTime = 0
  inspectMode.value = false
  selectedObjectId.value = undefined
  nextTick(() => {
    rebuildThreeScene()
    if (props.autoplay && !reducedMotion.value) play()
  })
}

function toggleInspect() {
  inspectMode.value = !inspectMode.value
  selectedObjectId.value = inspectMode.value ? activeStep.value.focus : undefined
  if (inspectMode.value) pause()
  if (canvas.value) canvas.value.style.cursor = inspectMode.value ? 'crosshair' : 'default'
  renderOnce()
}

function inspectObject(id: string) {
  selectedObjectId.value = id
  renderOnce()
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target !== root.value && ['BUTTON', 'INPUT'].includes(target.tagName)) return

  if (event.code === 'Space') {
    event.preventDefault()
    togglePlayback()
  } else if (event.code === 'ArrowLeft') {
    event.preventDefault()
    previousStep()
  } else if (event.code === 'ArrowRight') {
    event.preventDefault()
    nextStep()
  } else if (event.key.toLowerCase() === 'r') {
    replay()
  } else if (event.key.toLowerCase() === 'i') {
    toggleInspect()
  }
}

function syncInitialScene() {
  const requestedIndex = props.scene
    ? scenes.value.findIndex(scene => scene.id === props.scene)
    : 0
  sceneIndex.value = Math.max(0, requestedIndex)
  time.value = 0
  visualTime = 0
  inspectMode.value = false
  selectedObjectId.value = undefined
}

function disposeThree() {
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  resizeObserver?.disconnect()
  clearContent()

  if (threeScene) {
    threeScene.traverse((child) => {
      if (contentGroup && (child === contentGroup || contentGroup.children.includes(child))) return
      const mesh = child as Mesh
      mesh.geometry?.dispose()
      const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
      materials.forEach(material => material.dispose())
    })
  }

  if (canvas.value) {
    canvas.value.removeEventListener('pointerdown', handlePointerDown)
    canvas.value.removeEventListener('pointermove', handlePointerMove)
    canvas.value.removeEventListener('pointerleave', handlePointerLeave)
    canvas.value.removeEventListener('pointerup', handlePointerUp)
    canvas.value.removeEventListener('webglcontextlost', handleContextLost)
  }

  renderer?.dispose()
  renderer?.forceContextLoss()
}

watch(() => [props.module, props.scene], () => {
  pause()
  syncInitialScene()
  nextTick(() => {
    rebuildThreeScene()
    if (props.autoplay && !reducedMotion.value) play()
  })
})

watch(focusObjectId, () => renderOnce())

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  syncInitialScene()

  intersectionObserver = new IntersectionObserver(([entry]) => {
    const visible = Boolean(entry?.isIntersecting)
    inView.value = visible

    if (!visible) {
      if (playing.value) resumeWhenVisible = true
      pause()
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    } else {
      startRenderLoop()
      if (resumeWhenVisible && !inspectMode.value) {
        resumeWhenVisible = false
        play()
      }
    }
  }, { threshold: 0.08 })

  if (root.value) intersectionObserver.observe(root.value)
  initThree().then((ready) => {
    if (ready && props.autoplay && !reducedMotion.value) play()
  })
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  disposeThree()
})
</script>

<template>
  <section
    ref="root"
    class="ponder-player"
    :class="[`ponder-player--${module}`, { 'is-inspecting': inspectMode }]"
    :style="{ '--ponder-accent': activeScene.accent }"
    tabindex="0"
    :aria-label="`${activeScene.title} 思索演示`"
    @keydown="handleKeydown"
  >
    <header class="ponder-player__header">
      <div class="ponder-player__identity">
        <span class="ponder-player__eyebrow">{{ moduleLabel }}</span>
        <strong>{{ activeScene.title }}</strong>
        <span>{{ activeScene.subtitle }}</span>
      </div>

      <div class="ponder-player__tabs" role="tablist" aria-label="思索场景">
        <button
          v-for="(sceneItem, index) in scenes"
          :key="sceneItem.id"
          type="button"
          role="tab"
          :aria-selected="index === sceneIndex"
          :class="{ active: index === sceneIndex }"
          @click="selectScene(index)"
        >
          {{ sceneItem.title }}
        </button>
      </div>
    </header>

    <div ref="stage" class="ponder-player__stage">
      <canvas ref="canvas" class="ponder-player__canvas" aria-hidden="true" />
      <div v-if="!canvasReady && !renderError" class="ponder-player__loading" role="status">载入 3D 场景</div>
      <div v-if="renderError" class="ponder-player__error" role="alert">{{ renderError }}</div>

      <svg
        v-if="focusObjectId && !inspectMode && canvasReady"
        class="ponder-player__connector"
        viewBox="0 0 1000 560"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path :d="calloutLayout.path" />
        <rect
          :x="calloutLayout.targetX - 4"
          :y="calloutLayout.targetY - 4"
          width="8"
          height="8"
        />
      </svg>

      <div
        v-if="!inspectMode"
        class="ponder-callout"
        :style="calloutLayout.bubbleStyle"
        aria-live="polite"
      >
        <span>{{ String(activeStepIndex + 1).padStart(2, '0') }}</span>
        <strong>{{ activeStep.title }}</strong>
        <p>{{ activeStep.text }}</p>
      </div>

      <div v-else class="ponder-inspector">
        <span>INSPECT</span>
        <strong>{{ selectedObject?.label ?? '选择场景物件' }}</strong>
        <p>{{ selectedObject?.description ?? '选择物件查看说明。' }}</p>
        <div class="ponder-inspector__objects" aria-label="可检查物件">
          <button
            v-for="object in visibleObjects"
            :key="object.id"
            type="button"
            :class="{ active: selectedObjectId === object.id || hoveredObjectId === object.id }"
            :aria-pressed="selectedObjectId === object.id"
            @click="inspectObject(object.id)"
          >
            {{ object.label }}
          </button>
        </div>
      </div>

      <div class="ponder-player__step-dots" aria-label="关键帧">
        <button
          v-for="(step, index) in activeScene.steps"
          :key="step.title"
          type="button"
          :class="{ active: index === activeStepIndex, passed: index < activeStepIndex }"
          :title="step.title"
          :aria-label="`跳转到 ${step.title}`"
          @click="jumpToStep(index)"
        />
      </div>
    </div>

    <footer class="ponder-player__controls">
      <div class="ponder-player__transport">
        <button type="button" title="上一个关键帧" aria-label="上一个关键帧" @click="previousStep">‹</button>
        <button
          type="button"
          class="primary"
          :title="playing ? '暂停' : '播放'"
          :aria-label="playing ? '暂停' : '播放'"
          @click="togglePlayback"
        >
          {{ playing ? 'Ⅱ' : '▶' }}
        </button>
        <button type="button" title="重播" aria-label="重播" @click="replay">↺</button>
        <button type="button" title="下一个关键帧" aria-label="下一个关键帧" @click="nextStep">›</button>
      </div>

      <div class="ponder-player__timeline">
        <input
          type="range"
          min="0"
          :max="totalDuration"
          step="20"
          :value="time"
          aria-label="思索进度"
          @input="seek"
        >
        <span>{{ activeStepIndex + 1 }} / {{ activeScene.steps.length }}</span>
      </div>

      <button
        type="button"
        class="ponder-player__inspect-button"
        :class="{ active: inspectMode }"
        title="检查模式"
        aria-label="检查模式"
        :aria-pressed="inspectMode"
        @click="toggleInspect"
      >
        ⌕
      </button>
    </footer>
  </section>
</template>

<style scoped>
.ponder-player {
  --ponder-bg: #faf6ec;
  --ponder-line: #d8cdb8;
  --ponder-text: #31332f;
  --ponder-muted: #6e756d;
  position: relative;
  width: 100%;
  margin: 28px 0 34px;
  overflow: hidden;
  border: 1px solid #d4c8b3;
  border-radius: 6px;
  background: var(--ponder-bg);
  box-shadow: 0 18px 42px rgb(91 73 43 / 15%);
  color: var(--ponder-text);
  outline: none;
  font-family: "Minecraft", "WenQuanYi Bitmap Song 12px", sans-serif;
}

.ponder-player:focus-visible {
  box-shadow: 0 0 0 2px var(--ponder-accent), 0 18px 42px rgb(91 73 43 / 15%);
}

.ponder-player__header {
  display: flex;
  min-height: 76px;
  align-items: stretch;
  justify-content: space-between;
  border-bottom: 1px solid var(--ponder-line);
  background: #fffaf0;
}

.ponder-player__identity {
  display: grid;
  min-width: 0;
  padding: 12px 19px 11px;
  align-content: center;
}

.ponder-player__eyebrow {
  color: var(--ponder-accent);
  font-size: 11px;
  line-height: 1.3;
  text-transform: uppercase;
}

.ponder-player__identity strong {
  overflow: hidden;
  color: var(--ponder-text);
  font-size: 21px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ponder-player__identity > span:last-child {
  overflow: hidden;
  color: var(--ponder-muted);
  font-size: 13px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ponder-player__tabs {
  display: flex;
  flex: 0 0 auto;
  align-items: stretch;
}

.ponder-player__tabs button {
  min-width: 124px;
  padding: 0 17px;
  border: 0;
  border-left: 1px solid var(--ponder-line);
  background: transparent;
  color: var(--ponder-muted);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.ponder-player__tabs button:hover,
.ponder-player__tabs button:focus-visible {
  background: #f1eadc;
  color: var(--ponder-text);
  outline: none;
}

.ponder-player__tabs button.active {
  box-shadow: inset 0 -3px 0 var(--ponder-accent);
  background: #eee5d5;
  color: var(--ponder-text);
}

.ponder-player__stage {
  position: relative;
  isolation: isolate;
  aspect-ratio: 16 / 9;
  min-height: 360px;
  overflow: hidden;
  background: #f4eedf;
}

.ponder-player__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  cursor: default;
  touch-action: pan-y;
}

.ponder-player__loading,
.ponder-player__error {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  background: #f4eedf;
  color: var(--ponder-muted);
  font-size: 14px;
}

.ponder-player__error {
  color: #a8463b;
}

.ponder-player__connector {
  position: absolute;
  inset: 0;
  z-index: 20;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.ponder-player__connector path {
  fill: none;
  stroke: var(--ponder-accent);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.ponder-player__connector rect {
  fill: var(--ponder-accent);
}

.ponder-callout,
.ponder-inspector {
  position: absolute;
  z-index: 24;
  width: 24%;
  min-width: 230px;
  padding: 15px 17px 16px;
  border: 1px solid #c9bda8;
  background: rgb(255 252 244 / 96%);
  box-shadow: 6px 8px 0 rgb(105 84 50 / 13%);
}

.ponder-callout > span,
.ponder-inspector > span {
  display: block;
  margin-bottom: 3px;
  color: var(--ponder-accent);
  font-size: 11px;
  line-height: 1.3;
}

.ponder-callout strong,
.ponder-inspector strong {
  display: block;
  color: var(--ponder-text);
  font-size: 17px;
  line-height: 1.35;
}

.ponder-callout p,
.ponder-inspector p {
  margin: 6px 0 0;
  color: #565d56;
  font-family: "WenQuanYi Bitmap Song 12px", sans-serif;
  font-size: 14px;
  line-height: 1.55;
}

.ponder-inspector {
  top: 18px;
  right: 18px;
  width: min(340px, 40%);
  border-color: var(--ponder-accent);
}

.ponder-inspector__objects {
  display: flex;
  max-height: 104px;
  gap: 6px;
  margin-top: 10px;
  overflow: auto;
  flex-wrap: wrap;
}

.ponder-inspector__objects button {
  padding: 5px 8px;
  border: 1px solid #c5baa7;
  border-radius: 2px;
  background: #f4eddf;
  color: #555d55;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

.ponder-inspector__objects button:hover,
.ponder-inspector__objects button:focus-visible,
.ponder-inspector__objects button.active {
  border-color: var(--ponder-accent);
  background: #fffaf1;
  color: var(--ponder-text);
  outline: none;
}

.ponder-player__step-dots {
  position: absolute;
  right: 18px;
  bottom: 17px;
  z-index: 26;
  display: flex;
  gap: 7px;
}

.ponder-player__step-dots button {
  width: 9px;
  height: 9px;
  padding: 0;
  border: 1px solid #9c9384;
  border-radius: 0;
  background: #f4eddf;
  cursor: pointer;
}

.ponder-player__step-dots button.passed {
  border-color: var(--ponder-accent);
  background: color-mix(in srgb, var(--ponder-accent) 55%, #f4eddf);
}

.ponder-player__step-dots button.active {
  border-color: #5f5649;
  background: var(--ponder-accent);
  box-shadow: 0 0 0 2px rgb(95 86 73 / 12%);
}

.ponder-player__controls {
  display: grid;
  min-height: 66px;
  grid-template-columns: auto minmax(120px, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 9px 12px;
  border-top: 1px solid var(--ponder-line);
  background: #fffaf0;
}

.ponder-player__transport {
  display: grid;
  grid-template-columns: repeat(4, 40px);
  gap: 6px;
}

.ponder-player__transport button,
.ponder-player__inspect-button {
  display: inline-grid;
  width: 40px;
  height: 40px;
  padding: 0;
  place-items: center;
  border: 1px solid #c5baa7;
  border-radius: 3px;
  background: #f3ecde;
  color: #4d554e;
  font: inherit;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.ponder-player__transport button:hover,
.ponder-player__transport button:focus-visible,
.ponder-player__inspect-button:hover,
.ponder-player__inspect-button:focus-visible {
  border-color: var(--ponder-accent);
  background: #fffdf7;
  color: var(--ponder-text);
  outline: none;
}

.ponder-player__transport button.primary,
.ponder-player__inspect-button.active {
  border-color: var(--ponder-accent);
  background: var(--ponder-accent);
  color: #252820;
}

.ponder-player__timeline {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(80px, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.ponder-player__timeline input {
  width: 100%;
  height: 20px;
  accent-color: var(--ponder-accent);
  cursor: pointer;
}

.ponder-player__timeline span {
  min-width: 36px;
  color: var(--ponder-muted);
  font-size: 12px;
  text-align: right;
}

@media (max-width: 720px) {
  .ponder-player__header {
    min-height: 0;
    flex-direction: column;
  }

  .ponder-player__identity {
    padding: 10px 13px;
  }

  .ponder-player__identity strong {
    font-size: 19px;
  }

  .ponder-player__tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid var(--ponder-line);
  }

  .ponder-player__tabs button {
    min-width: 0;
    min-height: 43px;
    padding: 6px;
    border-left: 0;
  }

  .ponder-player__tabs button + button {
    border-left: 1px solid var(--ponder-line);
  }

  .ponder-player__stage {
    aspect-ratio: 4 / 3;
    min-height: 370px;
  }

  .ponder-callout,
  .ponder-inspector {
    top: 13px !important;
    right: 13px;
    left: 13px !important;
    width: auto;
    min-width: 0;
    padding: 10px 12px;
  }

  .ponder-callout p,
  .ponder-inspector p {
    font-size: 13px;
    line-height: 1.45;
  }

  .ponder-inspector__objects {
    max-height: 64px;
  }

  .ponder-player__connector {
    display: none;
  }

  .ponder-player__controls {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }

  .ponder-player__transport {
    grid-template-columns: repeat(4, 37px);
  }

  .ponder-player__transport button,
  .ponder-player__inspect-button {
    width: 37px;
    height: 37px;
  }

  .ponder-player__timeline {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .ponder-player__step-dots {
    right: 12px;
    bottom: 12px;
  }
}

@media (max-width: 390px) {
  .ponder-player__transport {
    grid-template-columns: repeat(4, 33px);
  }

  .ponder-player__transport button,
  .ponder-player__inspect-button {
    width: 33px;
    height: 33px;
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ponder-player *,
  .ponder-player *::before,
  .ponder-player *::after {
    scroll-behavior: auto !important;
  }
}
</style>
