# Updated build_difficulty.py
# User requirements:
# 1. ถ้าง่ายมากๆ: หน่วยเวลาเป็น "วินาที" (45 - 90 วินาที)
# 2. ถ้าง่าย / ปานกลาง: หน่วยเวลาเป็น "นาที" (2 - 10 นาที)
# 3. ถ้ายาก: หน่วยเวลาเป็น "นาที" (15 - 30 นาที)
# 4. ถ้ายากมาก: หน่วยเวลาเป็น "ชั่วโมง" (1 - 2 ชั่วโมง!)

code = '''// Item Difficulty & Countdown Duration for Speedrun Roulette
// Analyzed specifically for Minecraft Bedrock Survival Speedrunning

export const TIERS = {
  1: { tier: 1, tierName: "ง่ายมากๆ", enName: "Very Easy", color: "§a", defaultSeconds: 60, defaultUnit: "วินาที", defaultUnitEn: "seconds" },
  2: { tier: 2, tierName: "ง่าย", enName: "Easy", color: "§2", defaultSeconds: 150, defaultUnit: "นาที", defaultUnitEn: "minutes" },
  3: { tier: 3, tierName: "ปานกลาง", enName: "Medium", color: "§e", defaultSeconds: 420, defaultUnit: "นาที", defaultUnitEn: "minutes" },
  4: { tier: 4, tierName: "ยาก", enName: "Hard", color: "§6", defaultSeconds: 1200, defaultUnit: "นาที", defaultUnitEn: "minutes" },
  5: { tier: 5, tierName: "ยากมาก", enName: "Extreme", color: "§c", defaultSeconds: 3600, defaultUnit: "ชั่วโมง", defaultUnitEn: "hours" },
};

export function formatDurationTh(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (h > 0) parts.push(`${h} ชั่วโมง`);
  if (m > 0) parts.push(`${m} นาที`);
  if (s > 0 || parts.length === 0) parts.push(`${s} วินาที`);
  return parts.join(" ");
}

export function formatDurationEn(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (h > 0) parts.push(`${h} hr${h > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} min${m > 1 ? "s" : ""}`);
  if (s > 0 || parts.length === 0) parts.push(`${s} sec${s > 1 ? "s" : ""}`);
  return parts.join(" ");
}

export function formatDuration(seconds, lang = "en") {
  return lang === "th" ? formatDurationTh(seconds) : formatDurationEn(seconds);
}

export function formatDigitalTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  if (h > 0) {
    const hh = String(h).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

// Detailed manual ratings for key items
export const EXACT_ITEMS = {
  // === TIER 1: ง่ายมากๆ (Very Easy) -> หน่วยเป็น "วินาที" (45 - 90 วินาที) ===
  "dirt": { tier: 1, seconds: 45 },
  "grass_block": { tier: 1, seconds: 45 },
  "coarse_dirt": { tier: 1, seconds: 45 },
  "rooted_dirt": { tier: 1, seconds: 45 },
  "mud": { tier: 1, seconds: 45 },
  "clay": { tier: 1, seconds: 60 },
  "clay_ball": { tier: 1, seconds: 60 },
  "sand": { tier: 1, seconds: 45 },
  "red_sand": { tier: 1, seconds: 60 },
  "gravel": { tier: 1, seconds: 45 },
  "flint": { tier: 1, seconds: 60 },
  "cobblestone": { tier: 1, seconds: 45 },
  "stone": { tier: 1, seconds: 60 },
  "smooth_stone": { tier: 1, seconds: 90 },
  "granite": { tier: 1, seconds: 60 },
  "diorite": { tier: 1, seconds: 60 },
  "andesite": { tier: 1, seconds: 60 },
  "stick": { tier: 1, seconds: 45 },
  "crafting_table": { tier: 1, seconds: 45 },
  "torch": { tier: 1, seconds: 60 },
  "oak_log": { tier: 1, seconds: 45 },
  "spruce_log": { tier: 1, seconds: 45 },
  "birch_log": { tier: 1, seconds: 45 },
  "jungle_log": { tier: 1, seconds: 45 },
  "acacia_log": { tier: 1, seconds: 45 },
  "dark_oak_log": { tier: 1, seconds: 45 },
  "mangrove_log": { tier: 1, seconds: 60 },
  "cherry_log": { tier: 1, seconds: 60 },
  "bamboo_block": { tier: 1, seconds: 60 },
  "bamboo": { tier: 1, seconds: 45 },
  "sugar_cane": { tier: 1, seconds: 60 },
  "kelp": { tier: 1, seconds: 60 },
  "dried_kelp": { tier: 1, seconds: 90 },
  "feather": { tier: 1, seconds: 60 },
  "raw_chicken": { tier: 1, seconds: 60 },
  "rotten_flesh": { tier: 1, seconds: 60 },
  "wheat_seeds": { tier: 1, seconds: 45 },
  "pumpkin_seeds": { tier: 1, seconds: 60 },
  "melon_seeds": { tier: 1, seconds: 60 },
  "beetroot_seeds": { tier: 1, seconds: 60 },
  "wooden_sword": { tier: 1, seconds: 60 },
  "wooden_pickaxe": { tier: 1, seconds: 60 },
  "wooden_axe": { tier: 1, seconds: 60 },
  "wooden_shovel": { tier: 1, seconds: 60 },
  "wooden_hoe": { tier: 1, seconds: 60 },
  "sweet_berries": { tier: 1, seconds: 60 },
  "dandelion": { tier: 1, seconds: 45 },
  "poppy": { tier: 1, seconds: 45 },
  "blue_orchid": { tier: 1, seconds: 60 },
  "allium": { tier: 1, seconds: 60 },
  "azure_bluet": { tier: 1, seconds: 60 },
  "red_tulip": { tier: 1, seconds: 60 },
  "orange_tulip": { tier: 1, seconds: 60 },
  "white_tulip": { tier: 1, seconds: 60 },
  "pink_tulip": { tier: 1, seconds: 60 },
  "oxeye_daisy": { tier: 1, seconds: 60 },
  "cornflower": { tier: 1, seconds: 60 },
  "lily_of_the_valley": { tier: 1, seconds: 60 },
  "sunflower": { tier: 1, seconds: 60 },
  "lilac": { tier: 1, seconds: 60 },
  "rose_bush": { tier: 1, seconds: 60 },
  "peony": { tier: 1, seconds: 60 },

  // === TIER 2: ง่าย (Easy) -> หน่วยเป็น "นาที" (2 - 4 นาที) ===
  "coal": { tier: 2, seconds: 120 },               // 2 นาที
  "charcoal": { tier: 2, seconds: 120 },           // 2 นาที
  "coal_block": { tier: 2, seconds: 150 },         // 2 นาที 30 วินาที
  "coal_ore": { tier: 2, seconds: 120 },           // 2 นาที
  "raw_iron": { tier: 2, seconds: 150 },           // 2 นาที 30 วินาที
  "raw_copper": { tier: 2, seconds: 150 },         // 2 นาที 30 วินาที
  "furnace": { tier: 2, seconds: 120 },            // 2 นาที
  "smoker": { tier: 2, seconds: 150 },             // 2 นาที 30 วินาที
  "blast_furnace": { tier: 2, seconds: 180 },      // 3 นาที
  "stone_sword": { tier: 2, seconds: 120 },        // 2 นาที
  "stone_pickaxe": { tier: 2, seconds: 120 },      // 2 นาที
  "stone_axe": { tier: 2, seconds: 120 },          // 2 นาที
  "stone_shovel": { tier: 2, seconds: 120 },       // 2 นาที
  "stone_hoe": { tier: 2, seconds: 120 },          // 2 นาที
  "chest": { tier: 2, seconds: 120 },              // 2 นาที
  "barrel": { tier: 2, seconds: 150 },             // 2 นาที 30 วินาที
  "trapped_chest": { tier: 2, seconds: 180 },      // 3 นาที
  "ladder": { tier: 2, seconds: 120 },             // 2 นาที
  "white_wool": { tier: 2, seconds: 120 },         // 2 นาที
  "black_wool": { tier: 2, seconds: 150 },         // 2 นาที 30 วินาที
  "red_wool": { tier: 2, seconds: 150 },           // 2 นาที 30 วินาที
  "raw_beef": { tier: 2, seconds: 120 },           // 2 นาที
  "cooked_beef": { tier: 2, seconds: 150 },        // 2 นาที 30 วินาที
  "beef_cooked": { tier: 2, seconds: 150 },        // 2 นาที 30 วินาที
  "raw_porkchop": { tier: 2, seconds: 120 },       // 2 นาที
  "cooked_porkchop": { tier: 2, seconds: 150 },    // 2 นาที 30 วินาที
  "porkchop_cooked": { tier: 2, seconds: 150 },    // 2 นาที 30 วินาที
  "raw_mutton": { tier: 2, seconds: 120 },         // 2 นาที
  "cooked_mutton": { tier: 2, seconds: 150 },      // 2 นาที 30 วินาที
  "mutton_cooked": { tier: 2, seconds: 150 },      // 2 นาที 30 วินาที
  "cooked_chicken": { tier: 2, seconds: 150 },     // 2 นาที 30 วินาที
  "chicken_cooked": { tier: 2, seconds: 150 },     // 2 นาที 30 วินาที
  "wheat": { tier: 2, seconds: 150 },              // 2 นาที 30 วินาที
  "bread": { tier: 2, seconds: 150 },              // 2 นาที 30 วินาที
  "apple": { tier: 2, seconds: 180 },              // 3 นาที
  "bone": { tier: 2, seconds: 150 },               // 2 นาที 30 วินาที
  "bone_meal": { tier: 2, seconds: 150 },          // 2 นาที 30 วินาที
  "bone_block": { tier: 2, seconds: 180 },         // 3 นาที
  "string": { tier: 2, seconds: 150 },             // 2 นาที 30 วินาที
  "spider_eye": { tier: 2, seconds: 180 },         // 3 นาที
  "paper": { tier: 2, seconds: 150 },              // 2 นาที 30 วินาที
  "book": { tier: 2, seconds: 210 },               // 3 นาที 30 วินาที
  "leather": { tier: 2, seconds: 180 },            // 3 นาที
  "glass": { tier: 2, seconds: 150 },              // 2 นาที 30 วินาที
  "glass_bottle": { tier: 2, seconds: 180 },       // 3 นาที
  "brick": { tier: 2, seconds: 180 },              // 3 นาที
  "bricks": { tier: 2, seconds: 210 },             // 3 นาที 30 วินาที
  "campfire": { tier: 2, seconds: 150 },           // 2 นาที 30 วินาที
  "carrot": { tier: 2, seconds: 180 },             // 3 นาที
  "potato": { tier: 2, seconds: 180 },             // 3 นาที
  "beetroot": { tier: 2, seconds: 180 },           // 3 นาที
  "snowball": { tier: 2, seconds: 120 },           // 2 นาที
  "snow_block": { tier: 2, seconds: 150 },         // 2 นาที 30 วินาที
  "bowl": { tier: 2, seconds: 120 },               // 2 นาที
  "flower_pot": { tier: 2, seconds: 180 },         // 3 นาที

  // === TIER 3: ปานกลาง (Medium) -> หน่วยเป็น "นาที" (5 - 10 นาที) ===
  "iron_ingot": { tier: 3, seconds: 300 },         // 5 นาที
  "iron_block": { tier: 3, seconds: 480 },         // 8 นาที
  "raw_iron_block": { tier: 3, seconds: 420 },     // 7 นาที
  "iron_sword": { tier: 3, seconds: 300 },         // 5 นาที
  "iron_pickaxe": { tier: 3, seconds: 330 },       // 5 นาที 30 วินาที
  "iron_axe": { tier: 3, seconds: 330 },           // 5 นาที 30 วินาที
  "iron_shovel": { tier: 3, seconds: 300 },        // 5 นาที
  "iron_hoe": { tier: 3, seconds: 300 },           // 5 นาที
  "iron_helmet": { tier: 3, seconds: 360 },        // 6 นาที
  "iron_chestplate": { tier: 3, seconds: 420 },    // 7 นาที
  "iron_leggings": { tier: 3, seconds: 390 },      // 6 นาที 30 วินาที
  "iron_boots": { tier: 3, seconds: 360 },         // 6 นาที
  "bucket": { tier: 3, seconds: 300 },             // 5 นาที
  "water_bucket": { tier: 3, seconds: 330 },       // 5 นาที 30 วินาที
  "milk_bucket": { tier: 3, seconds: 360 },        // 6 นาที
  "shears": { tier: 3, seconds: 300 },             // 5 นาที
  "flint_and_steel": { tier: 3, seconds: 300 },    // 5 นาที
  "shield": { tier: 3, seconds: 300 },             // 5 นาที
  "bow": { tier: 3, seconds: 360 },                // 6 นาที
  "arrow": { tier: 3, seconds: 330 },              // 5 นาที 30 วินาที
  "crossbow": { tier: 3, seconds: 420 },           // 7 นาที
  "copper_ingot": { tier: 3, seconds: 300 },       // 5 นาที
  "copper_block": { tier: 3, seconds: 360 },       // 6 นาที
  "lightning_rod": { tier: 3, seconds: 360 },      // 6 นาที
  "spyglass": { tier: 3, seconds: 480 },           // 8 นาที
  "raw_gold": { tier: 3, seconds: 360 },           // 6 นาที
  "gold_ingot": { tier: 3, seconds: 390 },         // 6 นาที 30 วินาที
  "gold_nugget": { tier: 3, seconds: 360 },        // 6 นาที
  "gold_block": { tier: 3, seconds: 540 },         // 9 นาที
  "golden_sword": { tier: 3, seconds: 390 },       // 6 นาที 30 วินาที
  "golden_pickaxe": { tier: 3, seconds: 390 },     // 6 นาที 30 วินาที
  "golden_helmet": { tier: 3, seconds: 420 },      // 7 นาที
  "golden_chestplate": { tier: 3, seconds: 480 },  // 8 นาที
  "redstone": { tier: 3, seconds: 360 },           // 6 นาที
  "redstone_torch": { tier: 3, seconds: 360 },     // 6 นาที
  "redstone_block": { tier: 3, seconds: 420 },     // 7 นาที
  "lever": { tier: 3, seconds: 300 },              // 5 นาที
  "tripwire_hook": { tier: 3, seconds: 330 },      // 5 นาที 30 วินาที
  "lapis_lazuli": { tier: 3, seconds: 360 },       // 6 นาที
  "lapis_block": { tier: 3, seconds: 420 },        // 7 นาที
  "amethyst_shard": { tier: 3, seconds: 420 },     // 7 นาที
  "amethyst_block": { tier: 3, seconds: 480 },     // 8 นาที
  "calcite": { tier: 3, seconds: 360 },            // 6 นาที
  "deepslate": { tier: 3, seconds: 300 },          // 5 นาที
  "cobbled_deepslate": { tier: 3, seconds: 300 },  // 5 นาที
  "polished_deepslate": { tier: 3, seconds: 330 }, // 5 นาที 30 วินาที
  "deepslate_bricks": { tier: 3, seconds: 360 },   // 6 นาที
  "tuff": { tier: 3, seconds: 300 },              // 5 นาที
  "dripstone_block": { tier: 3, seconds: 360 },    // 6 นาที
  "pointed_dripstone": { tier: 3, seconds: 360 },  // 6 นาที
  "pumpkin": { tier: 3, seconds: 330 },            // 5 นาที 30 วินาที
  "carved_pumpkin": { tier: 3, seconds: 360 },     // 6 นาที
  "jack_o_lantern": { tier: 3, seconds: 390 },     // 6 นาที 30 วินาที
  "melon_slice": { tier: 3, seconds: 330 },        // 5 นาที 30 วินาที
  "baked_potato": { tier: 3, seconds: 300 },       // 5 นาที
  "beetroot_soup": { tier: 3, seconds: 360 },      // 6 นาที
  "cocoa_beans": { tier: 3, seconds: 420 },        // 7 นาที
  "fishing_rod": { tier: 3, seconds: 330 },        // 5 นาที 30 วินาที
  "cooked_cod": { tier: 3, seconds: 360 },         // 6 นาที
  "cooked_salmon": { tier: 3, seconds: 360 },      // 6 นาที
  "cauldron": { tier: 3, seconds: 420 },           // 7 นาที
  "hopper": { tier: 3, seconds: 480 },             // 8 นาที
  "anvil": { tier: 3, seconds: 600 },              // 10 นาที (31 เหล็ก)
  "minecart": { tier: 3, seconds: 360 },           // 6 นาที
  "rail": { tier: 3, seconds: 360 },               // 6 นาที
  "stonecutter": { tier: 3, seconds: 300 },        // 5 นาที
  "grindstone": { tier: 3, seconds: 330 },         // 5 นาที 30 วินาที
  "smithing_table": { tier: 3, seconds: 330 },     // 5 นาที 30 วินาที
  "cartography_table": { tier: 3, seconds: 300 },  // 5 นาที
  "fletching_table": { tier: 3, seconds: 300 },    // 5 นาที
  "loom": { tier: 3, seconds: 300 },               // 5 นาที
  "lantern": { tier: 3, seconds: 330 },            // 5 นาที 30 วินาที
  "soul_lantern": { tier: 3, seconds: 420 },       // 7 นาที

  // === TIER 4: ยาก (Hard) -> หน่วยเป็น "นาที" (15 - 30 นาที) ===
  "diamond": { tier: 4, seconds: 900 },            // 15 นาที
  "diamond_block": { tier: 4, seconds: 1500 },     // 25 นาที
  "diamond_sword": { tier: 4, seconds: 960 },      // 16 นาที
  "diamond_pickaxe": { tier: 4, seconds: 1020 },   // 17 นาที
  "diamond_axe": { tier: 4, seconds: 1020 },       // 17 นาที
  "diamond_shovel": { tier: 4, seconds: 960 },     // 16 นาที
  "diamond_hoe": { tier: 4, seconds: 960 },        // 16 นาที
  "diamond_helmet": { tier: 4, seconds: 1200 },    // 20 นาที
  "diamond_chestplate": { tier: 4, seconds: 1500 },// 25 นาที
  "diamond_leggings": { tier: 4, seconds: 1380 },  // 23 นาที
  "diamond_boots": { tier: 4, seconds: 1200 },     // 20 นาที
  "emerald": { tier: 4, seconds: 900 },            // 15 นาที
  "emerald_block": { tier: 4, seconds: 1200 },     // 20 นาที
  "obsidian": { tier: 4, seconds: 900 },           // 15 นาที
  "lava_bucket": { tier: 4, seconds: 720 },        // 12 นาที
  "clock": { tier: 4, seconds: 780 },              // 13 นาที
  "compass": { tier: 4, seconds: 720 },            // 12 นาที
  "golden_apple": { tier: 4, seconds: 1080 },      // 18 นาที
  "golden_carrot": { tier: 4, seconds: 900 },      // 15 นาที
  "glistering_melon_slice": { tier: 4, seconds: 900 }, // 15 นาที
  "cake": { tier: 4, seconds: 1080 },              // 18 นาที
  "pumpkin_pie": { tier: 4, seconds: 900 },        // 15 นาที
  "cookie": { tier: 4, seconds: 780 },             // 13 นาที
  "honeycomb": { tier: 4, seconds: 960 },          // 16 นาที
  "honey_bottle": { tier: 4, seconds: 960 },       // 16 นาที
  "honey_block": { tier: 4, seconds: 1140 },       // 19 นาที
  "beehive": { tier: 4, seconds: 1020 },           // 17 นาที
  "slime_ball": { tier: 4, seconds: 1080 },        // 18 นาที
  "slime_block": { tier: 4, seconds: 1260 },       // 21 นาที
  "piston": { tier: 4, seconds: 780 },             // 13 นาที
  "sticky_piston": { tier: 4, seconds: 1140 },     // 19 นาที
  "dispenser": { tier: 4, seconds: 840 },          // 14 นาที
  "dropper": { tier: 4, seconds: 780 },            // 13 นาที
  "observer": { tier: 4, seconds: 840 },           // 14 นาที
  "repeater": { tier: 4, seconds: 780 },           // 13 นาที
  "comparator": { tier: 4, seconds: 900 },         // 15 นาที
  "daylight_detector": { tier: 4, seconds: 900 },  // 15 นาที
  "gunpowder": { tier: 4, seconds: 840 },          // 14 นาที
  "tnt": { tier: 4, seconds: 960 },                // 16 นาที
  "rabbit_hide": { tier: 4, seconds: 900 },        // 15 นาที
  "rabbit_foot": { tier: 4, seconds: 1080 },       // 18 นาที
  "ink_sac": { tier: 4, seconds: 780 },            // 13 นาที
  "glow_ink_sac": { tier: 4, seconds: 900 },       // 15 นาที
  "saddle": { tier: 4, seconds: 1200 },            // 20 นาที
  "name_tag": { tier: 4, seconds: 1200 },          // 20 นาที
  "lead": { tier: 4, seconds: 1140 },              // 19 นาที
  "scute": { tier: 4, seconds: 1500 },             // 25 นาที
  "turtle_helmet": { tier: 4, seconds: 1500 },     // 25 นาที
  "target": { tier: 4, seconds: 780 },             // 13 นาที
  "lectern": { tier: 4, seconds: 780 },            // 13 นาที
  "enchanting_table": { tier: 4, seconds: 1200 },  // 20 นาที
  "brewing_stand": { tier: 4, seconds: 1200 },     // 20 นาที
  "fermented_spider_eye": { tier: 4, seconds: 840 },// 14 นาที

  // === TIER 5: ยากมาก (Extreme/Hardcore) -> หน่วยเป็น "ชั่วโมง!" (1 - 2 ชั่วโมง) ===
  "netherrack": { tier: 5, seconds: 3600 },        // 1 ชั่วโมง
  "quartz": { tier: 5, seconds: 3600 },            // 1 ชั่วโมง
  "nether_quartz_ore": { tier: 5, seconds: 3600 }, // 1 ชั่วโมง
  "soul_sand": { tier: 5, seconds: 3600 },         // 1 ชั่วโมง
  "soul_soil": { tier: 5, seconds: 3600 },         // 1 ชั่วโมง
  "basalt": { tier: 5, seconds: 3600 },            // 1 ชั่วโมง
  "blackstone": { tier: 5, seconds: 3600 },        // 1 ชั่วโมง
  "polished_blackstone": { tier: 5, seconds: 3600 },// 1 ชั่วโมง
  "glowstone": { tier: 5, seconds: 3600 },         // 1 ชั่วโมง
  "glowstone_dust": { tier: 5, seconds: 3600 },    // 1 ชั่วโมง
  "magma_block": { tier: 5, seconds: 3600 },       // 1 ชั่วโมง
  "magma_cream": { tier: 5, seconds: 4200 },       // 1 ชั่วโมง 10 นาที
  "blaze_rod": { tier: 5, seconds: 4500 },         // 1 ชั่วโมง 15 นาที
  "blaze_powder": { tier: 5, seconds: 4500 },      // 1 ชั่วโมง 15 นาที
  "nether_wart": { tier: 5, seconds: 4500 },       // 1 ชั่วโมง 15 นาที
  "ghast_tear": { tier: 5, seconds: 4800 },        // 1 ชั่วโมง 20 นาที
  "ender_pearl": { tier: 5, seconds: 4200 },       // 1 ชั่วโมง 10 นาที
  "ender_eye": { tier: 5, seconds: 4800 },         // 1 ชั่วโมง 20 นาที
  "crying_obsidian": { tier: 5, seconds: 4200 },   // 1 ชั่วโมง 10 นาที
  "respawn_anchor": { tier: 5, seconds: 4800 },    // 1 ชั่วโมง 20 นาที
  "ancient_debris": { tier: 5, seconds: 5400 },    // 1 ชั่วโมง 30 นาที
  "netherite_scrap": { tier: 5, seconds: 5400 },   // 1 ชั่วโมง 30 นาที
  "netherite_ingot": { tier: 5, seconds: 6000 },   // 1 ชั่วโมง 40 นาที
  "netherite_sword": { tier: 5, seconds: 6300 },   // 1 ชั่วโมง 45 นาที
  "netherite_pickaxe": { tier: 5, seconds: 6300 }, // 1 ชั่วโมง 45 นาที
  "netherite_helmet": { tier: 5, seconds: 6600 },  // 1 ชั่วโมง 50 นาที
  "netherite_chestplate": { tier: 5, seconds: 7200 }, // 2 ชั่วโมง
  "lodestone": { tier: 5, seconds: 6000 },         // 1 ชั่วโมง 40 นาที
  "prismarine": { tier: 5, seconds: 4200 },        // 1 ชั่วโมง 10 นาที
  "prismarine_shard": { tier: 5, seconds: 4200 },  // 1 ชั่วโมง 10 นาที
  "prismarine_crystals": { tier: 5, seconds: 4500 },// 1 ชั่วโมง 15 นาที
  "sea_lantern": { tier: 5, seconds: 4800 },       // 1 ชั่วโมง 20 นาที
  "sponge": { tier: 5, seconds: 5400 },            // 1 ชั่วโมง 30 นาที
  "wet_sponge": { tier: 5, seconds: 5400 },        // 1 ชั่วโมง 30 นาที
  "nautilus_shell": { tier: 5, seconds: 4200 },    // 1 ชั่วโมง 10 นาที
  "heart_of_the_sea": { tier: 5, seconds: 4800 },  // 1 ชั่วโมง 20 นาที
  "conduit": { tier: 5, seconds: 5400 },           // 1 ชั่วโมง 30 นาที
  "trident": { tier: 5, seconds: 5400 },           // 1 ชั่วโมง 30 นาที
  "totem_of_undying": { tier: 5, seconds: 6000 },  // 1 ชั่วโมง 40 นาที
  "phantom_membrane": { tier: 5, seconds: 3600 },  // 1 ชั่วโมง
  "shulker_shell": { tier: 5, seconds: 6000 },     // 1 ชั่วโมง 40 นาที
  "shulker_box": { tier: 5, seconds: 6300 },       // 1 ชั่วโมง 45 นาที
  "chorus_fruit": { tier: 5, seconds: 5400 },      // 1 ชั่วโมง 30 นาที
  "end_stone": { tier: 5, seconds: 5400 },         // 1 ชั่วโมง 30 นาที
  "purpur_block": { tier: 5, seconds: 5400 },      // 1 ชั่วโมง 30 นาที
  "elytra": { tier: 5, seconds: 7200 },            // 2 ชั่วโมง
  "trial_key": { tier: 5, seconds: 3900 },         // 1 ชั่วโมง 5 นาที
  "ominous_trial_key": { tier: 5, seconds: 4800 }, // 1 ชั่วโมง 20 นาที
  "ominous_bottle": { tier: 5, seconds: 4200 },    // 1 ชั่วโมง 10 นาที
  "breeze_rod": { tier: 5, seconds: 4500 },        // 1 ชั่วโมง 15 นาที
  "wind_charge": { tier: 5, seconds: 4500 },       // 1 ชั่วโมง 15 นาที
  "mace": { tier: 5, seconds: 7200 },              // 2 ชั่วโมง
  "heavy_core": { tier: 5, seconds: 6600 },        // 1 ชั่วโมง 50 นาที
  "sculk": { tier: 5, seconds: 3900 },             // 1 ชั่วโมง 5 นาที
  "sculk_catalyst": { tier: 5, seconds: 4800 },    // 1 ชั่วโมง 20 นาที
  "sculk_sensor": { tier: 5, seconds: 4200 },      // 1 ชั่วโมง 10 นาที
  "sculk_shrieker": { tier: 5, seconds: 4800 },    // 1 ชั่วโมง 20 นาที
  "echo_shard": { tier: 5, seconds: 5400 },        // 1 ชั่วโมง 30 นาที
  "wither_skeleton_skull": { tier: 5, seconds: 5400 }, // 1 ชั่วโมง 30 นาที
  "nether_star": { tier: 5, seconds: 7200 },       // 2 ชั่วโมง
  "beacon": { tier: 5, seconds: 7200 },            // 2 ชั่วโมง
};

// Heuristic fallback classifier
export function getItemDifficulty(itemId) {
  const shortId = (itemId || "").replace("minecraft:", "").toLowerCase();

  // 1. Exact match
  if (EXACT_ITEMS[shortId]) {
    const e = EXACT_ITEMS[shortId];
    const info = TIERS[e.tier];
    const sec = e.seconds || info.defaultSeconds;
    return {
      tier: e.tier,
      tierName: info.tierName,
      enName: info.enName,
      color: info.color,
      seconds: sec,
      timeText: formatDurationTh(sec),
      timeTextEn: formatDurationEn(sec),
      unitName: info.defaultUnit,
      unitNameEn: info.defaultUnitEn,
    };
  }

  // 2. Tier 5 Keywords: Nether, End, Rare boss/chambers -> ชั่วโมง (3600s = 1 ชั่วโมง)
  if (
    shortId.includes("netherite") ||
    shortId.includes("shulker") ||
    shortId.includes("elytra") ||
    shortId.includes("chorus") ||
    shortId.includes("purpur") ||
    shortId.includes("dragon") ||
    shortId.includes("wither") ||
    shortId.includes("sculk") ||
    shortId.includes("echo_shard") ||
    shortId.includes("totem") ||
    shortId.includes("trident") ||
    shortId.includes("breeze") ||
    shortId.includes("heavy_core") ||
    shortId.includes("mace") ||
    shortId.includes("trial_key") ||
    shortId.includes("ominous") ||
    shortId.includes("conduit") ||
    shortId.includes("sponge") ||
    shortId.includes("prismarine") ||
    shortId.includes("sea_lantern") ||
    shortId.includes("blaze") ||
    shortId.includes("ghast") ||
    shortId.includes("nether_wart") ||
    shortId.includes("nether_brick") ||
    shortId.includes("netherrack") ||
    shortId.includes("quartz") ||
    shortId.includes("soul_sand") ||
    shortId.includes("soul_soil") ||
    shortId.includes("blackstone") ||
    shortId.includes("crying_obsidian") ||
    shortId.includes("respawn_anchor") ||
    shortId.includes("lodestone") ||
    shortId.includes("nautilus") ||
    shortId.includes("end_stone") ||
    shortId.includes("ender") ||
    shortId.includes("potion")
  ) {
    const info = TIERS[5];
    const sec = 3600; // 1 ชั่วโมง
    return {
      tier: 5,
      tierName: info.tierName,
      enName: info.enName,
      color: info.color,
      seconds: sec,
      timeText: formatDurationTh(sec),
      timeTextEn: formatDurationEn(sec),
      unitName: info.defaultUnit,
      unitNameEn: info.defaultUnitEn,
    };
  }

  // 3. Tier 4 Keywords: Diamond, Complex crafts, Slime, Honey -> นาที (15 - 20 นาที)
  if (
    shortId.includes("diamond") ||
    shortId.includes("obsidian") ||
    shortId.includes("honey") ||
    shortId.includes("slime") ||
    shortId.includes("piston") ||
    shortId.includes("observer") ||
    shortId.includes("dispenser") ||
    shortId.includes("dropper") ||
    shortId.includes("comparator") ||
    shortId.includes("repeater") ||
    shortId.includes("daylight") ||
    shortId.includes("gunpowder") ||
    shortId.includes("tnt") ||
    shortId.includes("firework") ||
    shortId.includes("emerald") ||
    shortId.includes("enchanting") ||
    shortId.includes("brewing") ||
    shortId.includes("scute") ||
    shortId.includes("turtle") ||
    shortId.includes("cake") ||
    shortId.includes("golden_apple") ||
    shortId.includes("golden_carrot") ||
    shortId.includes("glistering") ||
    shortId.includes("pie") ||
    shortId.includes("cookie") ||
    shortId.includes("rabbit_") ||
    shortId.includes("ink_sac") ||
    shortId.includes("saddle") ||
    shortId.includes("name_tag") ||
    shortId.includes("lead")
  ) {
    const info = TIERS[4];
    const sec = 1200; // 20 นาที
    return {
      tier: 4,
      tierName: info.tierName,
      enName: info.enName,
      color: info.color,
      seconds: sec,
      timeText: formatDurationTh(sec),
      timeTextEn: formatDurationEn(sec),
      unitName: info.defaultUnit,
      unitNameEn: info.defaultUnitEn,
    };
  }

  // 4. Tier 3 Keywords: Iron, Gold, Redstone, Amethyst, Deepslate -> นาที (5 - 8 นาที)
  if (
    shortId.includes("iron_") ||
    shortId.includes("copper_") ||
    shortId.includes("gold_") ||
    shortId.includes("golden_") ||
    shortId.includes("redstone") ||
    shortId.includes("lapis") ||
    shortId.includes("amethyst") ||
    shortId.includes("deepslate") ||
    shortId.includes("calcite") ||
    shortId.includes("dripstone") ||
    shortId.includes("tuff") ||
    shortId.includes("bucket") ||
    shortId.includes("shield") ||
    shortId.includes("bow") ||
    shortId.includes("arrow") ||
    shortId.includes("cauldron") ||
    shortId.includes("hopper") ||
    shortId.includes("anvil") ||
    shortId.includes("minecart") ||
    shortId.includes("rail") ||
    shortId.includes("pumpkin") ||
    shortId.includes("melon") ||
    shortId.includes("cocoa") ||
    shortId.includes("fishing_rod") ||
    shortId.includes("lantern") ||
    shortId.includes("chain") ||
    shortId.includes("bell")
  ) {
    const info = TIERS[3];
    const sec = 420; // 7 นาที
    return {
      tier: 3,
      tierName: info.tierName,
      enName: info.enName,
      color: info.color,
      seconds: sec,
      timeText: formatDurationTh(sec),
      timeTextEn: formatDurationEn(sec),
      unitName: info.defaultUnit,
      unitNameEn: info.defaultUnitEn,
    };
  }

  // 5. Tier 2 Keywords: Coal, Basic Food, Wood Crafts, Wool, Glass -> นาที (2 - 3 นาที)
  if (
    shortId.includes("coal") ||
    shortId.includes("charcoal") ||
    shortId.includes("furnace") ||
    shortId.includes("smoker") ||
    shortId.includes("chest") ||
    shortId.includes("barrel") ||
    shortId.includes("door") ||
    shortId.includes("trapdoor") ||
    shortId.includes("fence") ||
    shortId.includes("gate") ||
    shortId.includes("sign") ||
    shortId.includes("wool") ||
    shortId.includes("carpet") ||
    shortId.includes("bed") ||
    shortId.includes("cooked_") ||
    shortId.includes("_cooked") ||
    shortId.includes("beef") ||
    shortId.includes("pork") ||
    shortId.includes("mutton") ||
    shortId.includes("chicken") ||
    shortId.includes("fish") ||
    shortId.includes("salmon") ||
    shortId.includes("cod") ||
    shortId.includes("bread") ||
    shortId.includes("wheat") ||
    shortId.includes("carrot") ||
    shortId.includes("potato") ||
    shortId.includes("beetroot") ||
    shortId.includes("apple") ||
    shortId.includes("bone") ||
    shortId.includes("string") ||
    shortId.includes("spider") ||
    shortId.includes("leather") ||
    shortId.includes("paper") ||
    shortId.includes("book") ||
    shortId.includes("glass") ||
    shortId.includes("brick") ||
    shortId.includes("stone_") ||
    shortId.includes("terracotta") ||
    shortId.includes("concrete") ||
    shortId.includes("glazed") ||
    shortId.includes("banner")
  ) {
    const info = TIERS[2];
    const sec = 150; // 2 นาที 30 วินาที
    return {
      tier: 2,
      tierName: info.tierName,
      enName: info.enName,
      color: info.color,
      seconds: sec,
      timeText: formatDurationTh(sec),
      timeTextEn: formatDurationEn(sec),
      unitName: info.defaultUnit,
      unitNameEn: info.defaultUnitEn,
    };
  }

  // 6. Tier 1 Default: Dirt, Stone, Wood, Seeds, Plants, Flowers -> วินาที (60 วินาที)
  const info = TIERS[1];
  const sec = 60; // 60 วินาที
  return {
    tier: 1,
    tierName: info.tierName,
    enName: info.enName,
    color: info.color,
    seconds: sec,
    timeText: formatDurationTh(sec),
    unitName: info.defaultUnit,
  };
}
'''

with open('extracted_roulette/scripts/item_difficulty.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('Generated updated extracted_roulette/scripts/item_difficulty.js successfully!')
