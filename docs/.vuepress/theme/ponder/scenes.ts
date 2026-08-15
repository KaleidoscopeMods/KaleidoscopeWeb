export type PonderModule = 'cookery' | 'tavern'

export type PonderEffect = 'none' | 'bob' | 'shake' | 'spin' | 'pulse'

export interface PonderObject {
  id: string
  label: string
  description: string
  asset?: string
  kind?: 'sprite' | 'stove' | 'fire' | 'steam' | 'liquid'
  x: number
  y: number
  z: number
  width?: number
  opacity?: number
  scale?: number
  rotate?: number
  zIndex?: number
}

export interface PonderObjectPatch {
  x?: number
  y?: number
  z?: number
  opacity?: number
  scale?: number
  rotate?: number
  effect?: PonderEffect
}

export interface PonderStep {
  title: string
  text: string
  duration: number
  focus?: string
  keyframe?: boolean
  objects?: Record<string, PonderObjectPatch>
}

export interface PonderScene {
  id: string
  module: PonderModule
  title: string
  subtitle: string
  accent: string
  objects: PonderObject[]
  steps: PonderStep[]
}

const cookeryPan: PonderScene = {
  id: 'pan-cooking',
  module: 'cookery',
  title: '炒锅烹饪',
  subtitle: '从点火、加油到翻炒出锅',
  accent: '#e7a33b',
  objects: [
    {
      id: 'stove',
      label: '炉灶',
      description: '点燃后为上方的厨具持续提供热量。',
      kind: 'stove',
      x: 0,
      y: 0,
      z: 0,
      opacity: 0,
      scale: 0.7,
    },
    {
      id: 'fire',
      label: '热源',
      description: '炒锅只有在有效热源上方才会进入烹饪状态。',
      kind: 'fire',
      x: 0,
      y: 1.05,
      z: 0,
      opacity: 0,
      scale: 0.7,
      zIndex: 3,
    },
    {
      id: 'pot',
      label: '炒锅',
      description: '依次加入油脂、食材，并使用锅铲翻炒。',
      asset: '/image/blocks/pot.png',
      x: 0,
      y: 1.05,
      z: 0,
      width: 130,
      opacity: 0,
      scale: 0.7,
      zIndex: 4,
    },
    {
      id: 'oil',
      label: '油脂',
      description: '先向加热后的炒锅加入油脂。',
      asset: '/image/items/oil.png',
      x: -2.25,
      y: 2.2,
      z: -0.3,
      width: 54,
      opacity: 0,
      scale: 0.65,
      zIndex: 8,
    },
    {
      id: 'tomato',
      label: '番茄',
      description: '食材会在炒锅中逐步改变熟度。',
      asset: '/image/items/tomato.png',
      x: -2.2,
      y: 2.35,
      z: 1.05,
      width: 52,
      opacity: 0,
      scale: 0.65,
      zIndex: 8,
    },
    {
      id: 'egg',
      label: '鸡蛋',
      description: '不同食材组合会匹配不同的炒制结果。',
      asset: '/image/items/egg.png',
      x: 2.25,
      y: 2.45,
      z: 0.5,
      width: 48,
      opacity: 0,
      scale: 0.65,
      zIndex: 8,
    },
    {
      id: 'shovel',
      label: '锅铲',
      description: '持续翻炒可以推进烹饪进度，避免食材烧焦。',
      asset: '/image/items/kitchen_shovel_no_oil.png',
      x: 2.35,
      y: 2.2,
      z: -1.1,
      width: 68,
      opacity: 0,
      scale: 0.7,
      rotate: -18,
      zIndex: 9,
    },
    {
      id: 'steam',
      label: '烹饪进度',
      description: '蒸汽与锅内变化提示食材正在被加热。',
      kind: 'steam',
      x: 0,
      y: 2.15,
      z: 0,
      opacity: 0,
      scale: 0.7,
      zIndex: 7,
    },
    {
      id: 'dish',
      label: '番茄炒蛋盖饭',
      description: '完成后使用碗盛出成品。',
      asset: '/image/items/scramble_egg_with_tomatoes_rice_bowl.png',
      x: 2.35,
      y: 1.2,
      z: 1.9,
      width: 74,
      opacity: 0,
      scale: 0.45,
      zIndex: 10,
    },
  ],
  steps: [
    {
      title: '准备热源',
      text: '将炒锅放在点燃的炉灶上方。',
      duration: 2600,
      focus: 'stove',
      keyframe: true,
      objects: {
        stove: { opacity: 1, scale: 1 },
        fire: { opacity: 1, scale: 1, effect: 'pulse' },
        pot: { opacity: 1, scale: 1 },
      },
    },
    {
      title: '加入油脂',
      text: '先加入油脂，炒锅才会开始接受食材。',
      duration: 2800,
      focus: 'oil',
      keyframe: true,
      objects: {
        oil: { opacity: 1, scale: 1, x: -1.25, y: 2.45, z: 0, effect: 'bob' },
      },
    },
    {
      title: '投入食材',
      text: '按配方放入番茄与鸡蛋，食材会落入锅中。',
      duration: 3200,
      focus: 'pot',
      keyframe: true,
      objects: {
        oil: { x: 0, y: 1.45, z: 0, opacity: 0, scale: 0.45 },
        tomato: { opacity: 1, scale: 1, x: -0.45, y: 1.8, z: 0.1, effect: 'bob' },
        egg: { opacity: 1, scale: 1, x: 0.45, y: 1.95, z: -0.05, effect: 'bob' },
      },
    },
    {
      title: '持续翻炒',
      text: '使用锅铲推进烹饪进度；放任不管会让菜烧焦。',
      duration: 3600,
      focus: 'shovel',
      keyframe: true,
      objects: {
        tomato: { x: 0, y: 1.35, z: 0, opacity: 0, scale: 0.45 },
        egg: { x: 0, y: 1.35, z: 0, opacity: 0, scale: 0.45 },
        shovel: { opacity: 1, scale: 1, x: 0.55, y: 2, z: -0.1, rotate: 28, effect: 'shake' },
        steam: { opacity: 1, scale: 1, effect: 'bob' },
        pot: { effect: 'pulse' },
      },
    },
    {
      title: '盛出成品',
      text: '烹饪完成后使用碗取出菜品。',
      duration: 3200,
      focus: 'dish',
      keyframe: true,
      objects: {
        shovel: { x: 2.35, y: 2.2, z: -1.1, rotate: -18, opacity: 0.35 },
        steam: { opacity: 0.35, scale: 0.8 },
        dish: { opacity: 1, scale: 1, effect: 'pulse' },
      },
    },
  ],
}

const cookeryChopping: PonderScene = {
  id: 'chopping-board',
  module: 'cookery',
  title: '菜板加工',
  subtitle: '使用菜刀制备更小的食材',
  accent: '#6db78a',
  objects: [
    {
      id: 'board',
      label: '菜板',
      description: '放置后可用于处理肉类、蔬菜等食材。',
      asset: '/image/blocks/chopping_board.png',
      x: 0,
      y: 0.1,
      z: 0,
      width: 132,
      opacity: 0,
      scale: 0.7,
    },
    {
      id: 'meat',
      label: '生猪五花肉',
      description: '把待处理食材放在菜板上。',
      asset: '/image/items/raw_pork_belly.png',
      x: -2.1,
      y: 1.6,
      z: 0,
      width: 58,
      opacity: 0,
      scale: 0.7,
      zIndex: 5,
    },
    {
      id: 'knife',
      label: '铁制菜刀',
      description: '对准菜板使用菜刀完成切制。',
      asset: '/image/items/iron_kitchen_knife.png',
      x: 2.2,
      y: 2.05,
      z: -0.8,
      width: 72,
      opacity: 0,
      scale: 0.7,
      rotate: -22,
      zIndex: 8,
    },
    {
      id: 'cuts',
      label: '生小块肉',
      description: '加工结果可继续用于炒制、炖煮等配方。',
      asset: '/image/items/raw_cut_small_meats.png',
      x: 1.8,
      y: 1.1,
      z: 1.7,
      width: 66,
      opacity: 0,
      scale: 0.45,
      zIndex: 9,
    },
  ],
  steps: [
    {
      title: '摆放菜板',
      text: '菜板是多种食材加工流程的起点。',
      duration: 2600,
      focus: 'board',
      keyframe: true,
      objects: { board: { opacity: 1, scale: 1 } },
    },
    {
      title: '放上食材',
      text: '手持食材对菜板使用，将它摆到工作面上。',
      duration: 2800,
      focus: 'meat',
      keyframe: true,
      objects: { meat: { opacity: 1, scale: 1, x: 0, y: 0.95, z: 0, effect: 'bob' } },
    },
    {
      title: '挥动菜刀',
      text: '使用菜刀进行加工，不同材料会产出对应的小份食材。',
      duration: 3400,
      focus: 'knife',
      keyframe: true,
      objects: { knife: { opacity: 1, scale: 1, x: 0.35, y: 1.8, z: -0.1, rotate: 34, effect: 'shake' } },
    },
    {
      title: '收取产物',
      text: '切制完成，产物可以直接拾取或进入下一道工序。',
      duration: 3000,
      focus: 'cuts',
      keyframe: true,
      objects: {
        meat: { opacity: 0, scale: 0.4 },
        knife: { x: 2.2, y: 2.05, z: -0.8, opacity: 0.35, rotate: -22 },
        cuts: { opacity: 1, scale: 1, effect: 'pulse' },
      },
    },
  ],
}

const tavernBrewing: PonderScene = {
  id: 'press-and-brew',
  module: 'tavern',
  title: '榨汁与发酵',
  subtitle: '从葡萄到一瓶陈酿',
  accent: '#b75d6a',
  objects: [
    {
      id: 'tub',
      label: '果盆',
      description: '装入葡萄或浆果后，通过跳踩压榨果汁。',
      asset: '/image/blocks/tavern/pressing_tub.png',
      x: -1.25,
      y: 0,
      z: 0,
      width: 138,
      opacity: 0,
      scale: 0.7,
    },
    {
      id: 'grapeA',
      label: '葡萄',
      description: '普通葡萄可以压榨为葡萄汁。',
      asset: '/image/items/tavern/grape.png',
      x: -2.7,
      y: 2.2,
      z: -0.5,
      width: 52,
      opacity: 0,
      scale: 0.65,
      zIndex: 7,
    },
    {
      id: 'grapeB',
      label: '葡萄',
      description: '投入足量原料后即可开始跳踩。',
      asset: '/image/items/tavern/grape.png',
      x: -2.25,
      y: 2.45,
      z: 0.4,
      width: 48,
      opacity: 0,
      scale: 0.6,
      zIndex: 7,
    },
    {
      id: 'juice',
      label: '葡萄汁桶',
      description: '压榨完成后收集果汁，准备投入酒桶。',
      asset: '/image/items/tavern/grape_bucket.png',
      x: -0.1,
      y: 1.2,
      z: 1.8,
      width: 64,
      opacity: 0,
      scale: 0.45,
      zIndex: 8,
    },
    {
      id: 'barrel',
      label: '酒桶',
      description: '加入 4000 mB 果汁、配方原料并合盖发酵。',
      asset: '/image/blocks/tavern/barrel.png',
      x: 1.7,
      y: 0,
      z: 0,
      width: 142,
      opacity: 0,
      scale: 0.7,
    },
    {
      id: 'liquid',
      label: '发酵中的酒液',
      description: '等待越久，酒饮品质与效果通常越高。',
      kind: 'liquid',
      x: 1.7,
      y: 1.65,
      z: 0,
      opacity: 0,
      scale: 0.6,
      zIndex: 4,
    },
    {
      id: 'bottle',
      label: '葡萄酒',
      description: '在酒桶龙头下放置空瓶，取出当前品质的酒饮。',
      asset: '/image/items/tavern/wine.png',
      x: 2.65,
      y: 1.2,
      z: 1.65,
      width: 62,
      opacity: 0,
      scale: 0.45,
      zIndex: 9,
    },
  ],
  steps: [
    {
      title: '装入葡萄',
      text: '把葡萄放进果盆，为压榨做好准备。',
      duration: 2800,
      focus: 'tub',
      keyframe: true,
      objects: {
        tub: { opacity: 1, scale: 1 },
        grapeA: { opacity: 1, scale: 1, x: -1.45, y: 1.35, z: 0, effect: 'bob' },
        grapeB: { opacity: 1, scale: 1, x: -1.05, y: 1.45, z: 0.15, effect: 'bob' },
      },
    },
    {
      title: '反复跳踩',
      text: '进入果盆跳踩，原料会逐渐转化成果汁。',
      duration: 3400,
      focus: 'tub',
      keyframe: true,
      objects: {
        tub: { effect: 'shake' },
        grapeA: { y: 0.85, opacity: 0.25, scale: 0.65 },
        grapeB: { y: 0.85, opacity: 0.25, scale: 0.65 },
        juice: { opacity: 1, scale: 1, effect: 'pulse' },
      },
    },
    {
      title: '注入酒桶',
      text: '向打开的酒桶加入 4000 mB 果汁与配方原料。',
      duration: 3400,
      focus: 'barrel',
      keyframe: true,
      objects: {
        barrel: { opacity: 1, scale: 1 },
        juice: { x: 1.05, y: 2, z: 0, rotate: -28, effect: 'bob' },
        liquid: { opacity: 0.75, scale: 1, effect: 'pulse' },
      },
    },
    {
      title: '等待发酵',
      text: '合上桶盖并等待，酒饮会逐步提升品质。',
      duration: 3800,
      focus: 'liquid',
      keyframe: true,
      objects: {
        juice: { opacity: 0, scale: 0.4, y: 1.35 },
        barrel: { effect: 'pulse' },
        liquid: { opacity: 1, scale: 1.15, effect: 'bob' },
      },
    },
    {
      title: '装瓶取酒',
      text: '在龙头下放置空瓶，取得当前品质的葡萄酒。',
      duration: 3200,
      focus: 'bottle',
      keyframe: true,
      objects: {
        liquid: { opacity: 0.35, scale: 0.8 },
        bottle: { opacity: 1, scale: 1, effect: 'pulse' },
      },
    },
  ],
}

const tavernMixology: PonderScene = {
  id: 'mixology',
  module: 'tavern',
  title: '雪克杯调酒',
  subtitle: '三份酒饮组合成一杯特调',
  accent: '#62a6a0',
  objects: [
    {
      id: 'shaker',
      label: '雪克杯',
      description: '加入三份优质及以上的酒饮后进行摇制。',
      asset: '/image/blocks/tavern/shaker.png',
      x: 0,
      y: 0.2,
      z: 0,
      width: 112,
      opacity: 0,
      scale: 0.7,
    },
    {
      id: 'wineA',
      label: '葡萄酒',
      description: '酒饮的颜色和效果会参与调酒结果计算。',
      asset: '/image/items/tavern/wine.png',
      x: -2.25,
      y: 2.1,
      z: -0.5,
      width: 56,
      opacity: 0,
      scale: 0.65,
      zIndex: 7,
    },
    {
      id: 'wineB',
      label: '蜂蜜酒',
      description: '固定组合可以得到特定鸡尾酒配方。',
      asset: '/image/items/tavern/honey_wine.png',
      x: 2.15,
      y: 2.2,
      z: -0.4,
      width: 56,
      opacity: 0,
      scale: 0.65,
      zIndex: 7,
    },
    {
      id: 'wineC',
      label: '樱花酒',
      description: '非固定组合则根据颜色与效果生成特调。',
      asset: '/image/items/tavern/sakura_wine.png',
      x: -0.1,
      y: 2.35,
      z: 2.2,
      width: 56,
      opacity: 0,
      scale: 0.65,
      zIndex: 7,
    },
    {
      id: 'cocktail',
      label: '绒球葱花园',
      description: '掌握摇制时间后，将成品倒入空酒杯。',
      asset: '/image/items/tavern/allium_garden.png',
      x: 2.15,
      y: 1.2,
      z: 1.8,
      width: 68,
      opacity: 0,
      scale: 0.45,
      zIndex: 9,
    },
  ],
  steps: [
    {
      title: '准备雪克杯',
      text: '雪克杯是调制鸡尾酒的核心工具。',
      duration: 2400,
      focus: 'shaker',
      keyframe: true,
      objects: { shaker: { opacity: 1, scale: 1 } },
    },
    {
      title: '加入三份酒饮',
      text: '投入三份优质及以上的酒饮，开始组合颜色与效果。',
      duration: 3400,
      focus: 'wineA',
      keyframe: true,
      objects: {
        wineA: { opacity: 1, scale: 1, x: -0.55, y: 1.65, z: 0, effect: 'bob' },
        wineB: { opacity: 1, scale: 1, x: 0.5, y: 1.75, z: -0.05, effect: 'bob' },
        wineC: { opacity: 1, scale: 1, x: 0, y: 1.85, z: 0.5, effect: 'bob' },
      },
    },
    {
      title: '控制摇制时间',
      text: '持续摇动雪克杯，在合适的时机停止。',
      duration: 3600,
      focus: 'shaker',
      keyframe: true,
      objects: {
        wineA: { x: 0, y: 0.9, z: 0, opacity: 0, scale: 0.4 },
        wineB: { x: 0, y: 0.9, z: 0, opacity: 0, scale: 0.4 },
        wineC: { x: 0, y: 0.9, z: 0, opacity: 0, scale: 0.4 },
        shaker: { effect: 'shake', rotate: 16 },
      },
    },
    {
      title: '倒出特调',
      text: '完成摇制后，将鸡尾酒倒入空酒杯。',
      duration: 3200,
      focus: 'cocktail',
      keyframe: true,
      objects: {
        shaker: { x: 0.5, y: 1, z: 0, rotate: 34, effect: 'bob' },
        cocktail: { opacity: 1, scale: 1, effect: 'pulse' },
      },
    },
  ],
}

export const ponderScenes: PonderScene[] = [cookeryPan, cookeryChopping, tavernBrewing, tavernMixology]

export function getPonderScenes(module: PonderModule) {
  return ponderScenes.filter(scene => scene.module === module)
}
