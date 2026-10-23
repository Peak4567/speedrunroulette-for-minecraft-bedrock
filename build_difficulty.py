# Updated build_difficulty.py
# Balanced survival countdown times:
# 1. Very Easy: Seconds (45 - 90 seconds)
# 2. Easy / Medium: Minutes (2 - 10 minutes)
# 3. Hard: Minutes (15 - 30 minutes)
# 4. Extreme: Hours (1 - 2 hours)

code = '''// Item Difficulty & Countdown Duration for Speedrun Roulette
// Analyzed specifically for Minecraft Bedrock Survival Speedrunning

export const TIERS = {
  1: { tier: 1, tierName: "Very Easy", thName: "ง่ายมากๆ", enName: "Very Easy", color: "§a", defaultSeconds: 60, defaultUnit: "seconds", defaultUnitEn: "seconds", defaultUnitTh: "วินาที" },
  2: { tier: 2, tierName: "Easy", thName: "ง่าย", enName: "Easy", color: "§2", defaultSeconds: 150, defaultUnit: "minutes", defaultUnitEn: "minutes", defaultUnitTh: "นาที" },
  3: { tier: 3, tierName: "Medium", thName: "ปานกลาง", enName: "Medium", color: "§e", defaultSeconds: 420, defaultUnit: "minutes", defaultUnitEn: "minutes", defaultUnitTh: "นาที" },
  4: { tier: 4, tierName: "Hard", thName: "ยาก", enName: "Hard", color: "§6", defaultSeconds: 1200, defaultUnit: "minutes", defaultUnitEn: "minutes", defaultUnitTh: "นาที" },
  5: { tier: 5, tierName: "Extreme", thName: "ยากมาก", enName: "Extreme", color: "§c", defaultSeconds: 3600, defaultUnit: "hours", defaultUnitEn: "hours", defaultUnitTh: "ชั่วโมง" },
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
  // === TIER 1: Very Easy -> Seconds (45 - 90 seconds) ===
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

  // === TIER 2: Easy -> Minutes (2 - 4 minutes) ===
  "coal": { tier: 2, seconds: 120 },               // 2 mins
  "charcoal": { tier: 2, seconds: 120 },           // 2 mins
  "coal_block": { tier: 2, seconds: 150 },         // 2 mins 30 secs
  "coal_ore": { tier: 2, seconds: 120 },           // 2 mins
  "raw_iron": { tier: 2, seconds: 150 },           // 2 mins 30 secs
  "raw_copper": { tier: 2, seconds: 150 },         // 2 mins 30 secs
  "furnace": { tier: 2, seconds: 120 },            // 2 mins
  "smoker": { tier: 2, seconds: 150 },             // 2 mins 30 secs
  "blast_furnace": { tier: 2, seconds: 180 },      // 3 mins
  "stone_sword": { tier: 2, seconds: 120 },        // 2 mins
  "stone_pickaxe": { tier: 2, seconds: 120 },      // 2 mins
  "stone_axe": { tier: 2, seconds: 120 },          // 2 mins
  "stone_shovel": { tier: 2, seconds: 120 },       // 2 mins
  "stone_hoe": { tier: 2, seconds: 120 },          // 2 mins
  "chest": { tier: 2, seconds: 120 },              // 2 mins
  "barrel": { tier: 2, seconds: 150 },             // 2 mins 30 secs
  "trapped_chest": { tier: 2, seconds: 180 },      // 3 mins
  "ladder": { tier: 2, seconds: 120 },             // 2 mins
  "white_wool": { tier: 2, seconds: 120 },         // 2 mins
  "black_wool": { tier: 2, seconds: 150 },         // 2 mins 30 secs
  "red_wool": { tier: 2, seconds: 150 },           // 2 mins 30 secs
  "raw_beef": { tier: 2, seconds: 120 },           // 2 mins
  "cooked_beef": { tier: 2, seconds: 150 },        // 2 mins 30 secs
  "beef_cooked": { tier: 2, seconds: 150 },        // 2 mins 30 secs
  "raw_porkchop": { tier: 2, seconds: 120 },       // 2 mins
  "cooked_porkchop": { tier: 2, seconds: 150 },    // 2 mins 30 secs
  "porkchop_cooked": { tier: 2, seconds: 150 },    // 2 mins 30 secs
  "raw_mutton": { tier: 2, seconds: 120 },         // 2 mins
  "cooked_mutton": { tier: 2, seconds: 150 },      // 2 mins 30 secs
  "mutton_cooked": { tier: 2, seconds: 150 },      // 2 mins 30 secs
  "cooked_chicken": { tier: 2, seconds: 150 },     // 2 mins 30 secs
  "chicken_cooked": { tier: 2, seconds: 150 },     // 2 mins 30 secs
  "wheat": { tier: 2, seconds: 150 },              // 2 mins 30 secs
  "bread": { tier: 2, seconds: 150 },              // 2 mins 30 secs
  "apple": { tier: 2, seconds: 180 },              // 3 mins
  "bone": { tier: 2, seconds: 150 },               // 2 mins 30 secs
  "bone_meal": { tier: 2, seconds: 150 },          // 2 mins 30 secs
  "bone_block": { tier: 2, seconds: 180 },         // 3 mins
  "string": { tier: 2, seconds: 150 },             // 2 mins 30 secs
  "spider_eye": { tier: 2, seconds: 180 },         // 3 mins
  "paper": { tier: 2, seconds: 150 },              // 2 mins 30 secs
  "book": { tier: 2, seconds: 210 },               // 3 mins 30 secs
  "leather": { tier: 2, seconds: 180 },            // 3 mins
  "glass": { tier: 2, seconds: 150 },              // 2 mins 30 secs
  "glass_bottle": { tier: 2, seconds: 180 },       // 3 mins
  "brick": { tier: 2, seconds: 180 },              // 3 mins
  "bricks": { tier: 2, seconds: 210 },             // 3 mins 30 secs
  "campfire": { tier: 2, seconds: 150 },           // 2 mins 30 secs
  "carrot": { tier: 2, seconds: 180 },             // 3 mins
  "potato": { tier: 2, seconds: 180 },             // 3 mins
  "beetroot": { tier: 2, seconds: 180 },           // 3 mins
  "snowball": { tier: 2, seconds: 120 },           // 2 mins
  "snow_block": { tier: 2, seconds: 150 },         // 2 mins 30 secs
  "bowl": { tier: 2, seconds: 120 },               // 2 mins
  "flower_pot": { tier: 2, seconds: 180 },         // 3 mins

  // === TIER 3: Medium -> Minutes (5 - 10 minutes) ===
  "iron_ingot": { tier: 3, seconds: 300 },         // 5 mins
  "iron_block": { tier: 3, seconds: 480 },         // 8 mins
  "raw_iron_block": { tier: 3, seconds: 420 },     // 7 mins
  "iron_sword": { tier: 3, seconds: 300 },         // 5 mins
  "iron_pickaxe": { tier: 3, seconds: 330 },       // 5 mins 30 secs
  "iron_axe": { tier: 3, seconds: 330 },           // 5 mins 30 secs
  "iron_shovel": { tier: 3, seconds: 300 },        // 5 mins
  "iron_hoe": { tier: 3, seconds: 300 },           // 5 mins
  "iron_helmet": { tier: 3, seconds: 360 },        // 6 mins
  "iron_chestplate": { tier: 3, seconds: 420 },    // 7 mins
  "iron_leggings": { tier: 3, seconds: 390 },      // 6 mins 30 secs
  "iron_boots": { tier: 3, seconds: 360 },         // 6 mins
  "bucket": { tier: 3, seconds: 300 },             // 5 mins
  "water_bucket": { tier: 3, seconds: 330 },       // 5 mins 30 secs
  "milk_bucket": { tier: 3, seconds: 360 },        // 6 mins
  "shears": { tier: 3, seconds: 300 },             // 5 mins
  "flint_and_steel": { tier: 3, seconds: 300 },    // 5 mins
  "shield": { tier: 3, seconds: 300 },             // 5 mins
  "bow": { tier: 3, seconds: 360 },                // 6 mins
  "arrow": { tier: 3, seconds: 330 },              // 5 mins 30 secs
  "crossbow": { tier: 3, seconds: 420 },           // 7 mins
  "copper_ingot": { tier: 3, seconds: 300 },       // 5 mins
  "copper_block": { tier: 3, seconds: 360 },       // 6 mins
  "lightning_rod": { tier: 3, seconds: 360 },      // 6 mins
  "spyglass": { tier: 3, seconds: 480 },           // 8 mins
  "raw_gold": { tier: 3, seconds: 360 },           // 6 mins
  "gold_ingot": { tier: 3, seconds: 390 },         // 6 mins 30 secs
  "gold_nugget": { tier: 3, seconds: 360 },        // 6 mins
  "gold_block": { tier: 3, seconds: 540 },         // 9 mins
  "golden_sword": { tier: 3, seconds: 390 },       // 6 mins 30 secs
  "golden_pickaxe": { tier: 3, seconds: 390 },     // 6 mins 30 secs
  "golden_helmet": { tier: 3, seconds: 420 },      // 7 mins
  "golden_chestplate": { tier: 3, seconds: 480 },  // 8 mins
  "redstone": { tier: 3, seconds: 360 },           // 6 mins
  "redstone_torch": { tier: 3, seconds: 360 },     // 6 mins
  "redstone_block": { tier: 3, seconds: 420 },     // 7 mins
  "lever": { tier: 3, seconds: 300 },              // 5 mins
  "tripwire_hook": { tier: 3, seconds: 330 },      // 5 mins 30 secs
  "lapis_lazuli": { tier: 3, seconds: 360 },       // 6 mins
  "lapis_block": { tier: 3, seconds: 420 },        // 7 mins
  "amethyst_shard": { tier: 3, seconds: 420 },     // 7 mins
  "amethyst_block": { tier: 3, seconds: 480 },     // 8 mins
  "calcite": { tier: 3, seconds: 360 },            // 6 mins
  "deepslate": { tier: 3, seconds: 300 },          // 5 mins
  "cobbled_deepslate": { tier: 3, seconds: 300 },  // 5 mins
  "polished_deepslate": { tier: 3, seconds: 330 }, // 5 mins 30 secs
  "deepslate_bricks": { tier: 3, seconds: 360 },   // 6 mins
  "tuff": { tier: 3, seconds: 300 },              // 5 mins
  "dripstone_block": { tier: 3, seconds: 360 },    // 6 mins
  "pointed_dripstone": { tier: 3, seconds: 360 },  // 6 mins
  "pumpkin": { tier: 3, seconds: 330 },            // 5 mins 30 secs
  "carved_pumpkin": { tier: 3, seconds: 360 },     // 6 mins
  "jack_o_lantern": { tier: 3, seconds: 390 },     // 6 mins 30 secs
  "melon_slice": { tier: 3, seconds: 330 },        // 5 mins 30 secs
  "baked_potato": { tier: 3, seconds: 300 },       // 5 mins
  "beetroot_soup": { tier: 3, seconds: 360 },      // 6 mins
  "cocoa_beans": { tier: 3, seconds: 420 },        // 7 mins
  "fishing_rod": { tier: 3, seconds: 330 },        // 5 mins 30 secs
  "cooked_cod": { tier: 3, seconds: 360 },         // 6 mins
  "cooked_salmon": { tier: 3, seconds: 360 },      // 6 mins
  "cauldron": { tier: 3, seconds: 420 },           // 7 mins
  "hopper": { tier: 3, seconds: 480 },             // 8 mins
  "anvil": { tier: 3, seconds: 600 },              // 10 mins (31 iron)
  "minecart": { tier: 3, seconds: 360 },           // 6 mins
  "rail": { tier: 3, seconds: 360 },               // 6 mins
  "stonecutter": { tier: 3, seconds: 300 },        // 5 mins
  "grindstone": { tier: 3, seconds: 330 },         // 5 mins 30 secs
  "smithing_table": { tier: 3, seconds: 330 },     // 5 mins 30 secs
  "cartography_table": { tier: 3, seconds: 300 },  // 5 mins
  "fletching_table": { tier: 3, seconds: 300 },    // 5 mins
  "loom": { tier: 3, seconds: 300 },               // 5 mins
  "lantern": { tier: 3, seconds: 330 },            // 5 mins 30 secs
  "soul_lantern": { tier: 3, seconds: 420 },       // 7 mins

  // === TIER 4: Hard -> Minutes (15 - 30 minutes) ===
  "diamond": { tier: 4, seconds: 900 },            // 15 mins
  "diamond_block": { tier: 4, seconds: 1500 },     // 25 mins
  "diamond_sword": { tier: 4, seconds: 960 },      // 16 mins
  "diamond_pickaxe": { tier: 4, seconds: 1020 },   // 17 mins
  "diamond_axe": { tier: 4, seconds: 1020 },       // 17 mins
  "diamond_shovel": { tier: 4, seconds: 960 },     // 16 mins
  "diamond_hoe": { tier: 4, seconds: 960 },        // 16 mins
  "diamond_helmet": { tier: 4, seconds: 1200 },    // 20 mins
  "diamond_chestplate": { tier: 4, seconds: 1500 },// 25 mins
  "diamond_leggings": { tier: 4, seconds: 1380 },  // 23 mins
  "diamond_boots": { tier: 4, seconds: 1200 },     // 20 mins
  "emerald": { tier: 4, seconds: 900 },            // 15 mins
  "emerald_block": { tier: 4, seconds: 1200 },     // 20 mins
  "obsidian": { tier: 4, seconds: 900 },           // 15 mins
  "lava_bucket": { tier: 4, seconds: 720 },        // 12 mins
  "clock": { tier: 4, seconds: 780 },              // 13 mins
  "compass": { tier: 4, seconds: 720 },            // 12 mins
  "golden_apple": { tier: 4, seconds: 1080 },      // 18 mins
  "golden_carrot": { tier: 4, seconds: 900 },      // 15 mins
  "glistering_melon_slice": { tier: 4, seconds: 900 }, // 15 mins
  "cake": { tier: 4, seconds: 1080 },              // 18 mins
  "pumpkin_pie": { tier: 4, seconds: 900 },        // 15 mins
  "cookie": { tier: 4, seconds: 780 },             // 13 mins
  "honeycomb": { tier: 4, seconds: 960 },          // 16 mins
  "honey_bottle": { tier: 4, seconds: 960 },       // 16 mins
  "honey_block": { tier: 4, seconds: 1140 },       // 19 mins
  "beehive": { tier: 4, seconds: 1020 },           // 17 mins
  "slime_ball": { tier: 4, seconds: 1080 },        // 18 mins
  "slime_block": { tier: 4, seconds: 1260 },       // 21 mins
  "piston": { tier: 4, seconds: 780 },             // 13 mins
  "sticky_piston": { tier: 4, seconds: 1140 },     // 19 mins
  "dispenser": { tier: 4, seconds: 840 },          // 14 mins
  "dropper": { tier: 4, seconds: 780 },            // 13 mins
  "observer": { tier: 4, seconds: 840 },           // 14 mins
  "repeater": { tier: 4, seconds: 780 },           // 13 mins
  "comparator": { tier: 4, seconds: 900 },         // 15 mins
  "daylight_detector": { tier: 4, seconds: 900 },  // 15 mins
  "gunpowder": { tier: 4, seconds: 840 },          // 14 mins
  "tnt": { tier: 4, seconds: 960 },                // 16 mins
  "rabbit_hide": { tier: 4, seconds: 900 },        // 15 mins
  "rabbit_foot": { tier: 4, seconds: 1080 },       // 18 mins
  "ink_sac": { tier: 4, seconds: 780 },            // 13 mins
  "glow_ink_sac": { tier: 4, seconds: 900 },       // 15 mins
  "saddle": { tier: 4, seconds: 1200 },            // 20 mins
  "name_tag": { tier: 4, seconds: 1200 },          // 20 mins
  "lead": { tier: 4, seconds: 1140 },              // 19 mins
  "scute": { tier: 4, seconds: 1500 },             // 25 mins
  "turtle_helmet": { tier: 4, seconds: 1500 },     // 25 mins
  "target": { tier: 4, seconds: 780 },             // 13 mins
  "lectern": { tier: 4, seconds: 780 },            // 13 mins
  "enchanting_table": { tier: 4, seconds: 1200 },  // 20 mins
  "brewing_stand": { tier: 4, seconds: 1200 },     // 20 mins
  "fermented_spider_eye": { tier: 4, seconds: 840 },// 14 mins

  // === TIER 5: Extreme -> Hours (1 - 2 hours) ===
  "netherrack": { tier: 5, seconds: 3600 },        // 1 hr
  "quartz": { tier: 5, seconds: 3600 },            // 1 hr
  "nether_quartz_ore": { tier: 5, seconds: 3600 }, // 1 hr
  "soul_sand": { tier: 5, seconds: 3600 },         // 1 hr
  "soul_soil": { tier: 5, seconds: 3600 },         // 1 hr
  "basalt": { tier: 5, seconds: 3600 },            // 1 hr
  "blackstone": { tier: 5, seconds: 3600 },        // 1 hr
  "polished_blackstone": { tier: 5, seconds: 3600 },// 1 hr
  "glowstone": { tier: 5, seconds: 3600 },         // 1 hr
  "glowstone_dust": { tier: 5, seconds: 3600 },    // 1 hr
  "magma_block": { tier: 5, seconds: 3600 },       // 1 hr
  "magma_cream": { tier: 5, seconds: 4200 },       // 1 hr 10 mins
  "blaze_rod": { tier: 5, seconds: 4500 },         // 1 hr 15 mins
  "blaze_powder": { tier: 5, seconds: 4500 },      // 1 hr 15 mins
  "nether_wart": { tier: 5, seconds: 4500 },       // 1 hr 15 mins
  "ghast_tear": { tier: 5, seconds: 4800 },        // 1 hr 20 mins
  "ender_pearl": { tier: 5, seconds: 4200 },       // 1 hr 10 mins
  "ender_eye": { tier: 5, seconds: 4800 },         // 1 hr 20 mins
  "crying_obsidian": { tier: 5, seconds: 4200 },   // 1 hr 10 mins
  "respawn_anchor": { tier: 5, seconds: 4800 },    // 1 hr 20 mins
  "ancient_debris": { tier: 5, seconds: 5400 },    // 1 hr 30 mins
  "netherite_scrap": { tier: 5, seconds: 5400 },   // 1 hr 30 mins
  "netherite_ingot": { tier: 5, seconds: 6000 },   // 1 hr 40 mins
  "netherite_sword": { tier: 5, seconds: 6300 },   // 1 hr 45 mins
  "netherite_pickaxe": { tier: 5, seconds: 6300 }, // 1 hr 45 mins
  "netherite_helmet": { tier: 5, seconds: 6600 },  // 1 hr 50 mins
  "netherite_chestplate": { tier: 5, seconds: 7200 }, // 2 hr
  "lodestone": { tier: 5, seconds: 6000 },         // 1 hr 40 mins
  "prismarine": { tier: 5, seconds: 4200 },        // 1 hr 10 mins
  "prismarine_shard": { tier: 5, seconds: 4200 },  // 1 hr 10 mins
  "prismarine_crystals": { tier: 5, seconds: 4500 },// 1 hr 15 mins
  "sea_lantern": { tier: 5, seconds: 4800 },       // 1 hr 20 mins
  "sponge": { tier: 5, seconds: 5400 },            // 1 hr 30 mins
  "wet_sponge": { tier: 5, seconds: 5400 },        // 1 hr 30 mins
  "nautilus_shell": { tier: 5, seconds: 4200 },    // 1 hr 10 mins
  "heart_of_the_sea": { tier: 5, seconds: 4800 },  // 1 hr 20 mins
  "conduit": { tier: 5, seconds: 5400 },           // 1 hr 30 mins
  "trident": { tier: 5, seconds: 5400 },           // 1 hr 30 mins
  "totem_of_undying": { tier: 5, seconds: 6000 },  // 1 hr 40 mins
  "phantom_membrane": { tier: 5, seconds: 3600 },  // 1 hr
  "shulker_shell": { tier: 5, seconds: 6000 },     // 1 hr 40 mins
  "shulker_box": { tier: 5, seconds: 6300 },       // 1 hr 45 mins
  "chorus_fruit": { tier: 5, seconds: 5400 },      // 1 hr 30 mins
  "end_stone": { tier: 5, seconds: 5400 },         // 1 hr 30 mins
  "purpur_block": { tier: 5, seconds: 5400 },      // 1 hr 30 mins
  "elytra": { tier: 5, seconds: 7200 },            // 2 hr
  "trial_key": { tier: 5, seconds: 3900 },         // 1 hr 5 mins
  "ominous_trial_key": { tier: 5, seconds: 4800 }, // 1 hr 20 mins
  "ominous_bottle": { tier: 5, seconds: 4200 },    // 1 hr 10 mins
  "breeze_rod": { tier: 5, seconds: 4500 },        // 1 hr 15 mins
  "wind_charge": { tier: 5, seconds: 4500 },       // 1 hr 15 mins
  "mace": { tier: 5, seconds: 7200 },              // 2 hr
  "heavy_core": { tier: 5, seconds: 6600 },        // 1 hr 50 mins
  "sculk": { tier: 5, seconds: 3900 },             // 1 hr 5 mins
  "sculk_catalyst": { tier: 5, seconds: 4800 },    // 1 hr 20 mins
  "sculk_sensor": { tier: 5, seconds: 4200 },      // 1 hr 10 mins
  "sculk_shrieker": { tier: 5, seconds: 4800 },    // 1 hr 20 mins
  "echo_shard": { tier: 5, seconds: 5400 },        // 1 hr 30 mins
  "wither_skeleton_skull": { tier: 5, seconds: 5400 }, // 1 hr 30 mins
  "nether_star": { tier: 5, seconds: 7200 },       // 2 hr
  "beacon": { tier: 5, seconds: 7200 },            // 2 hr
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

  // 2. Tier 5 Keywords: Nether, End, Rare boss/chambers -> Hours (3600s = 1 hr)
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
    const sec = 3600; // 1 hr
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

  // 3. Tier 4 Keywords: Diamond, Complex crafts, Slime, Honey -> Minutes (15 - 20 mins)
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
    const sec = 1200; // 20 mins
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

  // 4. Tier 3 Keywords: Iron, Gold, Redstone, Amethyst, Deepslate -> Minutes (5 - 8 mins)
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
    const sec = 420; // 7 mins
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

  // 5. Tier 2 Keywords: Coal, Basic Food, Wood Crafts, Wool, Glass -> Minutes (2 - 3 mins)
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
    const sec = 150; // 2 mins 30 secs
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

  // 6. Tier 1 Default: Dirt, Stone, Wood, Seeds, Plants, Flowers -> Seconds (60 secs)
  const info = TIERS[1];
  const sec = 60; // 60 secs
  return {
    tier: 1,
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
'''

with open('extracted_roulette/scripts/item_difficulty.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('Generated updated extracted_roulette/scripts/item_difficulty.js successfully!')
