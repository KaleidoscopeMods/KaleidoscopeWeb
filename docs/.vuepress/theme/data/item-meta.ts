import type { CanonicalItemName } from './item-images'

export interface ItemMeta {
  name?: {
    zhCN?: string
  }
  description?: {
    zhCN?: string
  }
  rarity?: string
  category?: string
}

export const itemMetaMap: Partial<Record<CanonicalItemName, ItemMeta>> = {
  baozi: {
    name: {
      zhCN: '包子',
    },
  },
  barley_tea: {
    name: {
      zhCN: '大麦茶',
    },
  },
  beef_meatball_soup: {
    name: {
      zhCN: '牛丸汤',
    },
  },
  beef_noodle: {
    name: {
      zhCN: '牛肉面',
    },
  },
  biluochun: {
    name: {
      zhCN: '碧螺春',
    },
  },
  blaze_lamb_chop: {
    name: {
      zhCN: '烈焰羊排',
    },
  },
  borscht: {
    name: {
      zhCN: '罗宋汤',
    },
  },
  braised_beef: {
    name: {
      zhCN: '红烧牛肉',
    },
  },
  braised_beef_rice_bowl: {
    name: {
      zhCN: '红烧牛肉盖饭',
    },
  },
  braised_beef_with_potatoes: {
    name: {
      zhCN: '土豆炖牛肉',
    },
  },
  braised_fish: {
    name: {
      zhCN: '红烧鱼',
    },
  },
  braised_fish_rice_bowl: {
    name: {
      zhCN: '红烧鱼盖饭',
    },
  },
  braised_pork_ribs: {
    name: {
      zhCN: '红烧排骨',
    },
  },
  brown_mushroom_pot_soup: {
    name: {
      zhCN: '棕蘑菇瓦罐汤',
    },
  },
  buddha_jumps_over_the_wall: {
    name: {
      zhCN: '佛跳墙',
    },
  },
  candied_potato: {
    name: {
      zhCN: '拔丝土豆',
    },
  },
  caterpillar: {
    name: {
      zhCN: '猪儿虫',
    },
  },
  chicken_and_mushroom_stew: {
    name: {
      zhCN: '小鸡炖蘑菇',
    },
  },
  chili_seed: {
    name: {
      zhCN: '辣椒种子',
    },
    category: 'seed',
  },
  chorus_fried_egg: {
    name: {
      zhCN: '荷包紫颂烧',
    },
  },
  cold_roasted_meat: {
    name: {
      zhCN: '冷肉炙',
    },
  },
  cold_style_sashimi: {
    name: {
      zhCN: '寒带风味刺身',
    },
  },
  cooked_cow_offal: {
    name: {
      zhCN: '熟牛杂',
    },
  },
  cooked_cut_small_meats: {
    name: {
      zhCN: '熟切制小肉',
    },
  },
  cooked_donkey_meat: {
    name: {
      zhCN: '熟驴肉',
    },
  },
  cooked_lamb_chops: {
    name: {
      zhCN: '熟羊排',
    },
  },
  cooked_meatball: {
    name: {
      zhCN: '熟丸子',
    },
  },
  cooked_pork_belly: {
    name: {
      zhCN: '熟五花肉',
    },
  },
  cooked_rice: {
    name: {
      zhCN: '米饭',
    },
  },
  country_style_mixed_vegetables: {
    name: {
      zhCN: '田园杂蔬',
    },
  },
  crimson_fungus_pot_soup: {
    name: {
      zhCN: '绯红菌瓦罐汤',
    },
  },
  crystal_lamb_chop: {
    name: {
      zhCN: '水晶羊排',
    },
  },
  dark_cuisine: {
    name: {
      zhCN: '黑暗料理',
    },
  },
  delicious_egg_fried_rice: {
    name: {
      zhCN: '美味蛋炒饭',
    },
  },
  desert_style_sashimi: {
    name: {
      zhCN: '沙漠风味刺身',
    },
  },
  diamond_kitchen_knife: {
    name: {
      zhCN: '钻石菜刀',
    },
  },
  dongpo_pork: {
    name: {
      zhCN: '东坡肉',
    },
  },
  donkey_burger: {
    name: {
      zhCN: '驴肉火烧',
    },
  },
  donkey_soup: {
    name: {
      zhCN: '驴肉汤',
    },
  },
  dough_drop_soup: {
    name: {
      zhCN: '疙瘩汤',
    },
  },
  dumpling: {
    name: {
      zhCN: '饺子',
    },
  },
  egg_fried_rice: {
    name: {
      zhCN: '蛋炒饭',
    },
  },
  empty_cup: {
    name: {
      zhCN: '空茶杯',
    },
  },
  enamel_basin: {
    name: {
      zhCN: '搪瓷盆子',
    },
  },
  end_style_sashimi: {
    name: {
      zhCN: '末地风味刺身',
    },
  },
  farmer_boots: {
    name: {
      zhCN: '农夫皮靴',
    },
  },
  farmer_chest_plate: {
    name: {
      zhCN: '农夫围裙',
    },
  },
  farmer_leggings: {
    name: {
      zhCN: '农夫长裤',
    },
  },
  fearsome_thick_soup: {
    name: {
      zhCN: '恐惧浓汤',
    },
  },
  fish_flavored_shredded_pork: {
    name: {
      zhCN: '鱼香肉丝',
    },
  },
  fish_flavored_shredded_pork_rice_bowl: {
    name: {
      zhCN: '鱼香肉丝盖饭',
    },
  },
  flour: {
    name: {
      zhCN: '面粉',
    },
  },
  flower_tea: {
    name: {
      zhCN: '花茶',
    },
  },
  fondant_pie: {
    name: {
      zhCN: '翻糖派',
    },
  },
  fondant_spider_eye: {
    name: {
      zhCN: '翻糖蛛眼',
    },
  },
  four_joy_meatball_soup: {
    name: {
      zhCN: '四喜丸子汤',
    },
  },
  fried_caterpillar: {
    name: {
      zhCN: '油炸猪儿虫',
    },
  },
  fried_egg: {
    name: {
      zhCN: '煎蛋',
    },
  },
  fried_spring_roll: {
    name: {
      zhCN: '炸春卷',
    },
  },
  frost_lamb_chop: {
    name: {
      zhCN: '凛冬羊排',
    },
  },
  fruit_basket: {
    name: {
      zhCN: '果篮',
    },
  },
  fruit_platter: {
    name: {
      zhCN: '水果拼盘',
    },
  },
  gold_kitchen_knife: {
    name: {
      zhCN: '金菜刀',
    },
  },
  golden_salad: {
    name: {
      zhCN: '黄金沙拉',
    },
  },
  green_chili: {
    name: {
      zhCN: '青辣椒',
    },
    category: 'crop',
  },
  hui_noodle: {
    name: {
      zhCN: '羊肉烩面',
    },
  },
  iron_kitchen_knife: {
    name: {
      zhCN: '铁菜刀',
    },
  },
  kitchenware_racks: {
    name: {
      zhCN: '厨具架',
    },
  },
  lamb_and_radish_soup: {
    name: {
      zhCN: '萝卜羊肉汤',
    },
  },
  lettuce: {
    name: {
      zhCN: '生菜',
    },
    category: 'crop',
  },
  lettuce_seed: {
    name: {
      zhCN: '生菜种子',
    },
    category: 'seed',
  },
  mantou: {
    name: {
      zhCN: '馒头',
    },
  },
  meat_pie: {
    name: {
      zhCN: '馅饼',
    },
  },
  millstone: {
    name: {
      zhCN: '石磨',
    },
  },
  nether_style_sashimi: {
    name: {
      zhCN: '下界风味刺身',
    },
  },
  netherite_kitchen_knife: {
    name: {
      zhCN: '下界合金菜刀',
    },
  },
  numbing_spicy_chicken: {
    name: {
      zhCN: '椒麻鸡',
    },
  },
  oil: {
    name: {
      zhCN: '油脂',
    },
  },
  oil_splashed_fish: {
    name: {
      zhCN: '油泼鱼',
    },
  },
  oolong: {
    name: {
      zhCN: '乌龙茶',
    },
  },
  pan_seared_knight_steak: {
    name: {
      zhCN: '香煎骑士牛排',
    },
  },
  pork_bone_soup: {
    name: {
      zhCN: '大骨汤',
    },
  },
  pufferfish_soup: {
    name: {
      zhCN: '河豚汤',
    },
  },
  raw_cow_offal: {
    name: {
      zhCN: '生牛杂',
    },
  },
  raw_cut_small_meats: {
    name: {
      zhCN: '生切制小肉',
    },
  },
  raw_donkey_meat: {
    name: {
      zhCN: '生驴肉',
    },
  },
  raw_lamb_chops: {
    name: {
      zhCN: '生羊排',
    },
  },
  raw_meatball: {
    name: {
      zhCN: '生丸子',
    },
  },
  raw_noodles: {
    name: {
      zhCN: '生面条',
    },
  },
  raw_pork_belly: {
    name: {
      zhCN: '生五花肉',
    },
  },
  red_chili: {
    name: {
      zhCN: '红辣椒',
    },
    category: 'crop',
  },
  red_mushroom_pot_soup: {
    name: {
      zhCN: '红蘑菇瓦罐汤',
    },
  },
  rice: {
    name: {
      zhCN: '稻米',
    },
    category: 'crop',
  },
  rice_panicle: {
    name: {
      zhCN: '稻穗',
    },
    category: 'crop',
  },
  sakura_fubuki: {
    name: {
      zhCN: '樱吹雪',
    },
  },
  samsa: {
    name: {
      zhCN: '烤包子',
    },
  },
  sashimi: {
    name: {
      zhCN: '刺身',
    },
  },
  scarecrow: {
    name: {
      zhCN: '稻草人',
    },
    category: 'tool',
  },
  scramble_egg_with_tomatoes: {
    name: {
      zhCN: '番茄炒蛋',
    },
  },
  scramble_egg_with_tomatoes_rice_bowl: {
    name: {
      zhCN: '番茄炒蛋盖饭',
    },
  },
  seafood_miso_soup: {
    name: {
      zhCN: '海鲜味噌汤',
    },
  },
  shawarma_spit: {
    name: {
      zhCN: '旋风烤肉塔',
    },
  },
  shengjian_mantou: {
    name: {
      zhCN: '水煎包',
    },
  },
  sickle: {
    name: {
      zhCN: '镰刀',
    },
    category: 'tool',
  },
  slime_ball_meal: {
    name: {
      zhCN: '黏液饭',
    },
  },
  spicy_blood_stew: {
    name: {
      zhCN: '毛血旺',
    },
  },
  spicy_chicken: {
    name: {
      zhCN: '辣子鸡',
    },
  },
  spicy_chicken_rice_bowl: {
    name: {
      zhCN: '辣子鸡盖饭',
    },
  },
  spicy_rabbit_head: {
    name: {
      zhCN: '麻辣兔头',
    },
  },
  stargazy_pie: {
    name: {
      zhCN: '仰望星空派',
    },
  },
  stir_fried_beef_offal: {
    name: {
      zhCN: '爆炒牛杂',
    },
  },
  stir_fried_beef_offal_rice_bowl: {
    name: {
      zhCN: '爆炒牛杂盖饭',
    },
  },
  stir_fried_pork_with_peppers: {
    name: {
      zhCN: '青椒炒肉',
    },
  },
  stir_fried_pork_with_peppers_rice_bowl: {
    name: {
      zhCN: '青椒炒肉盖饭',
    },
  },
  straw_hat: {
    name: {
      zhCN: '草帽',
    },
    category: 'equipment',
  },
  straw_hat_flower: {
    name: {
      zhCN: '缀花草帽',
    },
    category: 'equipment',
  },
  stuffed_dough_food: {
    name: {
      zhCN: '裹馅面食',
    },
  },
  stuffed_tiger_skin_pepper: {
    name: {
      zhCN: '虎皮青椒酿肉',
    },
  },
  suspicious_stir_fry: {
    name: {
      zhCN: '谜之炒菜',
    },
  },
  suspicious_stir_fry_rice_bowl: {
    name: {
      zhCN: '谜之炒菜盖饭',
    },
  },
  sweet_and_sour_ender_pearls: {
    name: {
      zhCN: '珍珠咕噜肉',
    },
  },
  sweet_and_sour_pork: {
    name: {
      zhCN: '糖醋里脊',
    },
  },
  sweet_and_sour_pork_rice_bowl: {
    name: {
      zhCN: '糖醋里脊盖饭',
    },
  },
  teapot: {
    name: {
      zhCN: '茶壶',
    },
  },
  tieguanyin: {
    name: {
      zhCN: '铁观音',
    },
  },
  tomato: {
    name: {
      zhCN: '番茄',
    },
    category: 'crop',
  },
  tomato_beef_brisket_soup: {
    name: {
      zhCN: '番茄牛腩汤',
    },
  },
  tomato_seed: {
    name: {
      zhCN: '番茄种子',
    },
    category: 'seed',
  },
  tundra_style_sashimi: {
    name: {
      zhCN: '苔原风味刺身',
    },
  },
  udon_noodle: {
    name: {
      zhCN: '乌冬面',
    },
  },
  warped_fungus_pot_soup: {
    name: {
      zhCN: '诡异菌瓦罐汤',
    },
  },
  wild_mushroom_rabbit_soup: {
    name: {
      zhCN: '野菌兔肉汤',
    },
  },
  wild_rice: {
    name: {
      zhCN: '野生稻米',
    },
    category: 'crop',
  },
  yakitori: {
    name: {
      zhCN: '烧鸟串',
    },
  },
}

export function getItemMeta(name: CanonicalItemName): ItemMeta | undefined {
  return itemMetaMap[name]
}
