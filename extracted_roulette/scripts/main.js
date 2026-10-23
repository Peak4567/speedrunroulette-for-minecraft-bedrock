import {
  world,
  system,
  ItemStack,
  ItemTypes,
  CommandPermissionLevel,
  CustomCommandParamType,
} from "@minecraft/server";
import {
  ActionFormData,
  ModalFormData,
  MessageFormData,
  FormCancelationReason,
} from "@minecraft/server-ui";
import { ITEM_GLYPHS } from "./item_glyphs.js";
import { getItemDifficulty, formatDurationTh, formatDurationEn, formatDuration, formatDigitalTime } from "./item_difficulty.js";

function getGlyph(id, shortId) {
  if (!shortId && id) shortId = id.replace("minecraft:", "");
  if (!id && shortId) id = `minecraft:${shortId}`;

  // 1. Direct match
  if (id && ITEM_GLYPHS[id]) return ITEM_GLYPHS[id];
  if (shortId && ITEM_GLYPHS[shortId]) return ITEM_GLYPHS[shortId];

  if (!shortId) return ITEM_GLYPHS["diamond"] || "★";

  // 2. Common prefix / suffix heuristics
  // Strip raw_ -> raw_beef -> beef
  if (shortId.startsWith("raw_")) {
    const base = shortId.slice(4);
    if (ITEM_GLYPHS[base]) return ITEM_GLYPHS[base];
    if (ITEM_GLYPHS[`minecraft:${base}`]) return ITEM_GLYPHS[`minecraft:${base}`];
  }

  // Bed colors -> white_bed -> bed
  if (shortId.endsWith("_bed") && ITEM_GLYPHS["bed"]) {
    return ITEM_GLYPHS["bed"];
  }

  // Stairs / Slabs / Fences / Walls / Gates / Doors
  const blockSuffixes = ["_stairs", "_slab", "_fence", "_fence_gate", "_wall", "_door", "_trapdoor", "_button", "_pressure_plate"];
  for (const suf of blockSuffixes) {
    if (shortId.endsWith(suf)) {
      const base = shortId.slice(0, -suf.length);
      if (ITEM_GLYPHS[`${base}_planks`]) return ITEM_GLYPHS[`${base}_planks`];
      if (ITEM_GLYPHS[`${base}_brick`]) return ITEM_GLYPHS[`${base}_brick`];
      if (ITEM_GLYPHS[`${base}_bricks`]) return ITEM_GLYPHS[`${base}_bricks`];
      if (ITEM_GLYPHS[base]) return ITEM_GLYPHS[base];
      if (ITEM_GLYPHS[`minecraft:${base}`]) return ITEM_GLYPHS[`minecraft:${base}`];
    }
  }

  // Stripped logs / wood
  if (shortId.startsWith("stripped_")) {
    const base = shortId.slice(9);
    if (ITEM_GLYPHS[base]) return ITEM_GLYPHS[base];
    if (ITEM_GLYPHS[`minecraft:${base}`]) return ITEM_GLYPHS[`minecraft:${base}`];
  }

  // Wood variants to log
  if (shortId.endsWith("_wood")) {
    const baseLog = shortId.replace("_wood", "_log");
    if (ITEM_GLYPHS[baseLog]) return ITEM_GLYPHS[baseLog];
  }

  // Block suffix: e.g. grass_block -> grass_carried
  if (shortId.endsWith("_block")) {
    const base = shortId.slice(0, -6);
    if (ITEM_GLYPHS[base]) return ITEM_GLYPHS[base];
  }

  // Guaranteed fallback to diamond or star, never return empty string or '?'
  return ITEM_GLYPHS["diamond"] || ITEM_GLYPHS["minecraft:diamond"] || "★";
}

// ---------------------------------------------------------------
// CONFIG & FILTERING
// Filters out technical / creative-only / Education Edition items
// ---------------------------------------------------------------
const EXCLUDE_KEYWORDS = [
  "chemistry", "compound", "element", "camera", "command_block",
  "structure_", "debug", "border_block", "barrier", "jigsaw",
  "light_block", "reserved", "invisible", "moving_block", "unknown",
  "spawn_egg", "bedrock", "allow", "deny", "client_request_placeholder",
  "the_client_side_ai_predicted", "underwater_tnt", "sea_pickle_air"
];

function prettifyName(shortId) {
  return shortId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------
// DIMENSION MODE & CLASSIFICATION
// ---------------------------------------------------------------


// ---------------------------------------------------------------
// LOCALIZATION (I18N) - ENGLISH (DEFAULT) & THAI
// ---------------------------------------------------------------
const I18N = {
  en: {
    mainTitle: "§6★ Speedrun Roulette Menu ★",
    welcome: "Welcome to the Speedrun Roulette Control Panel!",
    welcomeTitle: "§e★ Speedrun Roulette ★",
    welcomeSubtitle: "§aRight-click Compass or type !menu",
    welcomeBanner: "§6══════════════════════════════════════════\n" +
                   "§e★ Welcome to Speedrun Roulette! ★\n" +
                   "§fRace against friends or the clock to find randomized items!\n" +
                   "§7• Right-click your §eCompass §7or type §a!menu §7to open the Menu\n" +
                   "§7• Type §a!start §7to begin or §a!help §7for all commands\n" +
                   "§dCreated by Peak4567\n" +
                   "§6══════════════════════════════════════════",
    credits: "§dCreated by: §e§lPeak4567§r",
    statusLabel: "Status",
    statusIdle: "§7Idle",
    statusRunning: "§aRunning",
    statusPaused: "§cPAUSED",
    statusSpinning: "§eSpinning Gacha",
    statusCountdown: "§e3-2-1 Countdown",
    progressLabel: "Progress",
    targetItemLabel: "Target Objective",
    targetDimLabel: "Target Dimension",
    itemDiffLabel: "Item Difficulty",
    timerModeLabel: "Timer Mode",
    timeMultiplierLabel: "Time Multiplier",
    envLabel: "World Time / Mobs",
    suddenDeathLabel: "Sudden Death",
    suddenDeathOn: "§c💀 Enabled (Spectator on death)",
    suddenDeathOff: "§a🟢 Disabled (Normal respawn)",
    onlinePlayersLabel: "Online Players",
    selectCommandPrompt: "§7Select an action below:",
    noneYet: "None yet",
    roundStr: "Round",

    btnPause: "§c⏸ Pause Game",
    btnResume: "§a▶ Resume Game",
    btnStart: "§a▶ Start Game",
    btnSettings: "§6⚙ Game Settings",
    btnReroll: "§e🎲 Reroll Objective",
    btnStop: "§c⏹ Stop Current Round",
    btnLeaderboard: "§d🏆 Top 1-3 Leaderboard",
    btnResetAll: "§4🔄 Reset Game & Scores",
    btnClose: "§c❌ Close Menu",
    btnBack: "§c🔙 Back",
    btnBackMain: "§c🔙 Back to Main Menu",

    configTitle: "§6⚙ Speedrun Roulette Settings",
    configBodyIntro: "Customize match rules and options:\n",
    configPrompt: "§7Tap any option below to change:",
    btnDimSetting: "§3🌐 Target Dimension\n§7[{value}]",
    btnItemDiffSetting: "§a🎯 Item Difficulty\n§7[{value}]",
    btnModeToggle: "§e⏱ Toggle Timer Mode\n§7[{value}]",
    btnRoundsSetting: "§b🎯 Match Rounds\n§7[{value}]",
    btnMultiplierSetting: "§a⚡ Time Multiplier\n§7[{value}]",
    btnWorldTimeSetting: "§6☀️ World Time\n§7[{value}]",
    btnMobDiffSetting: "§d👾 Mob Difficulty\n§7[{value}]",
    btnSuddenDeathSetting: "§c💀 Sudden Death\n§7[{value}]",
    btnLanguageSetting: "§e🌐 Language\n§7[{value}]",

    dimTitle: "§6🌐 Select Target Dimension",
    dimBody: "§fCurrent Dimension: §b{current}\n\n" +
             "§7Players ALWAYS start in the Overworld and journey to the destination to find the objective:\n" +
             "§f• §aOverworld: §7Items found in the Overworld (Grass, Wood, Coal, Ores, Animals, Plants)\n" +
             "§f• §cNether: §7Start in Overworld, gather materials & journey to Nether (Blaze Rod, Quartz, Netherite)\n" +
             "§f• §dThe End: §7Start in Overworld, find stronghold & travel to The End (End Stone, Chorus, Shulker Shell)\n" +
             "§f• §eAll Dimensions: §7Any item across Overworld, Nether, and The End!",
    
    diffTitle: "§6🎯 Item Hunting Difficulty",
    diffBody: "§fCurrent Difficulty: §b{current}\n\n" +
              "§7Select the objective difficulty tier to roll:\n" +
              "§f• §aVery Easy: §7Around you: Dirt, Sand, Wood, Grass, Seeds, Flowers (45-90 sec)\n" +
              "§f• §2Easy: §7Coal, Food, Stone tools, Basic ores, Furnaces (2-4 min)\n" +
              "§f• §eMedium: §7Iron, Gold, Iron gear, Bows, Shields, Buckets (5-10 min)\n" +
              "§f• §6Hard: §7Diamonds, Obsidian, Lava, Nether ores, Deepslate (15-30 min)\n" +
              "§f• §cExtreme: §7Netherite, Dragon realm, Sculk, Shulker Boxes (1-2 hours)\n" +
              "§f• §dAll Difficulties: §7Mix of all difficulty tiers!",

    langTitle: "§6🌐 Select Language",
    langBody: "§fCurrent Language: §b{current}\n\n§7Choose your preferred language for menus, broadcasts, and notifications:",
    langChanged: "§a[Speedrun Roulette] §fLanguage changed to: §e{name}",

    timeUpNobodyFound: "Nobody found the item in time this round!",
    compassName: "§e§lSpeedrun Menu Compass §r§7(Right-click)",
  },
  th: {
    mainTitle: "§6★ Speedrun Roulette Menu ★",
    welcome: "ยินดีต้อนรับสู่แผงควบคุม Speedrun Roulette!",
    welcomeTitle: "§e★ Speedrun Roulette ★",
    welcomeSubtitle: "§aคลิกขวาเข็มทิศ หรือพิมพ์ !menu",
    welcomeBanner: "§6══════════════════════════════════════════\n" +
                   "§e★ ยินดีต้อนรับสู่ Speedrun Roulette! ★\n" +
                   "§fแข่งกันตามหาไอเท็มที่สุ่มขึ้นมาให้เร็วที่สุด!\n" +
                   "§7• คลิกขวาที่ §eเข็มทิศ §7หรือพิมพ์ §a!menu §7เพื่อเปิดเมนู\n" +
                   "§7• พิมพ์ §a!start §7เพื่อเริ่มเกม หรือ §a!help §7ดูคำสั่งทั้งหมด\n" +
                   "§dจัดทำโดย Peak4567\n" +
                   "§6══════════════════════════════════════════",
    credits: "§dจัดทำโดย: §e§lPeak4567§r",
    statusLabel: "สถานะ",
    statusIdle: "§7หยุดพัก (Idle)",
    statusRunning: "§aกำลังแข่งขัน (Running)",
    statusPaused: "§cหยุดชั่วคราว (PAUSED)",
    statusSpinning: "§eกำลังสุ่มกาชา (Spinning)",
    statusCountdown: "§eกำลังนับ 3-2-1",
    progressLabel: "ความคืบหน้า",
    targetItemLabel: "เป้าหมายปัจจุบัน",
    targetDimLabel: "มิติเป้าหมาย",
    itemDiffLabel: "ความยากการหาของ",
    timerModeLabel: "โหมดจับเวลา",
    timeMultiplierLabel: "ตัวคูณเวลา",
    envLabel: "เวลา / มอนสเตอร์",
    suddenDeathLabel: "โหมดครั้งเดียวตาย",
    suddenDeathOn: "§c💀 เปิด (ตายเป็น Spectator)",
    suddenDeathOff: "§a🟢 ปิด (เกิดใหม่หาต่อได้)",
    onlinePlayersLabel: "ผู้เล่นออนไลน์",
    selectCommandPrompt: "§7เลือกคำสั่งที่คุณต้องการด้านล่าง:",
    noneYet: "ยังไม่มี",
    roundStr: "ตาที่",

    btnPause: "§c⏸ หยุดเกมชั่วคราว",
    btnResume: "§a▶ เล่นเกมต่อ",
    btnStart: "§a▶ เริ่มการแข่งขัน",
    btnSettings: "§6⚙ ตั้งค่าเกม",
    btnReroll: "§e🎲 สุ่มไอเท็มใหม่",
    btnStop: "§c⏹ ยกเลิกรอบปัจจุบัน",
    btnLeaderboard: "§d🏆 ตารางอันดับ TOP 1-3",
    btnResetAll: "§4🔄 รีเซ็ตเกมและคะแนน",
    btnClose: "§c❌ ปิดเมนู (Close)",
    btnBack: "§c🔙 ย้อนกลับ (Back)",
    btnBackMain: "§c🔙 กลับสู่เมนูหลัก (Back)",

    configTitle: "§6⚙ ตั้งค่า Speedrun Roulette",
    configBodyIntro: "ปรับแต่งการตั้งค่าการแข่งขัน:\n",
    configPrompt: "§7แตะที่ปุ่มด้านล่างเพื่อปรับเปลี่ยน:",
    btnDimSetting: "§3🌐 มิติเป้าหมาย (Dimension)\n§7[{value}]",
    btnItemDiffSetting: "§a🎯 ความยากการหาของ\n§7[{value}]",
    btnModeToggle: "§e⏱ สลับโหมดเวลา\n§7[{value}]",
    btnRoundsSetting: "§b🎯 เลือกจำนวนตา (Rounds)\n§7[{value}]",
    btnMultiplierSetting: "§a⚡ ปรับตัวคูณเวลา\n§7[{value}]",
    btnWorldTimeSetting: "§6☀️ เวลาในเกม (World Time)\n§7[{value}]",
    btnMobDiffSetting: "§d👾 ความยากมอนสเตอร์\n§7[{value}]",
    btnSuddenDeathSetting: "§c💀 โหมดครั้งเดียวตาย\n§7[{value}]",
    btnLanguageSetting: "§e🌐 เปลี่ยนภาษา (Language)\n§7[{value}]",

    dimTitle: "§6🌐 เลือกมิติเป้าหมาย (Dimension Mode)",
    dimBody: "§fมิติปัจจุบัน: §b{current}\n\n" +
             "§7ผู้เล่นจะเริ่มที่โลกปกติ (Overworld) เสมอ และต้องหาของเพื่อเดินทางไปสู่มิติเป้าหมาย:\n" +
             "§f• §aโลกปกติ: §7สุ่มเฉพาะไอเท็ม Overworld (ต้นหญ้า ไม้ ถ่าน แร่ ดิน ดอกไม้ สัตว์)\n" +
             "§f• §cนรก: §7เริ่มที่โลกปกติ หาของและสร้างประตูสู่นรกเพื่อหาไอเท็ม (Blaze Rod, Quartz, Netherite ฯลฯ)\n" +
             "§f• §dมิติมังกร: §7เริ่มที่โลกปกติ หาของและเดินทางสู่ The End เพื่อหาไอเท็ม (End Stone, Chorus, Shulker ฯลฯ)\n" +
             "§f• §eรวมทุกมิติ: §7สุ่มได้ทุกอย่างใน Minecraft!",

    diffTitle: "§6🎯 ระดับความยากการหาของ",
    diffBody: "§fระดับปัจจุบัน: §b{current}\n\n" +
              "§7เลือกระดับความยากของไอเท็มที่ต้องการให้ระบบสุ่ม:\n" +
              "§f• §aง่ายมาก: §7ของรอบตัว ดิน ทราย ไม้ หญ้า พืช ดอกไม้ (45-90 วินาที)\n" +
              "§f• §2ง่าย: §7ถ่าน อาหาร อุปกรณ์หิน แร่เบื้องต้น เตาเผา (2-4 นาที)\n" +
              "§f• §eกลาง: §7เหล็ก ทอง อุปกรณ์เหล็ก ธนู โล่ ถังน้ำ (5-10 นาที)\n" +
              "§f• §6ยาก: §7เพชร ออบซิเดียน ลาวา แร่เนเธอร์ ชั้นหินลึก (15-30 นาที)\n" +
              "§f• §cยากมาก: §7เนเธอไรต์ มิติมังกร สกัลก์ กล่องชัลเกอร์ (1-2 ชั่วโมง)\n" +
              "§f• §dรวมทุกระดับ: §7สุ่มผสมทุกระดับความยาก!",

    langTitle: "§6🌐 เลือกภาษา / Select Language",
    langBody: "§fภาษาปัจจุบัน: §b{current}\n\n§7เลือกภาษาสำหรับแสดงผลในเมนูและข้อความแจ้งเตือน:",
    langChanged: "§a[Speedrun Roulette] §fเปลี่ยนภาษาเป็น: §e{name}",

    timeUpNobodyFound: "ไม่มีใครหาของทันในตานี้!",
    compassName: "§e§lเข็มทิศเมนูเกม §r§7(คลิกขวา)",
  }
};

function t(key, replacements = {}) {
  const lang = (state && state.language === "th") ? "th" : "en";
  let str = (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  for (const [k, v] of Object.entries(replacements)) {
    str = str.replace(new RegExp(`\{${k}\}`, "g"), String(v));
  }
  return str;
}
// ---------------------------------------------------------------
// ITEM HUNTING DIFFICULTY & DIMENSION DEFINITIONS
// ---------------------------------------------------------------
function getItemDifficultyOptions() {
  const isEn = !state || state.language !== "th";
  return [
    {
      value: "all",
      label: isEn ? "🎲 All Difficulties" : "🎲 รวมทุกระดับ (All Difficulties)",
      desc: isEn ? "Random items across all difficulties (Very Easy to Extreme)" : "สุ่มได้ทุกระดับความยาก (ง่ายมาก ยัน ยากมาก)",
      icon: "textures/items/ender_eye"
    },
    {
      value: 1,
      label: isEn ? "🟢 Very Easy" : "🟢 ง่ายมาก (Very Easy)",
      desc: isEn ? "Around you: Dirt, Sand, Wood, Grass, Seeds, Flowers (45 - 90 sec)" : "ของรอบตัว ดิน ทราย หิน ไม้ หญ้า เมล็ด ดอกไม้ ขนแกะ (45 - 90 วินาที)",
      icon: "textures/items/wheat_seeds"
    },
    {
      value: 2,
      label: isEn ? "🟡 Easy" : "🟡 ง่าย (Easy)",
      desc: isEn ? "Coal, Food, Stone tools, Torches, Furnaces (2 - 4 min)" : "ถ่าน อาหาร อุปกรณ์หิน แร่เบื้องต้น บันได เตาเผา (2 - 4 นาที)",
      icon: "textures/items/coal"
    },
    {
      value: 3,
      label: isEn ? "🟠 Medium" : "🟠 กลาง (Medium)",
      desc: isEn ? "Iron, Gold, Iron gear, Bows, Shields, Water buckets (5 - 10 min)" : "เหล็ก ทอง อุปกรณ์เหล็ก ธนู โล่ ถังน้ำ กระจก (5 - 10 นาที)",
      icon: "textures/items/iron_ingot"
    },
    {
      value: 4,
      label: isEn ? "🔴 Hard" : "🔴 ยาก (Hard)",
      desc: isEn ? "Diamonds, Obsidian, Lava, Nether ores, Deepslate (15 - 30 min)" : "เพชร ออบซิเดียน ลาวา แร่เนเธอร์ ชั้นหินลึก บล็อกหายาก (15 - 30 นาที)",
      icon: "textures/items/diamond"
    },
    {
      value: 5,
      label: isEn ? "🟣 Extreme" : "🟣 ยากมาก (Extreme)",
      desc: isEn ? "Netherite, Dragon realm, Sculk, Templates, Shulker boxes (1 - 2 hours)" : "เนเธอไรต์ มิติมังกร สกัลก์ เทมเพลต หัวมังกร กล่องชัลเกอร์ (1 - 2 ชั่วโมง)",
      icon: "textures/items/netherite_ingot"
    },
  ];
}

function getItemDifficultyModeName(mode) {
  const isEn = !state || state.language !== "th";
  switch (String(mode)) {
    case "1": return isEn ? "🟢 Very Easy" : "🟢 ง่ายมาก (Very Easy)";
    case "2": return isEn ? "🟡 Easy" : "🟡 ง่าย (Easy)";
    case "3": return isEn ? "🟠 Medium" : "🟠 กลาง (Medium)";
    case "4": return isEn ? "🔴 Hard" : "🔴 ยาก (Hard)";
    case "5": return isEn ? "🟣 Extreme" : "🟣 ยากมาก (Extreme)";
    case "all":
    default:
      return isEn ? "🎲 All Difficulties" : "🎲 รวมทุกระดับ (All)";
  }
}

function getDimensionOptions() {
  const isEn = !state || state.language !== "th";
  return [
    {
      value: "all",
      label: isEn ? "🌐 All Dimensions" : "🌐 รวมทุกมิติ (All Dimensions)",
      desc: isEn ? "Random items from Overworld, Nether, and The End" : "สุ่มได้ทุกไอเท็มจาก Overworld, Nether, และ The End",
      icon: "textures/items/compass_item"
    },
    {
      value: "overworld",
      label: isEn ? "🌿 Overworld Only" : "🌿 โลกปกติ (Overworld Only)",
      desc: isEn ? "Items obtainable within the Overworld (Wood, Coal, Ores, Animals, Plants)" : "เฉพาะไอเท็มที่หาได้ใน Overworld (ดิน หญ้า ไม้ ถ่าน แร่ สัตว์ พืช)",
      icon: "textures/items/apple"
    },
    {
      value: "nether",
      label: isEn ? "🔥 Nether Destination" : "🔥 นรก (Nether Destination)",
      desc: isEn ? "Start in Overworld, journey to Nether (Blaze Rod, Quartz, Netherite, etc.)" : "เริ่มที่โลกปกติ หาของและสร้างประตูสู่นรก (Blaze Rod, Quartz, Netherite ฯลฯ)",
      icon: "textures/items/blaze_rod"
    },
    {
      value: "the_end",
      label: isEn ? "🌌 The End Destination" : "🌌 มิติมังกร (The End Destination)",
      desc: isEn ? "Start in Overworld, journey to The End (End Stone, Chorus, Shulker Shell, etc.)" : "เริ่มที่โลกปกติ หาของและเดินทางสู่ The End (End Stone, Chorus, Shulker Shell ฯลฯ)",
      icon: "textures/items/ender_pearl"
    },
  ];
}

function getDimensionModeName(dim) {
  const isEn = !state || state.language !== "th";
  switch (dim) {
    case "overworld": return isEn ? "🌿 Overworld" : "🌿 โลกปกติ (Overworld)";
    case "nether": return isEn ? "🔥 Nether" : "🔥 นรก (Nether)";
    case "the_end": return isEn ? "🌌 The End" : "🌌 มิติมังกร (The End)";
    case "all":
    default:
      return isEn ? "🌐 All Dimensions" : "🌐 รวมทุกมิติ (All)";
  }
}

function getTimeModeName(mode) {
  const isEn = !state || state.language !== "th";
  switch (mode) {
    case "day": return isEn ? "☀️ Always Day" : "☀️ กลางวันตลอด (Always Day)";
    case "night": return isEn ? "🌙 Always Night" : "🌙 กลางคืนตลอด (Always Night)";
    case "normal":
    default:
      return isEn ? "🔄 Normal Cycle" : "🔄 ปกติ (Normal Cycle)";
  }
}

function getDifficultyName(diff) {
  const isEn = !state || state.language !== "th";
  switch (diff) {
    case "peaceful": return isEn ? "Peaceful" : "Peaceful (สงบ)";
    case "easy": return isEn ? "Easy" : "Easy (ง่าย)";
    case "normal": return isEn ? "Normal" : "Normal (ปกติ)";
    case "hard": return isEn ? "Hard" : "Hard (ยาก)";
    default: return diff;
  }
}

function getItemDimension(shortId) {
  const id = shortId.toLowerCase();

  // The End Items
  if (
    id.startsWith("end_stone") ||
    id.startsWith("purpur_") ||
    id === "purpur_block" ||
    id === "purpur_pillar" ||
    id.startsWith("chorus_") ||
    id === "chorus_fruit" ||
    id === "popped_chorus_fruit" ||
    id === "shulker_shell" ||
    id.startsWith("shulker_box") ||
    id === "elytra" ||
    id === "dragon_breath" ||
    id === "dragon_head" ||
    id === "dragon_egg" ||
    id === "end_rod" ||
    id === "end_crystal"
  ) {
    return "the_end";
  }

  // Nether Items
  if (
    id.includes("nether") ||
    id.includes("blaze") ||
    id.includes("magma") ||
    id.includes("ghast") ||
    id.includes("quartz") ||
    id.includes("soul_") ||
    id.includes("crying_obsidian") ||
    id.includes("respawn_anchor") ||
    id.includes("lodestone") ||
    id.includes("basalt") ||
    id.includes("blackstone") ||
    id.includes("crimson") ||
    id.includes("warped") ||
    id.includes("shroomlight") ||
    id.includes("wither_skeleton") ||
    id.includes("ancient_debris") ||
    id.includes("netherite") ||
    id.includes("glowstone") ||
    id === "piglin_banner_pattern" ||
    id === "fire_charge"
  ) {
    return "nether";
  }

  // Default is Overworld (Grass, Wood, Coal, Dirt, Animals, Minerals, etc.)
  return "overworld";
}

// Master Survival Catalog: Comprehensive collection of items obtainable in Minecraft Survival
const MASTER_SURVIVAL_ITEMS = [
  // Overworld: Natural foliage, soil, sand, gravel, stone, wood, coal
  "short_grass", "grass_block", "tall_grass", "fern", "large_fern", "seagrass", "kelp", "dried_kelp", "dried_kelp_block",
  "dirt", "coarse_dirt", "rooted_dirt", "mud", "mud_bricks", "clay", "clay_ball", "sand", "red_sand", "gravel", "flint",
  "stone", "cobblestone", "mossy_cobblestone", "smooth_stone", "granite", "diorite", "andesite",
  "deepslate", "cobbled_deepslate", "polished_deepslate", "deepslate_bricks", "deepslate_tiles", "tuff", "calcite",
  "dripstone_block", "pointed_dripstone", "obsidian",
  
  // All wood types (Log, Wood, Planks, Leaves, Saplings, Doors, Stairs, Slabs)
  "oak_log", "spruce_log", "birch_log", "jungle_log", "acacia_log", "dark_oak_log", "mangrove_log", "cherry_log", "bamboo_block",
  "stripped_oak_log", "stripped_spruce_log", "stripped_birch_log", "stripped_jungle_log", "stripped_acacia_log", "stripped_dark_oak_log", "stripped_mangrove_log", "stripped_cherry_log",
  "oak_wood", "spruce_wood", "birch_wood", "jungle_wood", "acacia_wood", "dark_oak_wood", "mangrove_wood", "cherry_wood",
  "stripped_oak_wood", "stripped_spruce_wood", "stripped_birch_wood", "stripped_jungle_wood", "stripped_acacia_wood", "stripped_dark_oak_wood", "stripped_mangrove_wood", "stripped_cherry_wood",
  "oak_planks", "spruce_planks", "birch_planks", "jungle_planks", "acacia_planks", "dark_oak_planks", "mangrove_planks", "cherry_planks", "bamboo_planks",
  "oak_leaves", "spruce_leaves", "birch_leaves", "jungle_leaves", "acacia_leaves", "dark_oak_leaves", "mangrove_leaves", "cherry_leaves", "azalea_leaves", "flowering_azalea_leaves",
  "oak_sapling", "spruce_sapling", "birch_sapling", "jungle_sapling", "acacia_sapling", "dark_oak_sapling", "mangrove_propagule", "cherry_sapling", "azalea", "flowering_azalea",
  "stick", "sugar_cane", "bamboo", "cactus", "vines", "lily_pad", "moss_block", "moss_carpet",
  "oak_boat", "spruce_boat", "birch_boat", "jungle_boat", "acacia_boat", "dark_oak_boat", "mangrove_boat", "cherry_boat", "bamboo_raft",
  "oak_door", "spruce_door", "birch_door", "jungle_door", "acacia_door", "dark_oak_door", "mangrove_door", "cherry_door", "bamboo_door", "iron_door",
  "oak_trapdoor", "spruce_trapdoor", "birch_trapdoor", "jungle_trapdoor", "acacia_trapdoor", "dark_oak_trapdoor", "mangrove_trapdoor", "cherry_trapdoor", "bamboo_trapdoor", "iron_trapdoor",
  "oak_fence", "spruce_fence", "birch_fence", "jungle_fence", "acacia_fence", "dark_oak_fence", "mangrove_fence", "cherry_fence", "bamboo_fence",
  "oak_fence_gate", "spruce_fence_gate", "birch_fence_gate", "jungle_fence_gate", "acacia_fence_gate", "dark_oak_fence_gate", "mangrove_fence_gate", "cherry_fence_gate", "bamboo_fence_gate",
  "oak_stairs", "spruce_stairs", "birch_stairs", "jungle_stairs", "acacia_stairs", "dark_oak_stairs", "mangrove_stairs", "cherry_stairs", "bamboo_stairs", "stone_stairs", "cobblestone_stairs",
  "oak_slab", "spruce_slab", "birch_slab", "jungle_slab", "acacia_slab", "dark_oak_slab", "mangrove_slab", "cherry_slab", "bamboo_slab", "stone_slab", "cobblestone_slab", "smooth_stone_slab",

  // Coal, Ores, and Gemstones
  "coal", "charcoal", "coal_block", "coal_ore", "deepslate_coal_ore",
  "raw_iron", "iron_ingot", "iron_block", "raw_iron_block", "iron_ore", "deepslate_iron_ore",
  "raw_copper", "copper_ingot", "copper_block", "raw_copper_block", "copper_ore", "deepslate_copper_ore",
  "raw_gold", "gold_ingot", "gold_block", "raw_gold_block", "gold_ore", "deepslate_gold_ore", "gold_nugget",
  "diamond", "diamond_block", "diamond_ore", "deepslate_diamond_ore",
  "emerald", "emerald_block", "emerald_ore", "deepslate_emerald_ore",
  "lapis_lazuli", "lapis_block", "lapis_ore", "deepslate_lapis_ore",
  "redstone", "redstone_block", "redstone_ore", "deepslate_redstone_ore",
  "amethyst_shard", "amethyst_block",

  // Flowers and Botany
  "dandelion", "poppy", "blue_orchid", "allium", "azure_bluet", "red_tulip", "orange_tulip", "white_tulip", "pink_tulip",
  "oxeye_daisy", "cornflower", "lily_of_the_valley", "sunflower", "lilac", "rose_bush", "peony", "torchflower", "pitcher_plant", "wither_rose",

  // Agriculture, Farming, and Food
  "wheat", "wheat_seeds", "hay_block", "bread",
  "carrot", "golden_carrot", "potato", "baked_potato", "poisonous_potato",
  "beetroot", "beetroot_seeds", "beetroot_soup",
  "apple", "golden_apple", "sweet_berries", "glow_berries",
  "melon", "melon_slice", "melon_seeds", "glistering_melon_slice",
  "pumpkin", "pumpkin_seeds", "carved_pumpkin", "jack_o_lantern", "pumpkin_pie",
  "cocoa_beans", "cookie", "cake", "honeycomb", "honeycomb_block", "honey_bottle", "honey_block", "beehive",
  "raw_beef", "cooked_beef", "raw_porkchop", "cooked_porkchop", "raw_mutton", "cooked_mutton", "raw_chicken", "cooked_chicken",
  "raw_cod", "cooked_cod", "raw_salmon", "cooked_salmon", "brown_mushroom", "red_mushroom", "mushroom_stew", "rabbit_stew",
  "egg", "milk_bucket",

  // Monster and Animal Drops
  "bone", "bone_meal", "bone_block", "string", "spider_eye", "fermented_spider_eye", "rotten_flesh", "gunpowder", "tnt",
  "feather", "leather", "rabbit_hide", "rabbit_foot", "slime_ball", "slime_block",
  "ender_pearl", "eye_of_ender", "phantom_membrane", "ink_sac", "glow_ink_sac",
  "nautilus_shell", "heart_of_the_sea", "conduit", "prismarine", "prismarine_shard", "prismarine_crystals", "sea_lantern", "sponge", "wet_sponge",
  "scute", "turtle_helmet", "totem_of_undying", "saddle", "name_tag", "lead",
  "trial_key", "ominous_trial_key", "breeze_rod", "wind_charge", "heavy_core", "mace", "echo_shard",

  // Weapons, Tools, and Armor
  "wooden_sword", "wooden_pickaxe", "wooden_axe", "wooden_shovel", "wooden_hoe",
  "stone_sword", "stone_pickaxe", "stone_axe", "stone_shovel", "stone_hoe",
  "iron_sword", "iron_pickaxe", "iron_axe", "iron_shovel", "iron_hoe", "iron_helmet", "iron_chestplate", "iron_leggings", "iron_boots",
  "golden_sword", "golden_pickaxe", "golden_axe", "golden_shovel", "golden_hoe", "golden_helmet", "golden_chestplate", "golden_leggings", "golden_boots",
  "diamond_sword", "diamond_pickaxe", "diamond_axe", "diamond_shovel", "diamond_hoe", "diamond_helmet", "diamond_chestplate", "diamond_leggings", "diamond_boots",
  "shield", "bow", "crossbow", "arrow", "fishing_rod", "shears", "flint_and_steel", "spyglass",

  // Utility Blocks, Furniture, and Redstone
  "crafting_table", "furnace", "smoker", "blast_furnace", "campfire", "soul_campfire",
  "chest", "barrel", "trapped_chest", "ender_chest", "anvil", "grindstone", "smithing_table", "cartography_table", "fletching_table", "loom", "stonecutter",
  "brewing_stand", "cauldron", "hopper", "dispenser", "dropper", "observer",
  "piston", "sticky_piston", "repeater", "comparator", "daylight_detector", "target", "lectern", "jukebox", "note_block", "bell",
  "torch", "soul_torch", "lantern", "soul_lantern", "redstone_torch", "lever", "tripwire_hook",
  "rail", "powered_rail", "detector_rail", "activator_rail", "minecart",
  "white_bed", "red_bed", "blue_bed", "black_bed", "yellow_bed", "green_bed",
  "white_wool", "black_wool", "red_wool", "blue_wool", "yellow_wool", "green_wool",
  "glass", "glass_bottle", "bucket", "water_bucket", "lava_bucket",

  // === Nether Items ===
  "netherrack", "quartz", "nether_quartz_ore", "quartz_block", "smooth_quartz", "chiseled_quartz_block", "quartz_pillar", "quartz_stairs", "quartz_slab",
  "soul_sand", "soul_soil", "basalt", "smooth_basalt", "polished_basalt", "blackstone", "polished_blackstone", "polished_blackstone_bricks", "cracked_polished_blackstone_bricks", "gilded_blackstone",
  "glowstone", "glowstone_dust", "magma_block", "magma_cream", "blaze_rod", "blaze_powder", "ghast_tear",
  "nether_wart", "nether_wart_block", "warped_wart_block", "nether_brick", "nether_bricks", "red_nether_brick", "red_nether_bricks", "nether_sprouts",
  "crimson_stem", "warped_stem", "stripped_crimson_stem", "stripped_warped_stem", "crimson_hyphae", "warped_hyphae", "stripped_crimson_hyphae", "stripped_warped_hyphae",
  "crimson_planks", "warped_planks", "crimson_fungus", "warped_fungus", "crimson_roots", "warped_roots", "weeping_vines", "twisting_vines", "shroomlight",
  "ancient_debris", "netherite_scrap", "netherite_ingot", "netherite_sword", "netherite_pickaxe", "netherite_axe", "netherite_shovel", "netherite_hoe",
  "netherite_helmet", "netherite_chestplate", "netherite_leggings", "netherite_boots", "netherite_upgrade_smithing_template",
  "crying_obsidian", "respawn_anchor", "lodestone", "wither_skeleton_skull", "nether_star", "beacon", "piglin_banner_pattern", "fire_charge",

  // === The End Items ===
  "end_stone", "end_stone_bricks", "end_stone_brick_stairs", "end_stone_brick_slab", "end_stone_brick_wall",
  "chorus_fruit", "popped_chorus_fruit", "chorus_flower", "chorus_plant",
  "purpur_block", "purpur_pillar", "purpur_stairs", "purpur_slab",
  "end_rod", "shulker_shell", "shulker_box", "elytra", "dragon_breath", "dragon_head", "dragon_egg", "end_crystal"
];


function enrichItem(typeId, rawName = null) {
  const shortId = typeId.replace("minecraft:", "");
  const name = rawName || prettifyName(shortId);
  const icon = getGlyph(typeId, shortId);
  const diff = getItemDifficulty(typeId);
  const dimension = getItemDimension(shortId);
  return {
    id: typeId,
    shortId,
    name,
    icon,
    difficulty: diff,
    seconds: diff.seconds,
    dimension,
  };
}

function buildItemPool() {
  const seen = new Set();
  const pool = [];

  // 1. Load from ItemTypes.getAll() if supported by runtime
  try {
    for (const type of ItemTypes.getAll()) {
      const shortId = type.id.replace("minecraft:", "");
      if (EXCLUDE_KEYWORDS.some((k) => shortId.includes(k))) continue;
      if (!seen.has(type.id)) {
        seen.add(type.id);
        pool.push(enrichItem(type.id));
      }
    }
  } catch (e) {
    console.warn(`[Speedrun Roulette] ItemTypes.getAll error: ${e}`);
  }

  // 2. Ensure ALL items in MASTER_SURVIVAL_ITEMS are guaranteed to be present
  for (const shortId of MASTER_SURVIVAL_ITEMS) {
    const fullId = `minecraft:${shortId}`;
    if (!seen.has(fullId)) {
      seen.add(fullId);
      pool.push(enrichItem(fullId));
    }
  }

  return pool;
}

let ITEM_POOL;
let poolLoadError = null;
try {
  ITEM_POOL = buildItemPool();
  if (!ITEM_POOL || ITEM_POOL.length === 0) throw new Error("Pool came back empty");
} catch (e) {
  poolLoadError = e;
  ITEM_POOL = MASTER_SURVIVAL_ITEMS.map((id) => enrichItem(`minecraft:${id}`));
}
console.warn(`[Speedrun Roulette] Loaded ${ITEM_POOL.length} possible objectives covering all survival items and dimensions.`);

// ---------------------------------------------------------------
// GAME STATE MANAGEMENT
// ---------------------------------------------------------------
const state = {
  // Configurable Settings
  language: "en",          // "en" (English - Default) | "th" (Thai)
  mode: "countdown",       // "countdown" (Time limited) or "countup" (Stopwatch)
  totalRounds: 10,         // Number of rounds: 1, 3, 5, 10... or 0 for unlimited
  currentRound: 1,         // Current round number (1..totalRounds)
  timeMultiplier: 1.0,     // Time multiplier for countdown mode
  timeMode: "normal",      // "day" | "night" | "normal"
  difficulty: "normal",    // "peaceful" | "easy" | "normal" | "hard"
  targetDimension: "all",  // "all" | "overworld" | "nether" | "the_end"
  targetItemDifficulty: "all", // "all" | 1 (Very Easy) | 2 (Easy) | 3 (Medium) | 4 (Hard) | 5 (Extreme)
  currentRoundWorld: null,     // { x: number, z: number, dimensionName: string }
  suddenDeath: false,      // true: Elimination mode (Spectator on death)
  aliveSuddenDeathPlayers: new Set(), // Set of player IDs currently alive in sudden death mode
  scores: new Map(),       // playerId -> { name: string, wins: number, deaths: number }
  roundDeaths: new Map(),  // playerId -> deaths in current round

  // Active Round Runtime State
  roundState: "idle",      // "idle" | "spinning" | "countdown321" | "running" | "paused" | "round_ended"
  activeItem: null,        // The single shared objective for ALL players this round!
  startTick: 0,            // system.currentTick when "GO!" occurred
  timeLimitTicks: 0,       // Ticks limit for countdown
  pausedElapsedTicks: 0,   // Ticks elapsed when game was paused
  playerStartCounts: new Map(), // playerId -> starting count of activeItem
  transitionTimeout: null, // system.runTimeout ID for next round
  lastTickingSecond: -1,   // Last second ticked for audio alert
};

// Player IDs currently spinning or in 3-2-1
const spinningPlayers = new Set();

function getRoundStr() {
  return state.totalRounds > 0
    ? `${state.currentRound}/${state.totalRounds}`
    : `${state.currentRound}/∞`;
}

// Format remaining or elapsed ticks to a friendly display string with appropriate units
function formatTimerTicks(ticks) {
  const totalMs = Math.max(0, ticks * 50);
  const totalSec = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const centis = Math.floor((totalMs % 1000) / 10);

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const cc = String(centis).padStart(2, "0");

  const isEn = !state || state.language !== "th";
  if (hours > 0) {
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${mm}:${ss} ${isEn ? '(hr)' : '(ชม.)'}`;
  }
  if (minutes > 0) {
    return `${mm}:${ss}.${cc} ${isEn ? '(min)' : '(นาที)'}`;
  }
  return `${ss}.${cc}s ${isEn ? '(sec)' : '(วิ)'}`;
}

function pickRandomItem() {
  let eligible = ITEM_POOL;
  if (state.targetDimension && state.targetDimension !== "all") {
    eligible = eligible.filter((item) => item.dimension === state.targetDimension);
  }
  if (state.targetItemDifficulty && state.targetItemDifficulty !== "all") {
    const tierNum = Number(state.targetItemDifficulty);
    const tierFiltered = eligible.filter((item) => item.difficulty && item.difficulty.tier === tierNum);
    if (tierFiltered.length > 0) {
      eligible = tierFiltered;
    }
  }
  if (!eligible || eligible.length === 0) {
    eligible = ITEM_POOL;
  }
  return eligible[Math.floor(Math.random() * eligible.length)];
}

function getItemCount(player, itemId) {
  const inv = player.getComponent("minecraft:inventory");
  if (!inv || !inv.container) return 0;
  const container = inv.container;
  let count = 0;
  for (let i = 0; i < container.size; i++) {
    const stack = container.getItem(i);
    if (stack && stack.typeId === itemId) count += stack.amount;
  }
  return count;
}

function killPlayer(player) {
  try {
    player.kill();
  } catch (e) {
    try {
      player.applyDamage(9999);
    } catch (err) {
      try {
        player.runCommandAsync("kill @s");
      } catch (cmdErr) {}
    }
  }
}

// ---------------------------------------------------------------
// MENU COMPASS, LOBBY ENVIRONMENT & GAMEPLAY HELPERS
// ---------------------------------------------------------------
const COMPASS_NAME_TH = "§e§lเข็มทิศเมนูเกม §r§7(คลิกขวา)";
const COMPASS_NAME_EN = "§e§lSpeedrun Menu Compass §r§7(Right-click)";

function isMenuCompass(stack) {
  if (!stack || stack.typeId !== "minecraft:compass") return false;
  const name = stack.nameTag || "";
  return name === COMPASS_NAME_TH || name === COMPASS_NAME_EN ||
         name.includes("Compass") || name.includes("เข็มทิศ") || name.includes("เมนู");
}

function giveMenuCompass(player) {
  if (!player) return;
  try {
    const inv = player.getComponent("minecraft:inventory");
    if (!inv || !inv.container) return;
    const container = inv.container;

    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (item && isMenuCompass(item)) {
        return; // Already has it
      }
    }

    const isEn = !state || state.language !== "th";
    const compass = new ItemStack("minecraft:compass", 1);
    compass.nameTag = isEn ? COMPASS_NAME_EN : COMPASS_NAME_TH;
    compass.setLore(isEn ? [
      "§7Right-click or hold to open settings & game controls",
      "§dCreated by: §ePeak4567"
    ] : [
      "§7คลิกขวาหรือกดค้างเพื่อเปิดเมนูตั้งค่าและควบคุมเกม",
      "§dจัดทำโดย: §ePeak4567"
    ]);

    container.addItem(compass);
  } catch (e) {
    console.warn(`[Speedrun Roulette] giveMenuCompass error: ${e}`);
  }
}

function giveMenuCompassToAll() {
  for (const p of world.getPlayers()) {
    giveMenuCompass(p);
  }
}

function removeMenuCompass(player) {
  if (!player) return;
  try {
    const inv = player.getComponent("minecraft:inventory");
    if (!inv || !inv.container) return;
    const container = inv.container;

    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (item && isMenuCompass(item)) {
        container.setItem(i, undefined);
      }
    }
  } catch (e) {
    console.warn(`[Speedrun Roulette] removeMenuCompass error: ${e}`);
  }
}

function removeMenuCompassFromAll() {
  for (const p of world.getPlayers()) {
    removeMenuCompass(p);
  }
}

function applyLobbyEnvironment() {
  try {
    const dim = world.getDimension("overworld");
    dim.runCommand("gamerule sendcommandfeedback false");
    dim.runCommand("gamerule commandblockoutput false");
    dim.runCommand("gamerule dodaylightcycle false");
    dim.runCommand("time set day");
    dim.runCommand("gamerule domobspawning false");
    dim.runCommand("weather clear");
    dim.runCommand("kill @e[type=!player,family=monster]");
  } catch (e) {
    console.warn(`[Speedrun Roulette] applyLobbyEnvironment error: ${e}`);
  }
}

function applyGameEnvironment() {
  try {
    const dim = world.getDimension("overworld");
    dim.runCommand("gamerule sendcommandfeedback false");
    dim.runCommand("gamerule commandblockoutput false");

    // Apply Time Mode
    if (state.timeMode === "day") {
      dim.runCommand("gamerule dodaylightcycle false");
      dim.runCommand("time set day");
    } else if (state.timeMode === "night") {
      dim.runCommand("gamerule dodaylightcycle false");
      dim.runCommand("time set midnight");
    } else {
      dim.runCommand("gamerule dodaylightcycle true");
    }

    // Apply Monster Difficulty & Spawning
    if (state.difficulty === "peaceful") {
      dim.runCommand("difficulty peaceful");
      dim.runCommand("gamerule domobspawning false");
      dim.runCommand("kill @e[type=!player,family=monster]");
    } else {
      dim.runCommand(`difficulty ${state.difficulty}`);
      dim.runCommand("gamerule domobspawning true");
    }
  } catch (e) {
    console.warn(`[Speedrun Roulette] applyGameEnvironment error: ${e}`);
  }
}

function restoreSpectators(announce = false) {
  let count = 0;
  for (const p of world.getPlayers()) {
    try {
      p.runCommand("gamemode survival @s");
      count++;
    } catch (e) {}
  }
  if (announce && state.suddenDeath && count > 0) {
    world.sendMessage(isEn ? "§a[Speedrun Roulette] Round ended! All players returned to Survival mode." : "§a[Speedrun Roulette] จบรอบแล้ว! ผู้เล่นทุกคนกลับสู่โหมด Survival");
  }
}

function getWorldSpawnLoc() {
  let spawnLoc = { x: 0, y: 64, z: 0 };
  try {
    const loc = world.getDefaultSpawnLocation();
    if (loc) {
      spawnLoc = { x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) };
    }
  } catch (e) {
    console.warn(`[Speedrun Roulette] getWorldSpawnLoc error: ${e}`);
  }
  return spawnLoc;
}

function restorePlayerHealthAndHunger(p) {
  if (!p) return;
  // 1. Refill Health to max
  try {
    const health = p.getComponent("minecraft:health");
    if (health) {
      health.setCurrentValue(health.effectiveMax || 20);
    }
  } catch (e) {}

  // 2. Refill Hunger to full (20) & saturation & instant health via commands
  try {
    p.runCommandAsync("effect @s instant_health 1 255 true");
    p.runCommandAsync("effect @s saturation 1 255 true");
    p.runCommandAsync("effect @s clear");
  } catch (e) {}

  // 3. Extinguish fire
  try {
    if (typeof p.extinguishFire === "function") {
      p.extinguishFire();
    }
  } catch (e) {}
}

function teleportSinglePlayerToWorldSpawn(p) {
  if (!p) return;
  const spawnLoc = getWorldSpawnLoc();
  const overworld = world.getDimension("overworld");

  // 1. Cancel bed save by resetting personal spawnpoint back to world spawn
  try {
    p.runCommandAsync(`spawnpoint @s ${spawnLoc.x} ${spawnLoc.y} ${spawnLoc.z}`);
  } catch (e) {}

  // 2. Teleport player safely to world spawn
  try {
    p.teleport(
      { x: spawnLoc.x + 0.5, y: spawnLoc.y, z: spawnLoc.z + 0.5 },
      { dimension: overworld, checkForBlocks: false }
    );
  } catch (e) {
    try {
      p.runCommandAsync(`tp @s ${spawnLoc.x} ${spawnLoc.y} ${spawnLoc.z}`);
    } catch (cmdErr) {}
  }
}

function teleportAllToWorldSpawn() {
  const spawnLoc = getWorldSpawnLoc();
  const overworld = world.getDimension("overworld");

  // Reset spawnpoint for all players to cancel bed saves
  try {
    overworld.runCommand(`spawnpoint @a ${spawnLoc.x} ${spawnLoc.y} ${spawnLoc.z}`);
  } catch (e) {}

  for (const p of world.getPlayers()) {
    teleportSinglePlayerToWorldSpawn(p);
  }
}

// (Duplicate getTimeModeName & getDifficultyName removed in favor of dual-language versions)

// ---------------------------------------------------------------
// TOP 1-3 RANKING / LEADERBOARD SYSTEM
// ---------------------------------------------------------------
function getTopRankings(limit = 3) {
  // Ensure every online player has an entry
  for (const p of world.getPlayers()) {
    if (!state.scores.has(p.id)) {
      state.scores.set(p.id, { name: p.name, wins: 0, deaths: 0 });
    }
  }

  const list = Array.from(state.scores.values());
  // Sort descending by wins; if wins are equal, sort ascending by deaths (less deaths = better rank!)
  list.sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return (a.deaths || 0) - (b.deaths || 0);
  });
  return list.slice(0, limit);
}

function displayTopRankings(target = null) {
  const isEn = !state || state.language !== "th";
  const topList = getTopRankings(3);
  const send = (msg) => {
    if (target) target.sendMessage(msg);
    else world.sendMessage(msg);
  };

  send("§6╔════════════════════════════════════════╗");
  send(isEn ? "§6║      ★ TOP 1 - 3 LEADERBOARD ★       ║" : "§6║      ★ อันดับผู้ชนะสูงสุด TOP 1 - 3 ★       ║");
  send(isEn ? "§6║           §dCreated by Peak4567§6            ║" : "§6║           §dจัดทำโดย Peak4567§6            ║");
  send("§6╠════════════════════════════════════════╣");

  const medals = isEn ? ["§6🥇 1st Place", "§f🥈 2nd Place", "§c🥉 3rd Place"] : ["§6🥇 อันดับ 1", "§f🥈 อันดับ 2", "§c🥉 อันดับ 3"];
  for (let i = 0; i < 3; i++) {
    const entry = topList[i];
    if (entry && (entry.wins > 0 || (entry.deaths || 0) > 0)) {
      send(isEn
        ? `§f  ${medals[i]}: §e§l${entry.name}§r §f- Won §a${entry.wins}§f rounds §7| Deaths: §c${entry.deaths || 0}§7`
        : `§f  ${medals[i]}: §e§l${entry.name}§r §f- ชนะ §a${entry.wins}§f ตา §7| ตาย §c${entry.deaths || 0}§7 ครั้ง`);
    } else if (entry) {
      send(isEn
        ? `§f  ${medals[i]}: §7${entry.name} §8(0 wins | 0 deaths)`
        : `§f  ${medals[i]}: §7${entry.name} §8(ชนะ 0 ตา | ตาย 0 ครั้ง)`);
    } else {
      send(`§f  ${medals[i]}: §7- ${isEn ? "Empty" : "ว่าง"} -`);
    }
  }
  send("§6╚════════════════════════════════════════╝");
}

// ---------------------------------------------------------------
// TELEPORT PLAYERS TOGETHER SAFELY
// ---------------------------------------------------------------
function getRoundTargetDimension() {
  // Players ALWAYS start in the Overworld! Nether / The End objectives require
  // players to gather materials in the Overworld and journey to that dimension!
  return world.getDimension("overworld");
}

function generateNewWorldCoordinates(roundNum) {
  // Generate new world coordinates each round using golden spiral dispersal
  // Ensures each round starts tens of thousands of blocks away in untouched terrain
  const baseDistance = 30000 + (roundNum * 20000) + Math.floor(Math.random() * 25000);
  const goldenAngle = (roundNum * 137.507764 * Math.PI) / 180 + (Math.random() - 0.5) * 0.4;
  
  const baseX = Math.floor(Math.cos(goldenAngle) * baseDistance);
  const baseZ = Math.floor(Math.sin(goldenAngle) * baseDistance);
  return { x: baseX, z: baseZ };
}

function teleportPlayersToRandomLocation(players) {
  if (!players || players.length === 0) return;
  const targetDimension = getRoundTargetDimension();
  const dimId = targetDimension.id || "minecraft:overworld";

  // Pick unique world coordinates for this round
  const { x: baseX, z: baseZ } = generateNewWorldCoordinates(state.currentRound || 1);
  state.currentRoundWorld = { x: baseX, z: baseZ, dimensionName: dimId };

  // Reset environment to fresh world: early morning and clear weather
  try {
    targetDimension.runCommand("time set 0");
    targetDimension.runCommand("weather clear");
  } catch (e) {}

  const isEn = !state || state.language !== "th";
  world.sendMessage(isEn
    ? `§a🌍 [Speedrun Roulette] §fGenerated fresh Overworld for round §e${getRoundStr()}§f! §7(Destination: §b${getDimensionModeName(state.targetDimension)} §7| X: §e${baseX}§7, Z: §e${baseZ}§7)`
    : `§a🌍 [Speedrun Roulette] §fสุ่มโลกใหม่ตาที่ §e${getRoundStr()} §fเรียบร้อย! §7(มิติเป้าหมาย: §b${getDimensionModeName(state.targetDimension)} §7| X: §e${baseX}§7, Z: §e${baseZ}§7)`);

  const N = players.length;
  for (let i = 0; i < N; i++) {
    const p = players[i];
    let targetX = baseX;
    let targetZ = baseZ;

    if (N > 1) {
      const angle = (2 * Math.PI * i) / N + (Math.random() - 0.5) * 0.4;
      const dist = 6 + Math.random() * 20;
      targetX = baseX + Math.floor(dist * Math.cos(angle));
      targetZ = baseZ + Math.floor(dist * Math.sin(angle));
    }

    try {
      p.addEffect("resistance", 600, { amplifier: 255, showParticles: false });
      p.addEffect("fire_resistance", 600, { amplifier: 0, showParticles: false });
      p.addEffect("darkness", 80, { amplifier: 0, showParticles: false });
      p.runCommandAsync("camera @s fade time 0.3 3.5 0.5 color 10 10 15");
    } catch (e) {}

    // Calculate safe surface height
    let safeY = 120;
    try {
      if (typeof targetDimension.getTopmostBlock === "function") {
        const topBlock = targetDimension.getTopmostBlock({ x: targetX, z: targetZ });
        if (topBlock && topBlock.location.y > -60) {
          safeY = topBlock.location.y + 1;
        }
      }
    } catch (e) {}

    try {
      p.teleport(
        { x: targetX + 0.5, y: safeY, z: targetZ + 0.5 },
        { dimension: targetDimension, checkForBlocks: false }
      );
    } catch (e) {
      try {
        p.teleport({ x: targetX + 0.5, y: 120, z: targetZ + 0.5 }, { dimension: targetDimension });
      } catch (err) {}
    }

    // spreadplayers brings players safely and fairly to the natural surface
    try {
      p.runCommandAsync(`spreadplayers ${targetX} ${targetZ} 2 15 @s`);
    } catch (e) {}

    try {
      const isEn = !state || state.language !== "th";
      p.onScreenDisplay.setTitle(isEn ? "§a🌍 New World Generated!" : "§a🌍 สุ่มโลกใหม่สำเร็จ!", {
        subtitle: isEn ? `§eRound ${getRoundStr()} §7| Coords: §fX: ${baseX}, Z: ${baseZ}` : `§eตาที่ ${getRoundStr()} §7| พิกัด: §fX: ${baseX}, Z: ${baseZ}`,
        fadeInDuration: 5,
        stayDuration: 40,
        fadeOutDuration: 10,
      });
      p.playSound("random.levelup", { pitch: 1.1, volume: 1.0 });
    } catch (e) {}
  }
}

// ---------------------------------------------------------------
// TELEPORT SINGLE PLAYER TO RANDOM LOCATION (RESPAWN AFTER DEATH)
// ---------------------------------------------------------------
function teleportSinglePlayerToRandomLocation(p) {
  if (!p) return;
  const targetDimension = getRoundTargetDimension();

  // Respawn within this round's designated world boundaries
  let targetX = Math.floor((Math.random() - 0.5) * 6000);
  let targetZ = Math.floor((Math.random() - 0.5) * 6000);

  if (state.currentRoundWorld) {
    targetX = state.currentRoundWorld.x + Math.floor((Math.random() - 0.5) * 120);
    targetZ = state.currentRoundWorld.z + Math.floor((Math.random() - 0.5) * 120);
  }

  // Provide spawn protection effects upon respawning
  try {
    p.addEffect("resistance", 400, { amplifier: 255, showParticles: false });
    p.addEffect("fire_resistance", 400, { amplifier: 0, showParticles: false });
    p.addEffect("darkness", 60, { amplifier: 0, showParticles: false });
    p.runCommandAsync("camera @s fade time 0.2 1.5 0.3 color 15 15 20");
  } catch (e) {}

  let safeY = 120;
  try {
    if (typeof targetDimension.getTopmostBlock === "function") {
      const topBlock = targetDimension.getTopmostBlock({ x: targetX, z: targetZ });
      if (topBlock && topBlock.location.y > -60) {
        safeY = topBlock.location.y + 1;
      }
    }
  } catch (e) {}

  try {
    p.teleport(
      { x: targetX + 0.5, y: safeY, z: targetZ + 0.5 },
      { dimension: targetDimension, checkForBlocks: false }
    );
  } catch (e) {
    try {
      p.teleport({ x: targetX + 0.5, y: 120, z: targetZ + 0.5 }, { dimension: targetDimension });
    } catch (err) {}
  }

  // spreadplayers adjusts position safely to the ground
  try {
    p.runCommandAsync(`spreadplayers ${targetX} ${targetZ} 1 15 @s`);
  } catch (e) {}

  const isEn = !state || state.language !== "th";
  try {
    p.onScreenDisplay.setTitle(isEn ? "§e🎲 Respawned!" : "§e🎲 สุ่มเกิดใหม่แล้ว!", {
      subtitle: isEn ? `§fRespawned safely in this world! (X: ${targetX}, Z: ${targetZ})` : `§fสุ่มเกิดใหม่ในโลกนี้เรียบร้อย! (X: ${targetX}, Z: ${targetZ})`,
      fadeInDuration: 5,
      stayDuration: 40,
      fadeOutDuration: 10,
    });
    p.playSound("random.levelup", { pitch: 1.2, volume: 1.0 });
  } catch (e) {}

  p.sendMessage(isEn
    ? `§e🎲 [Speedrun Roulette] §fYou died! Respawned safely in this round's world §7(X: ${targetX}, Z: ${targetZ})`
    : `§e🎲 [Speedrun Roulette] §fคุณเสียชีวิต! สุ่มเกิดใหม่ในโลกตานี้เรียบร้อยแล้ว §7(X: ${targetX}, Z: ${targetZ})`);
}

// ---------------------------------------------------------------
// CLEAR INVENTORY & EFFECTS HELPER
// ---------------------------------------------------------------
function clearPlayerInventoryAndEffects(p) {
  if (!p) return;
  // Clear main inventory container
  try {
    const inv = p.getComponent("minecraft:inventory");
    if (inv && inv.container) {
      inv.container.clearAll();
    }
  } catch (e) {}

  // Clear armor slots and offhand
  try {
    const equip = p.getComponent("minecraft:equippable");
    if (equip) {
      for (const slot of ["Head", "Chest", "Legs", "Feet", "Offhand"]) {
        try { equip.setEquipment(slot, undefined); } catch (err) {}
      }
    }
  } catch (e) {}

  // Secondary cleanup command to guarantee complete inventory clear
  try { p.runCommandAsync("clear @s"); } catch (e) {}
  try { p.runCommandAsync("effect @s clear"); } catch (e) {}
}

// ---------------------------------------------------------------
// GACHA SPIN & 3-2-1-GO COUNTDOWN
// ---------------------------------------------------------------
const SPIN_STEPS = [1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 6, 8, 10, 13, 17, 22];

function spinAndStart(initiator = null) {
  if (state.roundState === "spinning" || state.roundState === "countdown321") {
    if (initiator) {
      const isEn = !state || state.language !== "th";
      initiator.sendMessage(isEn ? "§c[Speedrun Roulette] Already rolling or counting down, please wait!" : "§c[Speedrun Roulette] กำลังสุ่มหรือนับถอยหลังอยู่ กรุณารอสักครู่!");
    }
    return;
  }

  // Cancel any scheduled next-round timer
  if (state.transitionTimeout) {
    system.clearRun(state.transitionTimeout);
    state.transitionTimeout = null;
  }
  state.pausedElapsedTicks = 0;
  removeMenuCompassFromAll();
  restoreSpectators(false);

  const participants = Array.from(world.getPlayers());
  if (participants.length === 0) return;

  // Reset / Clear inventory, restore full health & hunger, and cancel bed save for all players upon starting/changing round
  const spawnLoc = getWorldSpawnLoc();
  for (const p of participants) {
    clearPlayerInventoryAndEffects(p);
    restorePlayerHealthAndHunger(p);
    try {
      p.runCommandAsync(`spawnpoint @s ${spawnLoc.x} ${spawnLoc.y} ${spawnLoc.z}`);
    } catch (e) {}
  }

  // Initialize scores for all participants if not present
  for (const p of participants) {
    if (!state.scores.has(p.id)) {
      state.scores.set(p.id, { name: p.name, wins: 0, deaths: 0 });
    }
  }
  state.roundDeaths.clear();

  state.roundState = "spinning";
  spinningPlayers.clear();
  for (const p of participants) {
    spinningPlayers.add(p.id);
  }

  // 1. Teleport all players to random location within 40 blocks of each other
  teleportPlayersToRandomLocation(participants);

  // 2. SHARED OBJECTIVE: Pick ONE item for ALL players!
  const finalItem = pickRandomItem();
  state.activeItem = finalItem;

  // 3. Build reel ending at finalItem
  const reel = [pickRandomItem(), pickRandomItem()];
  for (let s = 0; s < SPIN_STEPS.length - 1; s++) {
    reel.push(pickRandomItem());
  }
  reel.push(finalItem);
  reel.push(pickRandomItem());
  reel.push(pickRandomItem());

  let step = 0;
  const isEn = !state || state.language !== "th";
  world.sendMessage(isEn
    ? `§e[Speedrun Roulette] §fInventories cleared. Teleporting to Overworld & rolling objective §a[Round ${getRoundStr()}] §7| Destination: §b${getDimensionModeName(state.targetDimension)}§f...`
    : `§e[Speedrun Roulette] §fล้างไอเท็มในตัวทุกคน กำลังวาร์ปและเริ่มสุ่มกาชาไอเท็ม §a[ตาที่ ${getRoundStr()}] §7| มิติ: §b${getDimensionModeName(state.targetDimension)}§f...`);

  function spinTick() {
    const activeParticipants = participants.filter((p) => spinningPlayers.has(p.id));
    if (activeParticipants.length === 0 || state.roundState !== "spinning") return;

    if (step >= SPIN_STEPS.length) {
      // Gacha landed on target item!
      const finalIdx = SPIN_STEPS.length + 1;
      const fL2 = reel[finalIdx - 2];
      const fL1 = reel[finalIdx - 1];
      const fR1 = reel[finalIdx + 1];
      const fR2 = reel[finalIdx + 2];

      const diff = finalItem.difficulty;
      const finalTitle = `§8${fL2.icon || "•"}  §7${fL1.icon || "•"}  §a★ §6[ §f${finalItem.icon || "★"} §6] §a★  §7${fR1.icon || "•"}  §8${fR2.icon || "•"}`;
      const isEn = !state || state.language !== "th";
      const tierNameDisplay = isEn ? diff.enName : diff.tierName;
      const timeTextDisplay = isEn ? (diff.timeTextEn || diff.timeText) : diff.timeText;
      const finalSubtitle = `§a§l${finalItem.name}§r  ${diff.color}[${tierNameDisplay} (${timeTextDisplay})]`;

      for (const p of activeParticipants) {
        spinningPlayers.delete(p.id);
        try {
          p.onScreenDisplay.setTitle(finalTitle, {
            subtitle: finalSubtitle,
            fadeInDuration: 0,
            stayDuration: 40,
            fadeOutDuration: 10,
          });
          p.playSound("random.levelup", { pitch: 1.2, volume: 1.0 });
        } catch (e) {}
      }

      // Proceed to 3-2-1-GO countdown!
      system.runTimeout(() => {
        startCountdown321(participants, finalItem);
      }, 35);
      return;
    }

    const idx = step + 2;
    const iL2 = reel[idx - 2];
    const iL1 = reel[idx - 1];
    const iCenter = reel[idx];
    const iR1 = reel[idx + 1];
    const iR2 = reel[idx + 2];

    const gTitle = `§8${iL2.icon || "•"}   §7${iL1.icon || "•"}   §e§l▼ §6[ §f${iCenter.icon || "★"} §6] §e§l▼   §7${iR1.icon || "•"}   §8${iR2.icon || "•"}`;
    const gSubtitle = `§e§l▲  §f§l${iCenter.name}  §e§l▲`;
    const pitch = 0.9 + (step / SPIN_STEPS.length) * 0.6;

    for (const p of activeParticipants) {
      try {
        p.onScreenDisplay.setTitle(gTitle, {
          subtitle: gSubtitle,
          fadeInDuration: 0,
          stayDuration: SPIN_STEPS[step] + 4,
          fadeOutDuration: 0,
        });
        p.onScreenDisplay.setActionBar("");
        p.playSound("random.click", { pitch, volume: 0.8 });
      } catch (e) {}
    }

    system.runTimeout(spinTick, SPIN_STEPS[step]);
    step++;
  }

  spinTick();
}

// ---------------------------------------------------------------
// 3 2 1 GO COUNTDOWN
// ---------------------------------------------------------------
function startCountdown321(participants, item) {
  state.roundState = "countdown321";

  // Freeze players during countdown so everyone starts fairly
  for (const p of participants) {
    try {
      p.addEffect("slowness", 80, { amplifier: 255, showParticles: false });
    } catch (e) {}
  }

  const iconDisplay = item.icon ? `${item.icon} ` : "";
  const diff = item.difficulty;

  // Step 3 (0s)
  for (const p of participants) {
    try {
      p.onScreenDisplay.setTitle("§c§l3", {
        subtitle: (!state || state.language !== "th") ? `§fTarget: ${iconDisplay}§b§l${item.name}§r  §7(Get Ready!)` : `§fเป้าหมาย: ${iconDisplay}§b§l${item.name}§r  §7(เตรียมตัว!)`,
        fadeInDuration: 0,
        stayDuration: 22,
        fadeOutDuration: 0,
      });
      p.playSound("note.bass", { pitch: 0.8, volume: 1.0 });
    } catch (e) {}
  }

  // Step 2 (1s)
  system.runTimeout(() => {
    if (state.roundState !== "countdown321") return;
    for (const p of participants) {
      try {
        p.onScreenDisplay.setTitle("§6§l2", {
          subtitle: (!state || state.language !== "th") ? `§fTarget: ${iconDisplay}§b§l${item.name}§r  §7(Steady!)` : `§fเป้าหมาย: ${iconDisplay}§b§l${item.name}§r  §7(ระวัง!)`,
          fadeInDuration: 0,
          stayDuration: 22,
          fadeOutDuration: 0,
        });
        p.playSound("note.bass", { pitch: 1.0, volume: 1.0 });
      } catch (e) {}
    }
  }, 20);

  // Step 1 (2s)
  system.runTimeout(() => {
    if (state.roundState !== "countdown321") return;
    for (const p of participants) {
      try {
        p.onScreenDisplay.setTitle("§e§l1", {
          subtitle: (!state || state.language !== "th") ? `§fTarget: ${iconDisplay}§b§l${item.name}§r  §7(Set!)` : `§fเป้าหมาย: ${iconDisplay}§b§l${item.name}§r  §7(พร้อม!)`,
          fadeInDuration: 0,
          stayDuration: 22,
          fadeOutDuration: 0,
        });
        p.playSound("note.bass", { pitch: 1.2, volume: 1.0 });
      } catch (e) {}
    }
  }, 40);

  // GO! (3s)
  system.runTimeout(() => {
    if (state.roundState !== "countdown321") return;

    for (const p of participants) {
      try {
        p.removeEffect("slowness");
        p.onScreenDisplay.setTitle("§a§l★ GO! GO! GO! ★", {
          subtitle: (!state || state.language !== "th") ? `§fFind ${iconDisplay}§b§l${item.name}§r §efirst to win!` : `§fหา ${iconDisplay}§b§l${item.name}§r §eเป็นคนแรกเพื่อชนะ!`,
          fadeInDuration: 0,
          stayDuration: 40,
          fadeOutDuration: 10,
        });
        p.playSound("random.levelup", { pitch: 1.5, volume: 1.0 });
      } catch (e) {}
    }

    // Set game runtime state
    state.roundState = "running";
    state.startTick = system.currentTick;
    state.pausedElapsedTicks = 0;
    state.lastTickingSecond = -1;
    removeMenuCompassFromAll();
    applyGameEnvironment();
    state.aliveSuddenDeathPlayers = new Set(participants.map((p) => p.id));

    if (state.mode === "countdown") {
      state.timeLimitTicks = Math.round(diff.seconds * 20 * state.timeMultiplier);
    } else {
      state.timeLimitTicks = 0;
    }

    // Record starting item counts
    state.playerStartCounts.clear();
    for (const p of participants) {
      state.playerStartCounts.set(p.id, getItemCount(p, item.id));
    }

    const isEn = !state || state.language !== "th";
    const tierDisplay = isEn ? diff.enName : diff.tierName;
    const timeDisplay = isEn ? (diff.timeTextEn || diff.timeText) : diff.timeText;
    const unitDisplay = isEn ? (diff.unitNameEn || diff.unitName) : diff.unitName;

    world.sendMessage("§e══════════════════════════════════════════");
    if (isEn) {
      world.sendMessage(`§6★ SPEEDRUN ROULETTE - ROUND ${getRoundStr()} STARTED! ★`);
      world.sendMessage("§dCreated by: §e§lPeak4567§r");
      world.sendMessage(`§fObjective: ${iconDisplay}§b§l${item.name}§r`);
      world.sendMessage(`§fTarget Dimension: §b${getDimensionModeName(state.targetDimension)} §7(Journey from Overworld!)`);
      world.sendMessage(`§fDifficulty Setting: §b${getItemDifficultyModeName(state.targetItemDifficulty)}`);
      world.sendMessage(`§fItem Tier: ${diff.color}§l${tierDisplay} §7[Unit: ${unitDisplay}]§r`);
      if (state.mode === "countdown") {
        world.sendMessage(`§fTime Limit: §c⏳ ${timeDisplay} §7(Round ends if time runs out)`);
      } else {
        world.sendMessage(`§fTimer Mode: §a⏱ Count-up §7(No time limit)`);
      }
      if (state.suddenDeath) {
        world.sendMessage("§c💀 Sudden Death: §eYou become a Spectator upon death!");
      }
      world.sendMessage("§aFirst player to obtain it wins this round! GO!!");
    } else {
      world.sendMessage(`§6★ SPEEDRUN ROULETTE - เริ่มตาที่ ${getRoundStr()}! ★`);
      world.sendMessage("§dจัดทำโดย: §e§lPeak4567§r");
      world.sendMessage(`§fเป้าหมาย: ${iconDisplay}§b§l${item.name}§r`);
      world.sendMessage(`§fมิติเป้าหมาย: §b${getDimensionModeName(state.targetDimension)} §7(หาของจากโลกและเดินทางสู่เป้าหมาย!)`);
      world.sendMessage(`§fโหมดความยากการหาของ: §b${getItemDifficultyModeName(state.targetItemDifficulty)}`);
      world.sendMessage(`§fระดับความยากไอเท็มนี้: ${diff.color}§l${tierDisplay} §7[หน่วย: ${unitDisplay}]§r`);
      if (state.mode === "countdown") {
        world.sendMessage(`§fเวลาที่กำหนด: §c⏳ ${timeDisplay} §7(ถ้าหมดเวลาจะเริ่มตาใหม่)`);
      } else {
        world.sendMessage(`§fโหมดเวลา: §a⏱ นับไปข้างหน้าเรื่อยๆ §7(ไม่มีจำกัดเวลา)`);
      }
      if (state.suddenDeath) {
        world.sendMessage("§c💀 โหมดครั้งเดียวตาย (Sudden Death): §eหากตายจะกลายเป็น Spectator เฝ้าดูเพื่อน!");
      }
      world.sendMessage("§aใครหาเจอก่อนเป็นคนแรกคือชนะตานี้! เริ่มได้!!");
    }
    world.sendMessage("§e══════════════════════════════════════════");
  }, 60);
}

// ---------------------------------------------------------------
// WIN & TIME-UP HANDLERS
// ---------------------------------------------------------------
function handleRoundWon(winner, elapsedTicks) {
  state.roundState = "round_ended";
  restoreSpectators(true);
  const item = state.activeItem;
  const timeStr = formatTimerTicks(elapsedTicks);
  const iconDisplay = item.icon ? `${item.icon} ` : "";

  // Update Score
  let scoreData = state.scores.get(winner.id) || { name: winner.name, wins: 0, deaths: 0 };
  scoreData.wins++;
  scoreData.name = winner.name;
  state.scores.set(winner.id, scoreData);

  const isEn = !state || state.language !== "th";
  // Announce to winner
  winner.onScreenDisplay.setTitle(isEn ? "§a★ YOU WON! ★" : "§a★ คุณเป็นผู้ชนะ! ★", {
    subtitle: isEn ? `§eFound ${iconDisplay}§f${item.name} first! (§b${timeStr}§e)` : `§eหา ${iconDisplay}§f${item.name} ได้เป็นคนแรก! (§b${timeStr}§e)`,
    fadeInDuration: 5,
    stayDuration: 60,
    fadeOutDuration: 15,
  });
  winner.playSound("random.levelup", { pitch: 1.0, volume: 1.0 });

  // Announce to everyone else
  for (const p of world.getPlayers()) {
    if (p.id !== winner.id) {
      p.onScreenDisplay.setTitle(isEn ? `§e★ ${winner.name} WON! ★` : `§e★ ${winner.name} ชนะตานี้! ★`, {
        subtitle: isEn ? `§fFound ${iconDisplay}§b${item.name} first! (§e${timeStr}§f)` : `§fหา ${iconDisplay}§b${item.name} ได้ก่อน! (§e${timeStr}§f)`,
        fadeInDuration: 5,
        stayDuration: 60,
        fadeOutDuration: 15,
      });
      p.playSound("random.levelup", { pitch: 0.8, volume: 0.8 });
    }
  }

  world.sendMessage("§6══════════════════════════════════════════");
  if (isEn) {
    world.sendMessage(`§a★ ${winner.name} won Round ${getRoundStr()}! ★`);
    world.sendMessage(`§fFound ${iconDisplay}§b§l${item.name}§r §ffirst in §e${timeStr}§f!`);
    world.sendMessage(`§dTotal score for ${winner.name}: §e${scoreData.wins} wins §7(Deaths: §c${scoreData.deaths || 0}§7)`);
  } else {
    world.sendMessage(`§a★ ${winner.name} ชนะตาที่ ${getRoundStr()}! ★`);
    world.sendMessage(`§fหา ${iconDisplay}§b§l${item.name}§r §fได้สำเร็จเป็นคนแรก ในเวลา §e${timeStr}§f!`);
    world.sendMessage(`§dคะแนนรวมของ ${winner.name}: §e${scoreData.wins} แต้ม §7(ตายสะสม: §c${scoreData.deaths || 0}§7 ครั้ง)`);
  }
  world.sendMessage("§6══════════════════════════════════════════");

  checkNextRoundOrFinish();
}

function handleTimeUp() {
  state.roundState = "round_ended";
  restoreSpectators(true);
  const item = state.activeItem;
  const iconDisplay = item.icon ? `${item.icon} ` : "";
  const isEn = !state || state.language !== "th";
  const allowedTimeStr = isEn ? (item.difficulty.timeTextEn || item.difficulty.timeText) : item.difficulty.timeText;

  world.sendMessage("§c══════════════════════════════════════════");
  if (isEn) {
    world.sendMessage(`§c⏱ Time's Up! (${allowedTimeStr})`);
    world.sendMessage(`§cNobody found ${iconDisplay}§b${item.name} §cin time this round!`);
    world.sendMessage("§e(No deaths penalized. Moving to next round...)");
  } else {
    world.sendMessage(`§c⏱ หมดเวลาแล้ว! (${allowedTimeStr})`);
    world.sendMessage(`§cไม่มีใครหา ${iconDisplay}§b${item.name} §cได้ทันในตานี้!`);
    world.sendMessage("§e(ไม่มีใครตาย กำลังจะไปตาต่อไป...)");
  }
  world.sendMessage("§c══════════════════════════════════════════");

  // Display title & play timeout sound without killing players
  for (const p of world.getPlayers()) {
    try {
      p.onScreenDisplay.setTitle(isEn ? "§c§l⏱ TIME'S UP! §r" : "§c§l⏱ หมดเวลา! §r", {
        subtitle: isEn ? `§eNobody found ${iconDisplay}§b${item.name} in time! Next round coming...` : `§eไม่มีใครหา ${iconDisplay}§b${item.name} §eทัน กำลังไปตาต่อไป...`,
        fadeInDuration: 5,
        stayDuration: 60,
        fadeOutDuration: 15,
      });
      p.playSound("mob.villager.no", { pitch: 1.0, volume: 1.0 });
      p.playSound("random.break", { pitch: 0.8, volume: 0.8 });
    } catch (e) {}
  }

  checkNextRoundOrFinish(4); // Seamlessly proceed to next round in 4 seconds
}

function checkNextRoundOrFinish(delaySeconds = 5) {
  if (state.totalRounds > 0 && state.currentRound >= state.totalRounds) {
    // MATCH COMPLETED!
    system.runTimeout(() => {
      showFinalLeaderboard();
    }, 40);
  } else {
    // PROCEED TO NEXT ROUND
    state.currentRound++;
    const isEn = !state || state.language !== "th";
    world.sendMessage(isEn
      ? `§a[Speedrun Roulette] Next round (Round §e${getRoundStr()}§a) starts in §e${delaySeconds} seconds§a... Get ready!`
      : `§a[Speedrun Roulette] ตาต่อไป (ตาที่ ${getRoundStr()}) จะเริ่มใน §e${delaySeconds} วินาที§a... เตรียมตัว!`);
    state.transitionTimeout = system.runTimeout(() => {
      spinAndStart();
    }, delaySeconds * 20);
  }
}

function showFinalLeaderboard() {
  state.roundState = "idle";
  const topList = getTopRankings(3);

  displayTopRankings(null);

  if (topList.length > 0 && topList[0].wins > 0) {
    const champ = topList[0];
    const second = topList[1];
    const third = topList[2];

    const isEn = !state || state.language !== "th";
    let subText = isEn
      ? `§6🥇 1st: ${champ.name} (${champ.wins} wins | Deaths: ${champ.deaths || 0})`
      : `§6🥇 1: ${champ.name} (ชนะ ${champ.wins} ตา | ตาย ${champ.deaths || 0})`;
    if (second && (second.wins > 0 || (second.deaths || 0) > 0)) {
      subText += isEn
        ? `  §f🥈 2nd: ${second.name} (${second.wins} wins | Deaths: ${second.deaths || 0})`
        : `  §f🥈 2: ${second.name} (${second.wins} ตา | ตาย ${second.deaths || 0})`;
    }
    if (third && (third.wins > 0 || (third.deaths || 0) > 0)) {
      subText += isEn
        ? `  §c🥉 3rd: ${third.name} (${third.wins} wins | Deaths: ${third.deaths || 0})`
        : `  §c🥉 3: ${third.name} (${third.wins} ตา | ตาย ${third.deaths || 0})`;
    }

    for (const p of world.getPlayers()) {
      try {
        p.onScreenDisplay.setTitle(isEn ? "§6★ MATCH CONCLUDED! ★" : "§6★ สรุปผลการแข่งขัน! ★", {
          subtitle: subText,
          fadeInDuration: 10,
          stayDuration: 120,
          fadeOutDuration: 20,
        });
        p.playSound("random.levelup", { pitch: 1.2, volume: 1.0 });
      } catch (e) {}
    }
  }

  const isEn = !state || state.language !== "th";
  world.sendMessage(isEn ? "§d[Speedrun Roulette] Created by: §e§lPeak4567§r" : "§d[Speedrun Roulette] จัดทำโดย: §e§lPeak4567§r");
  world.sendMessage(isEn ? "§eType §a!start §eor §a/speedrun:start §eto start a new match!" : "§eพิมพ์ §a!start §eหรือ §a/speedrun:start §eเพื่อเริ่มแมตช์ใหม่!");

  restoreSpectators(false);
  for (const p of world.getPlayers()) {
    clearPlayerInventoryAndEffects(p);
  }
  teleportAllToWorldSpawn();
  applyLobbyEnvironment();
  giveMenuCompassToAll();
}

// ---------------------------------------------------------------
// RUN CONTROL & STOP
// ---------------------------------------------------------------
function stopRun(initiator = null) {
  if (state.transitionTimeout) {
    system.clearRun(state.transitionTimeout);
    state.transitionTimeout = null;
  }
  state.roundState = "idle";
  state.pausedElapsedTicks = 0;
  spinningPlayers.clear();

  // Reset round back to 1
  state.currentRound = 1;

  for (const p of world.getPlayers()) {
    try {
      p.removeEffect("slowness");
      p.onScreenDisplay.clearTitle();
      p.onScreenDisplay.setActionBar("");
    } catch (e) {}
    // Clear all player inventories, restore full health and hunger
    clearPlayerInventoryAndEffects(p);
    restorePlayerHealthAndHunger(p);
  }

  restoreSpectators(false);
  // Reset bed spawnpoint and teleport all players back to initial world spawn
  teleportAllToWorldSpawn();
  applyLobbyEnvironment();
  giveMenuCompassToAll();

  const isEn = !state || state.language !== "th";
  world.sendMessage(isEn
    ? "§c[Speedrun Roulette] Match stopped. Items cleared, health/hunger restored, bed spawns cleared, and returned to spawn."
    : "§c[Speedrun Roulette] หยุดเกม ลบไอเท็มในตัว รีเลือด/อาหาร ยกเลิกเซฟเตียง และวาร์ปกลับจุดเกิดโลกเรียบร้อยแล้ว");
}

function resetGame(initiator = null) {
  stopRun();
  state.currentRound = 1;
  state.scores.clear();
  state.roundDeaths.clear();

  // 1. Get default world spawn location
  let spawnLoc = { x: 0, y: 100, z: 0 };
  try {
    const loc = world.getDefaultSpawnLocation();
    if (loc) {
      spawnLoc = { x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) };
    }
  } catch (e) {
    console.warn(`[Speedrun Roulette] getDefaultSpawnLocation: ${e}`);
  }

  const overworld = world.getDimension("overworld");

  // 2. Reset spawnpoint for all players to cancel bed saves
  try {
    overworld.runCommand(`spawnpoint @a ${spawnLoc.x} ${spawnLoc.y} ${spawnLoc.z}`);
  } catch (e) {}

  // 3. Clear items, restore health & hunger, and teleport all players back to initial world spawn
  for (const p of world.getPlayers()) {
    state.scores.set(p.id, { name: p.name, wins: 0, deaths: 0 });
    clearPlayerInventoryAndEffects(p);
    restorePlayerHealthAndHunger(p);
    teleportSinglePlayerToWorldSpawn(p);

    const isEn = !state || state.language !== "th";
    try {
      p.onScreenDisplay.setTitle("§c★ RESET ALL ★", {
        subtitle: isEn
          ? "§fItems cleared, health/hunger restored, beds reset, returned to spawn."
          : "§fล้างของ รีเลือด/อาหาร ยกเลิกเตียง และวาร์ปกลับจุดเกิดโลกแล้ว",
        fadeInDuration: 5,
        stayDuration: 60,
        fadeOutDuration: 15,
      });
      p.playSound("random.levelup", { pitch: 0.6, volume: 1.0 });
    } catch (e) {}
  }

  system.runTimeout(() => {
    giveMenuCompassToAll();
  }, 5);

  const isEn = !state || state.language !== "th";
  world.sendMessage("§6══════════════════════════════════════════");
  if (isEn) {
    world.sendMessage("§a[Speedrun Roulette] Game has been fully reset!");
    world.sendMessage("§f• Cleared all player inventories and active effects");
    world.sendMessage(`§f• Teleported all players to initial world spawn (X: ${spawnLoc.x}, Y: ${spawnLoc.y}, Z: ${spawnLoc.z})`);
    world.sendMessage("§f• Reset all scores and rounds back to Round 1!");
  } else {
    world.sendMessage("§a[Speedrun Roulette] รีเซ็ตเกมทั้งหมดเรียบร้อยแล้ว!");
    world.sendMessage("§f• ล้างไอเท็มในตัวของผู้เล่นทุกคน");
    world.sendMessage(`§f• วาร์ปผู้เล่นทุกคนกลับสู่จุดเกิดแรกของโลก (X: ${spawnLoc.x}, Y: ${spawnLoc.y}, Z: ${spawnLoc.z})`);
    world.sendMessage("§f• รีเซ็ตคะแนนและตากลับสู่ตาที่ 1 พร้อมเริ่มใหม่!");
  }
  world.sendMessage("§6══════════════════════════════════════════");
}

// ---------------------------------------------------------------
// PAUSE & RESUME GAME CONTROL
// ---------------------------------------------------------------
function pauseGame(initiator = null) {
  const isEn = !state || state.language !== "th";
  if (state.roundState === "paused") {
    if (initiator) initiator.sendMessage(isEn ? "§e[Speedrun Roulette] Game is already paused (type §a!pause §fto resume)" : "§e[Speedrun Roulette] เกมหยุดชั่วคราวอยู่แล้ว (พิมพ์ §a!pause §fเพื่อเล่นต่อ)");
    return;
  }
  if (state.roundState !== "running") {
    if (initiator) initiator.sendMessage(isEn ? "§c[Speedrun Roulette] Cannot pause (match is not currently running)" : "§c[Speedrun Roulette] ไม่สามารถหยุดเกมได้ (เกมไม่ได้กำลังแข่งขันอยู่)");
    return;
  }

  state.pausedElapsedTicks = system.currentTick - state.startTick;
  state.roundState = "paused";

  const who = initiator ? initiator.name : (isEn ? "Host" : "ผู้ดูแล");
  world.sendMessage("§6══════════════════════════════════════════");
  if (isEn) {
    world.sendMessage(`§e⏸ [Speedrun Roulette] §cGame PAUSED by §f${who}`);
    world.sendMessage("§fTimer is paused. Type §a!pause §for §a/speedrun:pause §for open menu to resume");
  } else {
    world.sendMessage(`§e⏸ [Speedrun Roulette] §cเกมถูกหยุดชั่วคราว (PAUSED) โดย §f${who}`);
    world.sendMessage("§fเวลากำลังหยุดนับ พิมพ์ §a!pause §fหรือ §a/speedrun:pause §fหรือเปิดเมนูเพื่อเล่นต่อ");
  }
  world.sendMessage("§6══════════════════════════════════════════");

  for (const p of world.getPlayers()) {
    try {
      p.onScreenDisplay.setTitle("§c§l⏸ PAUSED §r", {
        subtitle: isEn ? `§eGame paused by ${who}` : `§eเกมถูกหยุดชั่วคราว โดย ${who}`,
        fadeInDuration: 5,
        stayDuration: 60,
        fadeOutDuration: 15,
      });
      p.playSound("random.click", { pitch: 0.8, volume: 1.0 });
    } catch (e) {}
  }
}

function resumeGame(initiator = null) {
  const isEn = !state || state.language !== "th";
  if (state.roundState !== "paused") {
    if (initiator) initiator.sendMessage(isEn ? "§c[Speedrun Roulette] Game is not paused (type §a!start §fto begin)" : "§c[Speedrun Roulette] เกมไม่ได้ถูกหยุดชั่วคราวอยู่ (พิมพ์ §a!start §fเพื่อเริ่มเกม)");
    return;
  }

  state.startTick = system.currentTick - (state.pausedElapsedTicks || 0);
  state.roundState = "running";

  const who = initiator ? initiator.name : (isEn ? "Host" : "ผู้ดูแล");
  world.sendMessage("§6══════════════════════════════════════════");
  if (isEn) {
    world.sendMessage(`§a▶ [Speedrun Roulette] §fGame RESUMED by §e${who}!`);
  } else {
    world.sendMessage(`§a▶ [Speedrun Roulette] §fเริ่มเล่นต่อแล้ว (RESUMED) โดย §e${who}!`);
  }
  world.sendMessage("§6══════════════════════════════════════════");

  for (const p of world.getPlayers()) {
    try {
      p.onScreenDisplay.setTitle("§a§l▶ RESUMED! §r", {
        subtitle: isEn ? "§fTimer resumed, keep hunting!" : "§fเวลานับต่อแล้ว ลุยต่อเลย!",
        fadeInDuration: 0,
        stayDuration: 40,
        fadeOutDuration: 10,
      });
      p.playSound("random.levelup", { pitch: 1.3, volume: 1.0 });
    } catch (e) {}
  }
}

function togglePause(initiator = null) {
  if (state.roundState === "running") {
    pauseGame(initiator);
  } else if (state.roundState === "paused") {
    resumeGame(initiator);
  } else if (state.roundState === "spinning" || state.roundState === "countdown321") {
    if (initiator) {
      const isEn = !state || state.language !== "th";
      initiator.sendMessage(isEn ? "§c[Speedrun Roulette] Roulette is currently spinning. Please wait before pausing!" : "§c[Speedrun Roulette] กำลังสุ่มหรือนับถอยหลังอยู่ กรุณารอสักครู่แล้วค่อยหยุดเกม!");
    }
  } else {
    if (initiator) {
      const isEn = !state || state.language !== "th";
      initiator.sendMessage(isEn ? "§e[Speedrun Roulette] §fYou can only pause while a match is actively running (type §a!start §fto begin)" : "§e[Speedrun Roulette] §fสามารถหยุดเกมชั่วคราวได้เฉพาะตอนที่กำลังแข่งขันอยู่เท่านั้น (พิมพ์ §a!start §fเพื่อเริ่มเกม)");
    }
  }
}

// ---------------------------------------------------------------
// SAFE GUI FORM HANDLER
// ---------------------------------------------------------------
function showFormSafely(player, form, onResponse, maxRetries = 10) {
  if (!player) return;
  try {
    if (typeof player.isValid === "function" && !player.isValid()) return;
  } catch (e) {}

  form.show(player).then((response) => {
    if (response.canceled) {
      const reason = String(response.cancelationReason || "");
      if (
        (reason.includes("UserBusy") ||
         (typeof FormCancelationReason !== "undefined" && response.cancelationReason === FormCancelationReason.UserBusy)) &&
        maxRetries > 0
      ) {
        system.runTimeout(() => {
          showFormSafely(player, form, onResponse, maxRetries - 1);
        }, 5);
      }
      return;
    }
    onResponse(response);
  }).catch((err) => {
    console.warn(`[Speedrun Roulette] Form error: ${err}`);
  });
}

// ---------------------------------------------------------------
// GUI FORMS (SETTINGS & GAME CONTROLS)
// ---------------------------------------------------------------
function getRoundOptions() {
  const isEn = !state || state.language !== "th";
  return [
    { label: isEn ? "Unlimited (inf)" : "ไม่จำกัดรอบ (Unlimited / inf)", value: 0 },
    { label: isEn ? "1 Round (Quick)" : "1 ตา (ตาด่วน)", value: 1 },
    { label: isEn ? "2 Rounds" : "2 ตา", value: 2 },
    { label: isEn ? "3 Rounds" : "3 ตา", value: 3 },
    { label: isEn ? "4 Rounds" : "4 ตา", value: 4 },
    { label: isEn ? "5 Rounds" : "5 ตา", value: 5 },
    { label: isEn ? "6 Rounds" : "6 ตา", value: 6 },
    { label: isEn ? "8 Rounds" : "8 ตา", value: 8 },
    { label: isEn ? "10 Rounds (Default)" : "10 ตา (ค่าเริ่มต้น)", value: 10 },
    { label: isEn ? "12 Rounds" : "12 ตา", value: 12 },
    { label: isEn ? "16 Rounds" : "16 ตา", value: 16 },
    { label: isEn ? "20 Rounds" : "20 ตา", value: 20 },
    { label: isEn ? "30 Rounds" : "30 ตา", value: 30 },
    { label: isEn ? "50 Rounds" : "50 ตา", value: 50 },
    { label: isEn ? "100 Rounds" : "100 ตา", value: 100 },
  ];
}

function getMultiplierOptions() {
  const isEn = !state || state.language !== "th";
  return [
    { label: isEn ? "0.5x (Hardcore / Half Time)" : "0.5x (ยากมาก / เวลาน้อย)", value: 0.5 },
    { label: isEn ? "0.75x (Challenging)" : "0.75x (ท้าทาย)", value: 0.75 },
    { label: isEn ? "1.0x (Normal / Default)" : "1.0x (ปกติ / ค่าเริ่มต้น)", value: 1.0 },
    { label: isEn ? "1.25x (+25% Extra Time)" : "1.25x (เพิ่มเวลา 25%)", value: 1.25 },
    { label: isEn ? "1.5x (Relaxed / +50% Time)" : "1.5x (เล่นสบายๆ)", value: 1.5 },
    { label: isEn ? "2.0x (Double Time)" : "2.0x (เวลาสองเท่า)", value: 2.0 },
  ];
}

function getTimeOptions() {
  const isEn = !state || state.language !== "th";
  return [
    {
      value: "normal",
      label: isEn ? "🔄 Normal Cycle (Default)" : "🔄 ปกติ (Normal Cycle)",
      desc: isEn ? "Standard Minecraft day/night cycle" : "กลางวันและกลางคืนหมุนเวียนปกติ",
      icon: "textures/items/compass_item"
    },
    {
      value: "day",
      label: isEn ? "☀️ Always Day" : "☀️ กลางวันตลอด (Always Day)",
      desc: isEn ? "Lock time to daylight, no night monsters" : "ล็อกเวลาตอนกลางวัน สว่างตลอดเวลา",
      icon: "textures/items/clock_item"
    },
    {
      value: "night",
      label: isEn ? "🌙 Always Night" : "🌙 กลางคืนตลอด (Always Night)",
      desc: isEn ? "Lock time to midnight, nocturnal challenge" : "ล็อกเวลาตอนเที่ยงคืน ท้าทายในความมืด",
      icon: "textures/items/glowstone_dust"
    },
  ];
}

function getMobDifficultyOptions() {
  const isEn = !state || state.language !== "th";
  return [
    {
      value: "peaceful",
      label: isEn ? "🕊 Peaceful (No Monsters)" : "🕊 สงบ (Peaceful)",
      desc: isEn ? "No hostile mobs, health regens automatically" : "ไม่มีมอนสเตอร์ดุร้าย เลือดรีเองตลอดเวลา",
      icon: "textures/items/bread"
    },
    {
      value: "easy",
      label: isEn ? "🟢 Easy" : "🟢 ง่าย (Easy)",
      desc: isEn ? "Monsters deal reduced damage" : "มอนสเตอร์ตีเบา ดาเมจไม่รุนแรง",
      icon: "textures/items/wooden_sword"
    },
    {
      value: "normal",
      label: isEn ? "🟡 Normal (Default)" : "🟡 ปกติ (Normal)",
      desc: isEn ? "Standard survival mob behavior" : "ระดับมาตรฐานของ Minecraft Survival",
      icon: "textures/items/iron_sword"
    },
    {
      value: "hard",
      label: isEn ? "🔴 Hard" : "🔴 ยาก (Hard)",
      desc: isEn ? "Monsters deal maximum damage, zombies break doors" : "มอนสเตอร์ดุร้ายและตีแรง ซอมบี้พังประตู",
      icon: "textures/items/diamond_sword"
    },
  ];
}

function openMainMenu(player) {
  if (!player) return;

  try {
    const isEn = !state || state.language !== "th";
    const form = new ActionFormData();
    form.title(t("mainTitle"));

    let statusLine = t("statusIdle");
    if (state.roundState === "running") statusLine = t("statusRunning");
    else if (state.roundState === "paused") statusLine = t("statusPaused");
    else if (state.roundState === "spinning") statusLine = t("statusSpinning");
    else if (state.roundState === "countdown321") statusLine = t("statusCountdown");

    const modeStr = state.mode === "countdown"
      ? (isEn ? "§c⏳ Countdown" : "§c⏳ นับถอยหลัง")
      : (isEn ? "§a⏱ Count-up" : "§a⏱ นับขึ้นเรื่อยๆ");
    const roundStr = state.totalRounds > 0 ? `${state.currentRound}/${state.totalRounds}` : `${state.currentRound}/∞`;
    const targetItemStr = state.activeItem ? `${state.activeItem.icon || ""} ${state.activeItem.name}` : t("noneYet");
    const timeModeStr = getTimeModeName(state.timeMode);
    const diffStr = getDifficultyName(state.difficulty);
    const dimModeStr = getDimensionModeName(state.targetDimension);
    const itemDiffStr = getItemDifficultyModeName(state.targetItemDifficulty);
    const suddenDeathStr = state.suddenDeath ? t("suddenDeathOn") : t("suddenDeathOff");
    const langDisplay = isEn ? "🇺🇸 English (Default)" : "🇹🇭 ภาษาไทย (Thai)";

    form.body(
      isEn
        ? `§fWelcome to the Speedrun Roulette Control Panel!
` +
          `§dCreated by: §e§lPeak4567§r

` +
          `§f• Language: §b${langDisplay}
` +
          `§f• Status: ${statusLine}
` +
          `§f• Progress: §bRound ${roundStr}
` +
          `§f• Current Target: §e${targetItemStr}
` +
          `§f• Target Dimension: §b${dimModeStr}
` +
          `§f• Item Difficulty: §b${itemDiffStr}
` +
          `§f• Timer Mode: ${modeStr} §7(${state.timeMultiplier}x)
` +
          `§f• Time / Mobs: §e${timeModeStr} §7| §b${diffStr}
` +
          `§f• Sudden Death: ${suddenDeathStr}
` +
          `§f• Online Players: §a${Array.from(world.getPlayers()).length}

` +
          `§7Select an action below:`
        : `§fยินดีต้อนรับสู่แผงควบคุม Speedrun Roulette!
` +
          `§dจัดทำโดย: §e§lPeak4567§r

` +
          `§f• ภาษา (Language): §b${langDisplay}
` +
          `§f• สถานะ: ${statusLine}
` +
          `§f• ความคืบหน้า: §bตาที่ ${roundStr}
` +
          `§f• เป้าหมายปัจจุบัน: §e${targetItemStr}
` +
          `§f• มิติเป้าหมาย: §b${dimModeStr}
` +
          `§f• ความยากการหาของ: §b${itemDiffStr}
` +
          `§f• โหมดจับเวลา: ${modeStr} §7(ตัวคูณ ${state.timeMultiplier}x)
` +
          `§f• เวลา / มอนสเตอร์: §e${timeModeStr} §7| §b${diffStr}
` +
          `§f• โหมดครั้งเดียวตาย: ${suddenDeathStr}
` +
          `§f• ผู้เล่นออนไลน์: §a${Array.from(world.getPlayers()).length} คน

` +
          `§7เลือกคำสั่งที่คุณต้องการด้านล่าง:`
    );

    // Button 0: Start / Pause / Resume
    if (state.roundState === "running") {
      form.button(t("btnPause"), "textures/ui/pause");
    } else if (state.roundState === "paused") {
      form.button(t("btnResume"), "textures/ui/play");
    } else {
      form.button(t("btnStart"), "textures/ui/play");
    }

    // Button 1: Settings
    form.button(t("btnSettings"), "textures/ui/settings");

    // Button 2: Reroll
    form.button(t("btnReroll"), "textures/ui/reroll");

    // Button 3: Stop
    form.button(t("btnStop"), "textures/ui/stop");

    // Button 4: Leaderboard
    form.button(t("btnLeaderboard"), "textures/ui/trophy");

    // Button 5: Reset All
    form.button(t("btnResetAll"), "textures/ui/reset");

    // Button 6: Close - Distinct Red color so it never blends with the gray button background!
    form.button(t("btnClose"), "textures/ui/cancel");

    showFormSafely(player, form, (response) => {
      const sel = response.selection;
      switch (sel) {
        case 0:
          if (state.roundState === "running") {
            pauseGame(player);
          } else if (state.roundState === "paused") {
            resumeGame(player);
          } else {
            spinAndStart(player);
          }
          break;
        case 1:
          system.runTimeout(() => {
            openConfigMenu(player);
          }, 3);
          break;
        case 2:
          handleCommand("reroll", [], player);
          break;
        case 3:
          stopRun(player);
          break;
        case 4:
          system.runTimeout(() => {
            displayTopRankings(player);
          }, 2);
          break;
        case 5:
          system.runTimeout(() => {
            openResetConfirmMenu(player);
          }, 3);
          break;
        default:
          break;
      }
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Menu error: ${err}`);
    showStatus(player);
  }
}

function openConfigMenu(player) {
  if (!player) return;

  try {
    const isEn = !state || state.language !== "th";
    const form = new ActionFormData();
    form.title(t("configTitle"));

    const modeStr = state.mode === "countdown"
      ? (isEn ? "§c⏳ Countdown" : "§c⏳ นับถอยหลัง")
      : (isEn ? "§a⏱ Count-up" : "§a⏱ นับขึ้นเรื่อยๆ");
    const roundsStr = state.totalRounds > 0
      ? (isEn ? `§b${state.totalRounds} Rounds` : `§b${state.totalRounds} ตา`)
      : (isEn ? "§bUnlimited" : "§bไม่จำกัด (Unlimited)");
    const timeStr = getTimeModeName(state.timeMode);
    const diffStr = getDifficultyName(state.difficulty);
    const dimStr = getDimensionModeName(state.targetDimension);
    const itemDiffStr = getItemDifficultyModeName(state.targetItemDifficulty);
    const suddenDeathStr = state.suddenDeath
      ? (isEn ? "§c💀 Enabled (Spectator)" : "§c💀 เปิด (ตายเป็น Spectator)")
      : (isEn ? "§a🟢 Disabled (Normal)" : "§a🟢 ปิด (เกิดใหม่หาต่อได้)");
    const langStr = isEn ? "🇺🇸 English" : "🇹🇭 ภาษาไทย";

    form.body(
      isEn
        ? `§fCustomize match rules & settings:

` +
          `§f• Language: §e${langStr}
` +
          `§f• Target Dimension: §b${dimStr}
` +
          `§f• Item Difficulty: §b${itemDiffStr}
` +
          `§f• Timer Mode: ${modeStr}
` +
          `§f• Match Rounds: ${roundsStr}
` +
          `§f• Time Multiplier: §e${state.timeMultiplier}x
` +
          `§f• World Time: §e${timeStr}
` +
          `§f• Mob Difficulty: §e${diffStr}
` +
          `§f• Sudden Death: ${suddenDeathStr}

` +
          `§7Tap any option below to change:`
        : `§fปรับแต่งการตั้งค่าการแข่งขัน:

` +
          `§f• ภาษา (Language): §e${langStr}
` +
          `§f• มิติเป้าหมาย: §b${dimStr}
` +
          `§f• ความยากการหาของ: §b${itemDiffStr}
` +
          `§f• โหมดจับเวลา: ${modeStr}
` +
          `§f• จำนวนตาการแข่งขัน: ${roundsStr}
` +
          `§f• ตัวคูณเวลา: §e${state.timeMultiplier}x
` +
          `§f• เวลาในโลก: §e${timeStr}
` +
          `§f• ความยากมอนสเตอร์: §e${diffStr}
` +
          `§f• โหมดครั้งเดียวตาย: ${suddenDeathStr}

` +
          `§7แตะที่ปุ่มด้านล่างเพื่อปรับเปลี่ยน:`
    );

    // Buttons with high contrast, reliable icons
    form.button(t("btnDimSetting", { value: dimStr }), "textures/items/compass_item");
    form.button(t("btnItemDiffSetting", { value: itemDiffStr }), "textures/items/diamond");
    form.button(t("btnModeToggle", { value: state.mode === "countdown" ? (isEn ? "Countdown" : "ถอยหลัง") : (isEn ? "Count-up" : "นับขึ้น") }), "textures/items/clock_item");
    form.button(t("btnRoundsSetting", { value: state.totalRounds > 0 ? (isEn ? state.totalRounds + " Rounds" : state.totalRounds + " ตา") : (isEn ? "Unlimited" : "ไม่จำกัด") }), "textures/items/gold_ingot");
    form.button(t("btnMultiplierSetting", { value: `x${state.timeMultiplier}` }), "textures/items/sugar");
    form.button(t("btnWorldTimeSetting", { value: timeStr }), "textures/items/clock_item");
    form.button(t("btnMobDiffSetting", { value: diffStr }), "textures/items/iron_sword");
    form.button(t("btnSuddenDeathSetting", { value: state.suddenDeath ? (isEn ? "ON: Spectator" : "เปิด: Spectator") : (isEn ? "OFF: Normal" : "ปิด: ธรรมดา") }), "textures/items/totem");
    form.button(t("btnLanguageSetting", { value: langStr }), "textures/items/book_writable");
    form.button(t("btnBackMain"), "textures/ui/back");

    showFormSafely(player, form, (response) => {
      const sel = response.selection;
      switch (sel) {
        case 0:
          system.runTimeout(() => openDimensionMenu(player), 3);
          break;
        case 1:
          system.runTimeout(() => openItemDifficultyMenu(player), 3);
          break;
        case 2: {
          state.mode = state.mode === "countdown" ? "countup" : "countdown";
          const newModeStr = state.mode === "countdown"
            ? (isEn ? "§c⏳ Countdown" : "§c⏳ นับถอยหลัง (หมดเวลาคือเริ่มตาใหม่)")
            : (isEn ? "§a⏱ Count-up" : "§a⏱ นับขึ้นเรื่อยๆ (ไม่จำกัดเวลา)");
          world.sendMessage(isEn
            ? `§e[Speedrun Roulette] §fTimer mode set to: ${newModeStr}`
            : `§e[Speedrun Roulette] §fเปลี่ยนโหมดเวลาเป็น: ${newModeStr}`);
          system.runTimeout(() => openConfigMenu(player), 3);
          break;
        }
        case 3:
          system.runTimeout(() => openRoundsSelectMenu(player), 3);
          break;
        case 4:
          system.runTimeout(() => openMultiplierSelectMenu(player), 3);
          break;
        case 5:
          system.runTimeout(() => openTimeModeMenu(player), 3);
          break;
        case 6:
          system.runTimeout(() => openDifficultyMenu(player), 3);
          break;
        case 7:
          state.suddenDeath = !state.suddenDeath;
          world.sendMessage(
            state.suddenDeath
              ? (isEn
                  ? "§c[Speedrun Roulette] §eSudden Death ENABLED! §fPlayers become Spectators upon death until round ends."
                  : "§c[Speedrun Roulette] §eเปิดใช้งานโหมดครั้งเดียวตาย (Sudden Death)! §fหากตายระหว่างหาของจะกลายเป็น Spectator ทันที")
              : (isEn
                  ? "§a[Speedrun Roulette] §eSudden Death DISABLED! §fPlayers can respawn and keep searching."
                  : "§a[Speedrun Roulette] §eปิดโหมดครั้งเดียวตาย! §fผู้เล่นที่ตายจะสามารถเกิดใหม่และหาของต่อได้ปกติ")
          );
          system.runTimeout(() => openConfigMenu(player), 3);
          break;
        case 8:
          system.runTimeout(() => openLanguageMenu(player), 3);
          break;
        case 9:
          system.runTimeout(() => openMainMenu(player), 3);
          break;
      }
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Settings form error: ${err}`);
  }
}

function openDimensionMenu(player) {
  if (!player) return;
  try {
    const isEn = !state || state.language !== "th";
    const form = new ActionFormData();
    form.title(t("dimTitle"));
    form.body(t("dimBody", { current: getDimensionModeName(state.targetDimension) }));

    const options = getDimensionOptions();
    for (const opt of options) {
      const isCur = opt.value === state.targetDimension ? "§a✔ " : "";
      form.button(`${isCur}${opt.label}
§7${opt.desc}`, opt.icon || "textures/items/compass_item");
    }
    // High contrast Red Back Button
    form.button(t("btnBack"), "textures/ui/back");

    showFormSafely(player, form, (response) => {
      const sel = response.selection;
      if (sel === undefined || sel < 0 || sel === options.length) {
        system.runTimeout(() => openConfigMenu(player), 3);
        return;
      }
      const chosen = options[sel];
      state.targetDimension = chosen.value;
      world.sendMessage(isEn
        ? `§e[Speedrun Roulette] §fTarget dimension set to: §b${chosen.label}`
        : `§e[Speedrun Roulette] §fตั้งค่ามิติเป้าหมายเป็น: §b${chosen.label}`);
      system.runTimeout(() => openConfigMenu(player), 3);
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Dimension menu error: ${err}`);
  }
}

function openItemDifficultyMenu(player) {
  if (!player) return;
  try {
    const isEn = !state || state.language !== "th";
    const form = new ActionFormData();
    form.title(t("diffTitle"));
    form.body(t("diffBody", { current: getItemDifficultyModeName(state.targetItemDifficulty) }));

    const options = getItemDifficultyOptions();
    for (const opt of options) {
      const isCur = String(opt.value) === String(state.targetItemDifficulty) ? "§a✔ " : "";
      form.button(`${isCur}${opt.label}
§7${opt.desc}`, opt.icon || "textures/items/diamond");
    }
    // High contrast Red Back Button
    form.button(t("btnBack"), "textures/ui/back");

    showFormSafely(player, form, (response) => {
      const sel = response.selection;
      if (sel === undefined || sel < 0 || sel === options.length) {
        system.runTimeout(() => openConfigMenu(player), 3);
        return;
      }
      const chosen = options[sel];
      state.targetItemDifficulty = chosen.value;
      world.sendMessage(isEn
        ? `§e[Speedrun Roulette] §fItem difficulty set to: §b${chosen.label}`
        : `§e[Speedrun Roulette] §fตั้งค่าระดับความยากการหาของเป็น: §b${chosen.label}`);
      system.runTimeout(() => openConfigMenu(player), 3);
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Item difficulty menu error: ${err}`);
  }
}

function openLanguageMenu(player) {
  if (!player) return;
  try {
    const isEn = !state || state.language !== "th";
    const form = new ActionFormData();
    form.title(t("langTitle"));
    form.body(t("langBody", { current: isEn ? "🇺🇸 English (Default)" : "🇹🇭 ภาษาไทย (Thai)" }));

    const isEnCur = state.language === "en" ? "§a✔ " : "";
    const isThCur = state.language === "th" ? "§a✔ " : "";

    form.button(`${isEnCur}🇺🇸 English (Default)
§7Set all menus, timers, and messages to English`, "textures/items/book_normal");
    form.button(`${isThCur}🇹🇭 ภาษาไทย (Thai)
§7เปลี่ยนเมนู ตัวจับเวลา และข้อความทั้งหมดเป็นภาษาไทย`, "textures/items/book_writable");
    form.button(t("btnBack"), "textures/ui/back");

    showFormSafely(player, form, (response) => {
      const sel = response.selection;
      if (sel === undefined || sel < 0 || sel === 2) {
        system.runTimeout(() => openConfigMenu(player), 3);
        return;
      }
      if (sel === 0) {
        state.language = "en";
        world.sendMessage("§a[Speedrun Roulette] §fLanguage changed to: §e🇺🇸 English (Default)");
      } else if (sel === 1) {
        state.language = "th";
        world.sendMessage("§a[Speedrun Roulette] §fเปลี่ยนภาษาเป็น: §e🇹🇭 ภาษาไทย (Thai)");
      }
      system.runTimeout(() => openConfigMenu(player), 3);
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Language menu error: ${err}`);
  }
}

function openTimeModeMenu(player) {
  if (!player) return;
  try {
    const isEn = !state || state.language !== "th";
    const form = new ActionFormData();
    form.title(isEn ? "§6☀️ World Time Settings" : "§6☀️ ตั้งค่าเวลาในเกม (Time Mode)");
    form.body(isEn ? `§fCurrent World Time: §e${getTimeModeName(state.timeMode)}

§7Select time preference:` : `§fโหมดเวลาปัจจุบัน: §e${getTimeModeName(state.timeMode)}

§7แตะเลือกรูปแบบเวลาที่คุณต้องการ:`);

    const options = getTimeOptions();
    for (const opt of options) {
      const isCur = opt.value === state.timeMode ? "§a✔ " : "";
      form.button(`${isCur}${opt.label}
§7${opt.desc}`, opt.icon || "textures/items/clock_item");
    }
    form.button(t("btnBack"), "textures/ui/back");

    showFormSafely(player, form, (response) => {
      const sel = response.selection;
      if (sel === undefined || sel < 0 || sel === options.length) {
        system.runTimeout(() => openConfigMenu(player), 3);
        return;
      }
      const chosen = options[sel];
      state.timeMode = chosen.value;
      world.sendMessage(isEn
        ? `§e[Speedrun Roulette] §fWorld time set to: §b${chosen.label}`
        : `§e[Speedrun Roulette] §fตั้งค่าเวลาในเกมเป็น: §b${chosen.label}`);
      if (state.roundState === "running") {
        applyGameEnvironment();
      }
      system.runTimeout(() => openConfigMenu(player), 3);
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Time menu error: ${err}`);
  }
}

function openDifficultyMenu(player) {
  if (!player) return;
  try {
    const isEn = !state || state.language !== "th";
    const form = new ActionFormData();
    form.title(isEn ? "§6👾 Mob Difficulty Settings" : "§6👾 ปรับความยากมอนสเตอร์");
    form.body(isEn ? `§fCurrent Mob Difficulty: §e${getDifficultyName(state.difficulty)}

§7Select mob difficulty:` : `§fความยากปัจจุบัน: §e${getDifficultyName(state.difficulty)}

§7แตะเลือกความยากของมอนสเตอร์:`);

    const options = getMobDifficultyOptions();
    for (const opt of options) {
      const isCur = opt.value === state.difficulty ? "§a✔ " : "";
      form.button(`${isCur}${opt.label}
§7${opt.desc}`, opt.icon || "textures/items/iron_sword");
    }
    form.button(t("btnBack"), "textures/ui/back");

    showFormSafely(player, form, (response) => {
      const sel = response.selection;
      if (sel === undefined || sel < 0 || sel === options.length) {
        system.runTimeout(() => openConfigMenu(player), 3);
        return;
      }
      const chosen = options[sel];
      state.difficulty = chosen.value;
      world.sendMessage(isEn
        ? `§e[Speedrun Roulette] §fMob difficulty set to: §b${chosen.label}`
        : `§e[Speedrun Roulette] §fตั้งค่าความยากมอนสเตอร์เป็น: §b${chosen.label}`);
      if (state.roundState === "running") {
        applyGameEnvironment();
      }
      system.runTimeout(() => openConfigMenu(player), 3);
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Difficulty menu error: ${err}`);
  }
}

function openRoundsSelectMenu(player) {
  if (!player) return;

  try {
    const isEn = !state || state.language !== "th";
    const form = new ActionFormData();
    form.title(isEn ? "§6🎯 Select Match Rounds" : "§6🎯 เลือกจำนวนตาการแข่งขัน");
    form.body(isEn
      ? `§fCurrent Rounds: §e${state.totalRounds > 0 ? state.totalRounds + ' Rounds' : 'Unlimited (inf)'}

§7Choose total rounds for the match:`
      : `§fจำนวนตาปัจจุบัน: §e${state.totalRounds > 0 ? state.totalRounds + ' ตา' : 'ไม่จำกัด (Unlimited)'}

§7แตะเลือกจำนวนตาที่ต้องการ:`);

    const options = getRoundOptions();
    for (const opt of options) {
      const isCur = opt.value === state.totalRounds ? "§a✔ " : "";
      form.button(`${isCur}${opt.label}`, "textures/items/gold_ingot");
    }
    form.button(t("btnBack"), "textures/ui/back");

    showFormSafely(player, form, (response) => {
      const sel = response.selection;
      if (sel === undefined || sel < 0 || sel === options.length) {
        system.runTimeout(() => openConfigMenu(player), 3);
        return;
      }
      const chosen = options[sel];
      state.totalRounds = chosen.value;
      const str = chosen.value > 0 ? (isEn ? `§b${chosen.value} Rounds` : `§b${chosen.value} ตา`) : (isEn ? "§bUnlimited" : "§bไม่จำกัดรอบ (Unlimited)");
      world.sendMessage(isEn
        ? `§e[Speedrun Roulette] §fMatch rounds set to: ${str}`
        : `§e[Speedrun Roulette] §fตั้งค่าจำนวนตาเป็น: ${str}`);
      system.runTimeout(() => openConfigMenu(player), 3);
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Rounds menu error: ${err}`);
  }
}

function openMultiplierSelectMenu(player) {
  if (!player) return;

  try {
    const isEn = !state || state.language !== "th";
    const form = new ActionFormData();
    form.title(isEn ? "§6⚡ Adjust Time Multiplier" : "§6⚡ ปรับตัวคูณเวลา");
    form.body(isEn
      ? `§fCurrent Multiplier: §e${state.timeMultiplier}x

§7Select countdown time multiplier:`
      : `§fตัวคูณเวลาปัจจุบัน: §e${state.timeMultiplier}x

§7เลือกตัวคูณเวลาสำหรับโหมดนับถอยหลัง:`);

    const options = getMultiplierOptions();
    for (const opt of options) {
      const isCur = Math.abs(opt.value - state.timeMultiplier) < 0.05 ? "§a✔ " : "";
      form.button(`${isCur}${opt.label}`, "textures/items/sugar");
    }
    form.button(t("btnBack"), "textures/ui/back");

    showFormSafely(player, form, (response) => {
      const sel = response.selection;
      if (sel === undefined || sel < 0 || sel === options.length) {
        system.runTimeout(() => openConfigMenu(player), 3);
        return;
      }
      const chosen = options[sel];
      state.timeMultiplier = chosen.value;
      world.sendMessage(isEn
        ? `§e[Speedrun Roulette] §fTime multiplier set to: §e${chosen.value}x`
        : `§e[Speedrun Roulette] §fตั้งค่าตัวคูณเวลาเป็น: §e${chosen.value}x`);
      system.runTimeout(() => openConfigMenu(player), 3);
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Multiplier menu error: ${err}`);
  }
}

function openResetConfirmMenu(player) {
  if (!player) return;

  try {
    const isEn = !state || state.language !== "th";
    const form = new MessageFormData();
    form.title(t("resetTitle"));
    form.body(t("resetBody"));
    form.button1("§c" + (isEn ? "Confirm Reset" : "ยืนยันรีเซ็ต (Reset)"));
    form.button2("§f" + (isEn ? "Cancel" : "ยกเลิก (Cancel)"));

    showFormSafely(player, form, (response) => {
      if (response.selection === 0) {
        resetGame(player);
      }
    });
  } catch (err) {
    player.sendMessage(`§c[Speedrun Roulette] Reset confirm error: ${err}`);
  }
}

function showStatus(player) {
  const isEn = !state || state.language !== "th";
  const modeStr = state.mode === "countdown"
    ? (isEn ? "§c⏳ Countdown" : "§c⏳ นับถอยหลัง (หมดเวลาคือเริ่มตาใหม่)")
    : (isEn ? "§a⏱ Count-up" : "§a⏱ นับไปข้างหน้าเรื่อยๆ");
  const roundsStr = state.totalRounds > 0
    ? (isEn ? `§b${state.totalRounds} Rounds` : `§b${state.totalRounds} ตา`)
    : (isEn ? "§bUnlimited" : "§bไม่จำกัด (Unlimited)");
  const curRoundStr = isEn ? `§eRound ${getRoundStr()}` : `§eตาที่ ${getRoundStr()}`;
  const stateStr = state.roundState === "running"
    ? (isEn ? "§aRunning" : "§aกำลังแข่งขัน")
    : state.roundState === "paused"
    ? (isEn ? "§cPAUSED" : "§cหยุดชั่วคราว (PAUSED)")
    : state.roundState === "spinning"
    ? (isEn ? "§eSpinning" : "§eกำลังสุ่ม")
    : (isEn ? "§7Idle" : "§7หยุดพัก (Idle)");

  const timeModeStr = getTimeModeName(state.timeMode);
  const diffStr = getDifficultyName(state.difficulty);
  const suddenDeathStr = state.suddenDeath
    ? (isEn ? "§c💀 Enabled (Spectator on death)" : "§c💀 เปิด (ตายเป็น Spectator)")
    : (isEn ? "§a🟢 Disabled" : "§a🟢 ปิด");

  player.sendMessage("§6══════ [ Speedrun Roulette Status ] ══════");
  player.sendMessage("§d" + (isEn ? "Created by: §e§lPeak4567§r" : "จัดทำโดย: §e§lPeak4567§r"));
  player.sendMessage(`§f• ${isEn ? "Language" : "ภาษา"}: §b${isEn ? "🇺🇸 English" : "🇹🇭 ภาษาไทย"}`);
  player.sendMessage(`§f• ${isEn ? "Target Dimension" : "มิติเป้าหมาย"}: §b${getDimensionModeName(state.targetDimension)}`);
  player.sendMessage(`§f• ${isEn ? "Timer Mode" : "โหมดจับเวลา"}: ${modeStr}`);
  player.sendMessage(`§f• ${isEn ? "Total Rounds" : "จำนวนตาทั้งหมด"}: ${roundsStr}`);
  player.sendMessage(`§f• ${isEn ? "Progress" : "ความคืบหน้า"}: ${curRoundStr} (${stateStr})`);
  player.sendMessage(`§f• ${isEn ? "Time Multiplier" : "ตัวคูณเวลา"}: §e${state.timeMultiplier}x`);
  player.sendMessage(`§f• ${isEn ? "Environment" : "สภาพแวดล้อม"}: §e${timeModeStr} §7| §b${diffStr}`);
  player.sendMessage(`§f• ${isEn ? "Sudden Death" : "โหมดครั้งเดียวตาย"}: ${suddenDeathStr}`);
  player.sendMessage(`§f• ${isEn ? "Items in Pool" : "จำนวนไอเท็มในระบบ"}: §b${ITEM_POOL.length}`);
  player.sendMessage("§6──────────────────────────────────────────");
  player.sendMessage(isEn ? "§e★ Current TOP 1 - 3 Leaderboard:" : "§e★ อันดับ TOP 1 - 3 ปัจจุบัน:");

  const topList = getTopRankings(3);
  const medals = isEn ? ["§6🥇 1st Place", "§f🥈 2nd Place", "§c🥉 3rd Place"] : ["§6🥇 อันดับ 1", "§f🥈 อันดับ 2", "§c🥉 อันดับ 3"];
  for (let i = 0; i < 3; i++) {
    const entry = topList[i];
    if (entry && (entry.wins > 0 || (entry.deaths || 0) > 0)) {
      player.sendMessage(isEn
        ? `§f  ${medals[i]}: §e§l${entry.name}§r §f- Won §a${entry.wins}§f rounds §7| Deaths: §c${entry.deaths || 0}§7`
        : `§f  ${medals[i]}: §e§l${entry.name}§r §f- ชนะ §a${entry.wins}§f ตา §7| ตาย §c${entry.deaths || 0}§7 ครั้ง`);
    } else if (entry) {
      player.sendMessage(isEn
        ? `§f  ${medals[i]}: §7${entry.name} §8(0 wins | 0 deaths)`
        : `§f  ${medals[i]}: §7${entry.name} §8(ชนะ 0 ตา | ตาย 0 ครั้ง)`);
    } else {
      player.sendMessage(`§f  ${medals[i]}: §7- ${isEn ? "Empty" : "ว่าง"} -`);
    }
  }
  player.sendMessage("§6══════════════════════════════════════════");
}

function showHelp(player) {
  const isEn = !state || state.language !== "th";
  if (isEn) {
    player.sendMessage("§6═══════ [ Speedrun Roulette Commands ] ═══════");
    player.sendMessage("§dCreated by: §e§lPeak4567§r");
    player.sendMessage("§e/speedrun:menu §for §e!menu §7- Open GUI menu for settings & controls");
    player.sendMessage("§e/speedrun:compass §for §e!compass §7- Receive game menu compass");
    player.sendMessage("§e/speedrun:dimension <all|overworld|nether|end> §7- Set target objective dimension");
    player.sendMessage("§e/speedrun:lang <en|th> §for §e!lang <en|th> §7- Switch language (English / Thai)");
    player.sendMessage("§e/speedrun:pause §for §e!pause §7- Pause / resume game (Toggle)");
    player.sendMessage("§e/speedrun:resume §for §e!resume §7- Resume paused game");
    player.sendMessage("§e/speedrun:start §for §e!start §7- Start competition / roll objective");
    player.sendMessage("§e/speedrun:rounds <number> §7- Set number of rounds (e.g. 1, 5, 10 or inf)");
    player.sendMessage("§e/speedrun:mode <countdown|countup> §7- Set timer mode (countdown/countup)");
    player.sendMessage("§e/speedrun:timemode <day|night|normal> §7- Set world time (day/night/normal)");
    player.sendMessage("§e/speedrun:diff <peaceful|easy|normal|hard> §7- Set mob difficulty");
    player.sendMessage("§e/speedrun:suddendeath §for §e!suddendeath §7- Toggle Spectator on death");
    player.sendMessage("§e/speedrun:top §for §e!top §7- View TOP 1-3 leaderboard");
    player.sendMessage("§e/speedrun:reroll §7- Reroll current round objective");
    player.sendMessage("§e/speedrun:stop §7- Stop round, clear items, and return to spawn");
    player.sendMessage("§e/speedrun:reset §7- Clear everything, reset scores, return to spawn");
    player.sendMessage("§e/speedrun:status §7- View current match settings & ranks");
    player.sendMessage("§6══════════════════════════════════════════════");
  } else {
    player.sendMessage("§6═══════ [ คำสั่ง Speedrun Roulette ] ═══════");
    player.sendMessage("§dจัดทำโดย: §e§lPeak4567§r");
    player.sendMessage("§e/speedrun:menu §fหรือ §e!menu §7- เปิดเมนู GUI ตั้งค่าและควบคุมเกม");
    player.sendMessage("§e/speedrun:compass §fหรือ §e!compass §7- รับเข็มทิศเปิดเมนูเกม");
    player.sendMessage("§e/speedrun:dimension <all|overworld|nether|end> §7- กำหนดมิติเป้าหมายที่ต้องการสุ่มหา");
    player.sendMessage("§e/speedrun:lang <en|th> §fหรือ §e!lang <en|th> §7- สลับภาษา (อังกฤษ / ไทย)");
    player.sendMessage("§e/speedrun:pause §fหรือ §e!pause §7- หยุดเกมชั่วคราว / เล่นต่อ (Toggle)");
    player.sendMessage("§e/speedrun:resume §fหรือ §e!resume §7- เล่นเกมต่อหลังจากการหยุด");
    player.sendMessage("§e/speedrun:start §fหรือ §e!start §7- เริ่มแข่งขัน / สุ่มกาชา");
    player.sendMessage("§e/speedrun:rounds <ตัวเลข> §7- กำหนดจำนวนตา (เช่น 1, 5, 10 หรือ inf)");
    player.sendMessage("§e/speedrun:mode <countdown|countup> §7- ปรับโหมดจับเวลา (ถอยหลัง/นับขึ้น)");
    player.sendMessage("§e/speedrun:timemode <day|night|normal> §7- ปรับเวลาในโลก (เช้า/กลางคืน/ปกติ)");
    player.sendMessage("§e/speedrun:diff <peaceful|easy|normal|hard> §7- ปรับความยากมอนสเตอร์");
    player.sendMessage("§e/speedrun:suddendeath §fหรือ §e!suddendeath §7- เปิด/ปิดโหมดตายเป็น Spectator");
    player.sendMessage("§e/speedrun:top §fหรือ §e!top §7- ดูอันดับ 1-3 ผู้ชนะสูงสุด");
    player.sendMessage("§e/speedrun:reroll §7- สุ่มไอเท็มใหม่ในตานี้");
    player.sendMessage("§e/speedrun:stop §7- หยุดรอบ ล้างของในตัว และวาร์ปกลับจุดเกิดโลก");
    player.sendMessage("§e/speedrun:reset §7- ล้างของทั้งหมด รีเซ็ตคะแนน และกลับจุดเกิดโลก");
    player.sendMessage("§e/speedrun:status §7- ดูการตั้งค่าและอันดับปัจจุบัน");
    player.sendMessage("§6══════════════════════════════════════════");
  }
}

// ---------------------------------------------------------------
// COMMAND DISPATCHER
// ---------------------------------------------------------------
function handleCommand(cmd, args, player) {
  const isEn = !state || state.language !== "th";
  switch (cmd) {
    case "menu":
    case "ui":
    case "gui":
      openMainMenu(player);
      break;

    case "settings":
    case "config":
      if (args[0] === "edit") {
        openConfigMenu(player);
      } else {
        openMainMenu(player);
      }
      break;

    case "pause":
      togglePause(player);
      break;

    case "resume":
    case "unpause":
      resumeGame(player);
      break;

    case "start":
      if (state.roundState === "paused") {
        resumeGame(player);
        return;
      }
      if (state.roundState === "idle" && state.currentRound > (state.totalRounds || 1)) {
        state.currentRound = 1;
      }
      spinAndStart(player);
      break;

    case "reroll":
      if (state.roundState === "spinning" || state.roundState === "countdown321") {
        player.sendMessage(isEn ? "§c[Speedrun Roulette] Already rolling or counting down, please wait!" : "§c[Speedrun Roulette] กำลังสุ่มอยู่ กรุณารอสักครู่!");
        return;
      }
      spinAndStart(player);
      break;

    case "stop":
      stopRun(player);
      break;

    case "reset":
      resetGame(player);
      break;

    case "status":
      showStatus(player);
      break;

    case "top":
    case "rank":
    case "ranking":
    case "leaderboard":
      displayTopRankings(player);
      break;

    case "mode": {
      const arg = (args[0] || "").toLowerCase().trim();
      if (arg === "countdown" || arg === "cd" || arg === "down") {
        state.mode = "countdown";
        world.sendMessage(isEn
          ? "§e[Speedrun Roulette] §fTimer mode set to: §c⏳ Countdown (Fail if time runs out!)"
          : "§e[Speedrun Roulette] §fเปลี่ยนโหมดเวลาเป็น: §c⏳ นับถอยหลัง (ถ้าหมดเวลาคือตาย!)");
      } else if (arg === "countup" || arg === "up" || arg === "normal") {
        state.mode = "countup";
        world.sendMessage(isEn
          ? "§e[Speedrun Roulette] §fTimer mode set to: §a⏱ Count-up (Unlimited time)"
          : "§e[Speedrun Roulette] §fเปลี่ยนโหมดเวลาเป็น: §a⏱ นับไปข้างหน้าเรื่อยๆ (ไม่จำกัดเวลา)");
      } else {
        // Toggle if no arg
        state.mode = state.mode === "countdown" ? "countup" : "countdown";
        const newStr = state.mode === "countdown"
          ? (isEn ? "§c⏳ Countdown (Time limit per item)" : "§c⏳ นับถอยหลัง (มีเวลาจำกัดตามไอเท็ม)")
          : (isEn ? "§a⏱ Count-up (Unlimited time)" : "§a⏱ นับไปข้างหน้าเรื่อยๆ");
        world.sendMessage(isEn ? `§e[Speedrun Roulette] §fSwitched timer mode to: ${newStr}` : `§e[Speedrun Roulette] §fสลับโหมดเวลาเป็น: ${newStr}`);
      }
      break;
    }

    case "rounds":
    case "round": {
      const arg = (args[0] || "").toLowerCase().trim();
      if (!arg) {
        player.sendMessage(isEn
          ? `§e[Speedrun Roulette] §fCurrent match rounds: §b${state.totalRounds > 0 ? state.totalRounds + ' rounds' : 'Unlimited'}`
          : `§e[Speedrun Roulette] §fจำนวนตาปัจจุบัน: §b${state.totalRounds > 0 ? state.totalRounds + ' ตา' : 'ไม่จำกัด (Unlimited)'}`);
        player.sendMessage(isEn
          ? "§7Suggested even numbers: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20... up to 100 or inf"
          : "§7ตัวเลือกเลขคู่แนะนำ: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20... ถึง 100 หรือ inf");
        player.sendMessage(isEn
          ? "§7Usage: /speedrun:rounds <number> or !rounds <number>"
          : "§7วิธีใช้: /speedrun:rounds <ตัวเลข> หรือ !rounds <ตัวเลข>");
        return;
      }
      if (arg === "inf" || arg === "infinite" || arg === "unlimited" || arg === "0") {
        state.totalRounds = 0;
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fSet match rounds to: §bUnlimited!" : "§e[Speedrun Roulette] §fตั้งค่าจำนวนตาเป็น: §bไม่จำกัดรอบ (Unlimited)!");
      } else {
        const n = parseInt(arg, 10);
        if (isNaN(n) || n < 1) {
          player.sendMessage(isEn ? "§c[Speedrun Roulette] Please specify rounds as a number (e.g. 2, 4, 6, 8, 10... 100 or inf)" : "§c[Speedrun Roulette] กรุณาระบุจำนวนตาเป็นตัวเลข (เช่น 2, 4, 6, 8, 10... 100 หรือ inf)");
          return;
        }
        state.totalRounds = n;
        world.sendMessage(isEn
          ? `§e[Speedrun Roulette] §fSet match rounds to: §b${n} rounds§f! (Progress: Round ${getRoundStr()})`
          : `§e[Speedrun Roulette] §fตั้งค่าจำนวนตาเป็น: §b${n} ตา§f! (ความคืบหน้า: ตาที่ ${getRoundStr()})`);
      }
      break;
    }

    case "poolsize":
      player.sendMessage(isEn
        ? `§e[Speedrun Roulette] §fTotal items in pool: §b${ITEM_POOL.length}§f items`
        : `§e[Speedrun Roulette] §fมีไอเท็มในระบบทั้งหมด §b${ITEM_POOL.length}§f ชนิด`);
      break;

    case "ping":
      player.sendMessage(
        poolLoadError
          ? (isEn ? `§c[Speedrun Roulette] Script running with Fallback Pool (${poolLoadError.message}). Count: ${ITEM_POOL.length}` : `§c[Speedrun Roulette] Script ทำงานอยู่ แต่ใช้ Fallback Pool (${poolLoadError.message}). จำนวน ${ITEM_POOL.length}`)
          : (isEn ? `§a[Speedrun Roulette] Script running perfectly! Pool has ${ITEM_POOL.length} items` : `§a[Speedrun Roulette] Script ทำงานสมบูรณ์! Pool มีไอเท็ม ${ITEM_POOL.length} ชนิด`)
      );
      break;

    case "dimension":
    case "dim": {
      const arg = (args[0] || "").toLowerCase().trim();
      if (arg === "overworld" || arg === "ow" || arg === "world") {
        state.targetDimension = "overworld";
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fTarget dimension set to: §a🌿 Overworld Only" : "§e[Speedrun Roulette] §fตั้งค่ามิติเป้าหมายเป็น: §a🌿 โลกปกติ (Overworld Only)");
      } else if (arg === "nether" || arg === "net" || arg === "hell") {
        state.targetDimension = "nether";
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fTarget dimension set to: §c🔥 Nether Only" : "§e[Speedrun Roulette] §fตั้งค่ามิติเป้าหมายเป็น: §c🔥 นรก (Nether Only)");
      } else if (arg === "the_end" || arg === "end" || arg === "theend") {
        state.targetDimension = "the_end";
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fTarget dimension set to: §d🌌 The End Only" : "§e[Speedrun Roulette] §fตั้งค่ามิติเป้าหมายเป็น: §d🌌 มิติมังกร (The End Only)");
      } else if (arg === "all" || arg === "any" || arg === "everything") {
        state.targetDimension = "all";
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fTarget dimension set to: §e🌐 All Dimensions" : "§e[Speedrun Roulette] §fตั้งค่ามิติเป้าหมายเป็น: §e🌐 รวมทุกมิติ (All Dimensions)");
      } else {
        openDimensionMenu(player);
      }
      break;
    }

    case "timemode":
    case "time": {
      const arg = (args[0] || "").toLowerCase().trim();
      if (arg === "day") {
        state.timeMode = "day";
      } else if (arg === "night") {
        state.timeMode = "night";
      } else if (arg === "normal" || arg === "cycle") {
        state.timeMode = "normal";
      } else {
        openTimeModeMenu(player);
        return;
      }
      world.sendMessage(isEn
        ? `§e[Speedrun Roulette] §fWorld time set to: §b${getTimeModeName(state.timeMode)}`
        : `§e[Speedrun Roulette] §fตั้งค่าเวลาในเกมเป็น: §b${getTimeModeName(state.timeMode)}`);
      if (state.roundState === "running") applyGameEnvironment();
      break;
    }

    case "itemdiff":
    case "itemmode":
    case "itemdifficulty": {
      const arg = (args[0] || "").toLowerCase().trim();
      if (arg === "1" || arg === "veryeasy" || arg === "easyมาก" || arg === "ง่ายมาก") {
        state.targetItemDifficulty = 1;
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fItem difficulty set to: §a🟢 Very Easy" : "§e[Speedrun Roulette] §fตั้งค่าความยากการหาของเป็น: §a🟢 ง่ายมาก (Very Easy)");
      } else if (arg === "2" || arg === "easy" || arg === "ง่าย") {
        state.targetItemDifficulty = 2;
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fItem difficulty set to: §2🟡 Easy" : "§e[Speedrun Roulette] §fตั้งค่าความยากการหาของเป็น: §2🟡 ง่าย (Easy)");
      } else if (arg === "3" || arg === "medium" || arg === "normal" || arg === "กลาง" || arg === "ปานกลาง") {
        state.targetItemDifficulty = 3;
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fItem difficulty set to: §e🟠 Medium" : "§e[Speedrun Roulette] §fตั้งค่าความยากการหาของเป็น: §e🟠 กลาง (Medium)");
      } else if (arg === "4" || arg === "hard" || arg === "ยาก") {
        state.targetItemDifficulty = 4;
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fItem difficulty set to: §6🔴 Hard" : "§e[Speedrun Roulette] §fตั้งค่าความยากการหาของเป็น: §6🔴 ยาก (Hard)");
      } else if (arg === "5" || arg === "extreme" || arg === "veryhard" || arg === "ยากมาก") {
        state.targetItemDifficulty = 5;
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fItem difficulty set to: §c🟣 Extreme" : "§e[Speedrun Roulette] §fตั้งค่าความยากการหาของเป็น: §c🟣 ยากมาก (Extreme)");
      } else if (arg === "all" || arg === "any" || arg === "รวม") {
        state.targetItemDifficulty = "all";
        world.sendMessage(isEn ? "§e[Speedrun Roulette] §fItem difficulty set to: §d🎲 All Difficulties" : "§e[Speedrun Roulette] §fตั้งค่าความยากการหาของเป็น: §d🎲 รวมทุกระดับ (All)");
      } else {
        openItemDifficultyMenu(player);
      }
      break;
    }

    case "lang":
    case "language": {
      const arg = (args[0] || "").toLowerCase().trim();
      if (arg === "en" || arg === "eng" || arg === "english") {
        state.language = "en";
        world.sendMessage("§a[Speedrun Roulette] §fLanguage set to: §e🇺🇸 English (Default)");
      } else if (arg === "th" || arg === "thai" || arg === "ไทย") {
        state.language = "th";
        world.sendMessage("§a[Speedrun Roulette] §fเปลี่ยนภาษาเป็น: §e🇹🇭 ภาษาไทย (Thai)");
      } else {
        openLanguageMenu(player);
      }
      break;
    }

    case "difficulty":
    case "diff": {
      const arg = (args[0] || "").toLowerCase().trim();
      if (args[0] === "item") {
        const sub = (args[1] || "").toLowerCase().trim();
        handleCommand("itemdiff", [sub], player);
        return;
      }
      if (["peaceful", "easy", "normal", "hard"].includes(arg)) {
        state.difficulty = arg;
        world.sendMessage(isEn
          ? `§e[Speedrun Roulette] §fMob difficulty set to: §b${getDifficultyName(state.difficulty)}`
          : `§e[Speedrun Roulette] §fตั้งค่าความยากมอนสเตอร์เป็น: §b${getDifficultyName(state.difficulty)}`);
        if (state.roundState === "running") applyGameEnvironment();
      } else {
        openDifficultyMenu(player);
      }
      break;
    }

    case "suddendeath":
    case "hardcore": {
      state.suddenDeath = !state.suddenDeath;
      world.sendMessage(
        state.suddenDeath
          ? (isEn
              ? "§c[Speedrun Roulette] §eSudden Death enabled! §fPlayers become Spectators upon death until round ends."
              : "§c[Speedrun Roulette] §eเปิดใช้งานโหมดครั้งเดียวตาย (Sudden Death)! §fหากตายจะกลายเป็น Spectator เฝ้าดูเพื่อน")
          : (isEn
              ? "§a[Speedrun Roulette] §eSudden Death disabled! §fPlayers can respawn and keep searching."
              : "§a[Speedrun Roulette] §eปิดโหมดครั้งเดียวตาย! §fผู้เล่นที่ตายจะสามารถเกิดใหม่และหาของต่อได้ปกติ")
      );
      break;
    }

    case "compass":
      giveMenuCompass(player);
      player.sendMessage(isEn
        ? "§a[Speedrun Roulette] Speedrun Menu Compass given to your inventory!"
        : "§a[Speedrun Roulette] มอบเข็มทิศเมนูเกมให้คุณเรียบร้อยแล้ว!");
      break;

    case "help":
    default:
      showHelp(player);
      break;
  }
}

// ---------------------------------------------------------------
// COMMAND REGISTRATION (SLASH COMMANDS)
// ---------------------------------------------------------------
system.beforeEvents.startup.subscribe((event) => {
  const customCommandRegistry = event && event.customCommandRegistry;
  if (!customCommandRegistry) return;

  const base = {
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
  };

  const stringType = (typeof CustomCommandParamType !== "undefined" && CustomCommandParamType.String)
    ? CustomCommandParamType.String
    : "String";

  // Register rounds enum: 2, 4, 6, 8, 10 ... up to 100, and inf
  const evenRounds = [];
  for (let i = 2; i <= 100; i += 2) {
    evenRounds.push(String(i));
  }
  evenRounds.push("inf");

  try {
    if (typeof customCommandRegistry.registerEnum === "function") {
      customCommandRegistry.registerEnum("speedrun:round_choices", evenRounds);
      customCommandRegistry.registerEnum("speedrun:mode_choices", ["countdown", "countup"]);
    }
  } catch (e) {
    console.warn(`[Speedrun Roulette] registerEnum: ${e}`);
  }

  // 1. speedrun:rounds with enum choices (2, 4, 6, 8... 100, inf)
  try {
    const roundsParamType = (typeof CustomCommandParamType !== "undefined" && CustomCommandParamType.Enum)
      ? CustomCommandParamType.Enum
      : stringType;

    customCommandRegistry.registerCommand(
      {
        ...base,
        name: "speedrun:rounds",
        description: "Set total match rounds (choose 2, 4, 6... to 100 or inf)",
        optionalParameters: [
          {
            name: "speedrun:round_choices",
            type: roundsParamType,
          },
        ],
      },
      (origin, arg) => {
        const player = origin.sourceEntity || origin.entity;
        system.run(() => {
          if (player) {
            let val = arg;
            if (arg && typeof arg === "object") {
              val = arg["speedrun:round_choices"] || Object.values(arg)[0];
            }
            const args = (val !== undefined && val !== null) ? [String(val)] : [];
            handleCommand("rounds", args, player);
          }
        });
      }
    );
  } catch (e) {
    console.warn(`[Speedrun Roulette] Failed to register speedrun:rounds with enum: ${e}`);
  }

  // 2. speedrun:mode with enum choices (countdown, countup)
  try {
    const modeParamType = (typeof CustomCommandParamType !== "undefined" && CustomCommandParamType.Enum)
      ? CustomCommandParamType.Enum
      : stringType;

    customCommandRegistry.registerCommand(
      {
        ...base,
        name: "speedrun:mode",
        description: "Set timer mode (countdown or countup)",
        optionalParameters: [
          {
            name: "speedrun:mode_choices",
            type: modeParamType,
          },
        ],
      },
      (origin, arg) => {
        const player = origin.sourceEntity || origin.entity;
        system.run(() => {
          if (player) {
            let val = arg;
            if (arg && typeof arg === "object") {
              val = arg["speedrun:mode_choices"] || Object.values(arg)[0];
            }
            const args = (val !== undefined && val !== null) ? [String(val)] : [];
            handleCommand("mode", args, player);
          }
        });
      }
    );
  } catch (e) {
    console.warn(`[Speedrun Roulette] Failed to register speedrun:mode with enum: ${e}`);
  }

  // 3. Other slash commands
  const standardCommands = [
    ["speedrun:lang", "Switch language (English / Thai)"],
    ["speedrun:language", "Switch language (English / Thai)"],
    ["speedrun:menu", "Open GUI menu for settings and controls"],
    ["speedrun:settings", "Open game settings menu (GUI)"],
    ["speedrun:pause", "Pause or resume match timer (Toggle Pause)"],
    ["speedrun:resume", "Resume paused match"],
    ["speedrun:start", "Spin roulette and start match"],
    ["speedrun:reroll", "Reroll current target objective"],
    ["speedrun:stop", "Stop current round and return to spawn"],
    ["speedrun:reset", "Reset all scores and return to spawn"],
    ["speedrun:status", "View current match settings and scores"],
    ["speedrun:top", "View Top 1-3 leaderboard rankings"],
    ["speedrun:rank", "View Top 1-3 leaderboard rankings"],
    ["speedrun:help", "View all command guides"],
    ["speedrun:poolsize", "View total items in pool"],
    ["speedrun:ping", "Check addon script status"],
  ];

  for (const [name, description] of standardCommands) {
    const sub = name.split(":")[1];
    try {
      customCommandRegistry.registerCommand({ ...base, name, description }, (origin) => {
        const player = origin.sourceEntity || origin.entity;
        system.run(() => {
          if (player) handleCommand(sub, [], player);
        });
      });
    } catch (e) {
      console.warn(`[Speedrun Roulette] Failed to register ${name}: ${e}`);
    }
  }
});

// ---------------------------------------------------------------
// BACKUP CHAT COMMANDS (!start, !mode, !rounds, /speedrun ...)
// ---------------------------------------------------------------
try {
  world.beforeEvents.chatSend.subscribe((eventData) => {
    const text = eventData.message.trim();
    if (!text.startsWith("!") && !text.startsWith("/")) return;

    const parts = text.split(/\s+/);
    let rawCmd = parts[0].toLowerCase();
    let args = parts.slice(1);

    // Support: /speedrun rounds 10, !speedrun rounds 10, /speedrun mode countdown, etc.
    if ((rawCmd === "/speedrun" || rawCmd === "!speedrun") && parts.length > 1) {
      rawCmd = "!" + parts[1].toLowerCase();
      args = parts.slice(2);
    }

    const aliases = {
      // menu & settings
      "!lang": "lang",
      "/lang": "lang",
      "/speedrun:lang": "lang",
      "!language": "lang",
      "/language": "lang",
      "/speedrun:language": "lang",
      "!menu": "menu",
      "/menu": "menu",
      "!ui": "menu",
      "/ui": "menu",
      "!gui": "menu",
      "/gui": "menu",
      "!settings": "settings",
      "/settings": "settings",
      "!config": "settings",
      "/config": "settings",
      "/speedrun:menu": "menu",
      "/speedrun:settings": "settings",
      "/speedrun:config": "settings",

      // pause & resume
      "!pause": "pause",
      "/pause": "pause",
      "/speedrun:pause": "pause",
      "!resume": "resume",
      "/resume": "resume",
      "!unpause": "resume",
      "/unpause": "resume",
      "/speedrun:resume": "resume",

      // start
      "!start": "start",
      "/start": "start",
      "/speedrun:start": "start",

      // rounds
      "!rounds": "rounds",
      "!round": "rounds",
      "/rounds": "rounds",
      "/round": "rounds",
      "/speedrun:rounds": "rounds",
      "/speedrun:round": "rounds",

      // mode
      "!mode": "mode",
      "/mode": "mode",
      "/speedrun:mode": "mode",

      // top 1-3 / ranking / leaderboard
      "!top": "top",
      "/top": "top",
      "!rank": "top",
      "/rank": "top",
      "!ranking": "top",
      "/ranking": "top",
      "!leaderboard": "top",
      "/leaderboard": "top",
      "/speedrun:top": "top",
      "/speedrun:rank": "top",
      "/speedrun:leaderboard": "top",

      // reroll
      "!reroll": "reroll",
      "/reroll": "reroll",
      "/speedrun:reroll": "reroll",

      // stop
      "!stop": "stop",
      "/stop": "stop",
      "/speedrun:stop": "stop",

      // reset
      "!reset": "reset",
      "/reset": "reset",
      "/speedrun:reset": "reset",

      // status / settings
      "!status": "status",
      "/status": "status",
      "!settings": "status",
      "/settings": "status",
      "/speedrun:status": "status",
      "/speedrun:settings": "status",

      // help
      "!help": "help",
      "/help": "help",
      "/speedrun:help": "help",

      // dimension
      "!dimension": "dimension",
      "/dimension": "dimension",
      "/speedrun:dimension": "dimension",
      "!dim": "dimension",
      "/dim": "dimension",
      "/speedrun:dim": "dimension",
      "!overworld": "dimension",
      "/speedrun:overworld": "dimension",
      "!nether": "dimension",
      "/speedrun:nether": "dimension",
      "!end": "dimension",
      "/speedrun:end": "dimension",
      // time, difficulty, sudden death, compass
      "!timemode": "timemode",
      "/timemode": "timemode",
      "/speedrun:timemode": "timemode",
      "!time": "timemode",
      "/time": "timemode",
      "!diff": "difficulty",
      "/diff": "difficulty",
      "!itemdiff": "itemdiff",
      "/itemdiff": "itemdiff",
      "!itemmode": "itemdiff",
      "/itemmode": "itemdiff",
      "!item": "itemdiff",
      "/item": "itemdiff",
      "/speedrun:diff": "difficulty",
      "!difficulty": "difficulty",
      "/difficulty": "difficulty",
      "!suddendeath": "suddendeath",
      "/suddendeath": "suddendeath",
      "/speedrun:suddendeath": "suddendeath",
      "!hardcore": "suddendeath",
      "/hardcore": "suddendeath",
      "!compass": "compass",
      "/compass": "compass",
      "/speedrun:compass": "compass",

      // poolsize & ping
      "!poolsize": "poolsize",
      "/speedrun:poolsize": "poolsize",
      "!ping": "ping",
      "/speedrun:ping": "ping",
    };

    if (aliases[rawCmd]) {
      eventData.cancel = true;
      const sub = aliases[rawCmd];
      system.run(() => handleCommand(sub, args, eventData.sender));
    }
  });
} catch (e) {
  console.warn(`[Speedrun Roulette] Chat command error: ${e}`);
}

// ---------------------------------------------------------------
// MAIN TICK LOOP (Updates Actionbar, checks Win & Time's up)
// ---------------------------------------------------------------
system.runInterval(() => {
  // If paused, keep actionbar updated with frozen timer and PAUSED notice
  if (state.roundState === "paused" && state.activeItem) {
    const item = state.activeItem;
    const iconPrefix = item.icon ? `§6[ §f${item.icon} §6] ` : "";
    const isEn = !state || state.language !== "th";
    const roundPrefix = isEn ? `§e[Round ${getRoundStr()}] ` : `§e[ตา ${getRoundStr()}] `;
    const pausedTimeStr = state.mode === "countdown"
      ? `§c⏳ ${formatTimerTicks(Math.max(0, state.timeLimitTicks - state.pausedElapsedTicks))}`
      : `§f⏱ §e${formatTimerTicks(state.pausedElapsedTicks)}`;

    const pauseHint = isEn ? "type !pause to resume" : "พิมพ์ !pause เพื่อเล่นต่อ";
    const actionbarText = `§c⏸ [PAUSED] ${roundPrefix}${iconPrefix}§b${item.name}  §7|  ${pausedTimeStr}  §7|  §e${pauseHint}`;
    for (const p of world.getPlayers()) {
      try {
        p.onScreenDisplay.setActionBar(actionbarText);
      } catch (e) {}
    }
    return;
  }

  if (state.roundState !== "running" || !state.activeItem) return;

  const item = state.activeItem;
  const elapsed = system.currentTick - state.startTick;
  const iconPrefix = item.icon ? `§6[ §f${item.icon} §6] ` : "";
  const isEn = !state || state.language !== "th";
  const roundPrefix = isEn ? `§e[Round ${getRoundStr()}] ` : `§e[ตา ${getRoundStr()}] `;
  const diff = item.difficulty;

  // 1. In Countdown mode: Check time's up and format remaining
  let timeDisplay = "";
  if (state.mode === "countdown") {
    const remainingTicks = state.timeLimitTicks - elapsed;

    if (remainingTicks <= 0) {
      handleTimeUp();
      return;
    }

    // Audio warning in last 10 seconds
    const remainingSeconds = Math.ceil(remainingTicks / 20);
    if (remainingSeconds <= 10 && remainingSeconds !== state.lastTickingSecond) {
      state.lastTickingSecond = remainingSeconds;
      for (const p of world.getPlayers()) {
        try {
          const pitch = 1.4 + (10 - remainingSeconds) * 0.08;
          p.playSound("random.click", { pitch, volume: 1.0 });
        } catch (e) {}
      }
    }

    // Color code time
    let timeColor = "§a";
    if (remainingTicks <= 200) {
      timeColor = "§c§l"; // < 10s: flashing red
    } else if (remainingTicks <= 600) {
      timeColor = "§6";   // < 30s: orange
    } else if (remainingTicks <= 1200) {
      timeColor = "§e";   // < 60s: yellow
    }

    timeDisplay = `${timeColor}⏳ ${formatTimerTicks(remainingTicks)}`;
  } else {
    // Count-up mode
    timeDisplay = `§f⏱ §e${formatTimerTicks(elapsed)}`;
  }

  // 2. Actionbar display for all online players
  const tierNameDisp = isEn ? diff.enName : diff.tierName;
  const actionbarText = `${roundPrefix}${iconPrefix}§b${item.name}  §7|  ${timeDisplay}  §7|  ${diff.color}[${tierNameDisp}]`;
  for (const p of world.getPlayers()) {
    try {
      p.onScreenDisplay.setActionBar(actionbarText);
    } catch (e) {}
  }

  // 3. Check for Winner (First to obtain target item wins)
  for (const p of world.getPlayers()) {
    const currentCount = getItemCount(p, item.id);
    const startCount = state.playerStartCounts.get(p.id) || 0;

    if (currentCount > startCount) {
      handleRoundWon(p, elapsed);
      return;
    }
  }

  // 4. Lobby maintenance (supply compass when in idle)
  if (state.roundState === "idle" && system.currentTick % 40 === 0) {
    giveMenuCompassToAll();
  }
}, 1);

// ---------------------------------------------------------------
// ITEM USE LISTENER (Menu Compass Right-Click)
// ---------------------------------------------------------------
world.afterEvents.itemUse.subscribe((event) => {
  try {
    const item = event.itemStack;
    const player = event.source;
    if (!item || !player) return;

    if (isMenuCompass(item)) {
      openMainMenu(player);
    }
  } catch (err) {
    console.warn(`[Speedrun Roulette] itemUse error: ${err}`);
  }
});

// ---------------------------------------------------------------
// PLAYER SPAWN GREETING
// ---------------------------------------------------------------
world.afterEvents.playerSpawn.subscribe((event) => {
  const p = event.player;
  if (!p) return;

  if (state.roundState === "idle") {
    giveMenuCompass(p);
  } else {
    removeMenuCompass(p);
  }

  if (event.initialSpawn) {
    if (state.roundState === "idle") {
      applyLobbyEnvironment();
      // When game is idle, teleport rejoining players to spawn, cancel bed spawn, and restore health/hunger
      system.runTimeout(() => {
        try {
          if (!p.isValid()) return;
          teleportSinglePlayerToWorldSpawn(p);
          restorePlayerHealthAndHunger(p);
        } catch (e) {}
      }, 5);
    }

    // Deliver welcome greeting after world loading completes
    system.runTimeout(() => {
      try {
        if (!p.isValid()) return;
        p.sendMessage(t("welcomeBanner"));
        p.onScreenDisplay.setTitle(t("welcomeTitle"), {
          subtitle: t("welcomeSubtitle"),
          fadeInDuration: 10,
          stayDuration: 70,
          fadeOutDuration: 20,
        });
        p.playSound("random.orb", { pitch: 1.0, volume: 1.0 });
        if (state.roundState === "idle") {
          giveMenuCompass(p);
        }
      } catch (e) {}
    }, 20);
  } else {
    // Player respawn handling after death
    if ((state.roundState === "running" || state.roundState === "countdown321") && !state.suddenDeath) {
      // Respawn safely at a new location in the round's world instead of initial spawn
      system.runTimeout(() => {
        teleportSinglePlayerToRandomLocation(p);
      }, 2);
    }
  }
});

// ---------------------------------------------------------------
// PLAYER DEATH TRACKER (Tracks deaths during item hunting & Sudden Death)
// ---------------------------------------------------------------
world.afterEvents.entityDie.subscribe((eventData) => {
  const victim = eventData.deadEntity;
  if (!victim || victim.typeId !== "minecraft:player") return;

  let scoreData = state.scores.get(victim.id) || { name: victim.name, wins: 0, deaths: 0 };
  scoreData.deaths = (scoreData.deaths || 0) + 1;
  scoreData.name = victim.name;
  state.scores.set(victim.id, scoreData);

  // If game is actively running (during an objective search round)
  if (state.roundState === "running") {
    state.roundDeaths.set(victim.id, (state.roundDeaths.get(victim.id) || 0) + 1);
    const roundD = state.roundDeaths.get(victim.id);
    const isEn = !state || state.language !== "th";
    world.sendMessage(isEn
      ? `§c💀 [Speedrun Roulette] §e${victim.name} §cdied while hunting! §7(Round deaths: §e${roundD}§7 | Total: §c${scoreData.deaths}§7)`
      : `§c💀 [Speedrun Roulette] §e${victim.name} §cเสียชีวิตระหว่างหาของ! §7(ตานี้ตาย: §e${roundD}§7 | สะสม: §c${scoreData.deaths}§7 ครั้ง)`);

    if (!state.suddenDeath) {
      victim.sendMessage(isEn
        ? "§e🎲 When you press Respawn, you will respawn safely in this round's Overworld area!"
        : "§e🎲 เมื่อคุณกดปุ่มเกิดใหม่ (Respawn) ระบบจะสุ่มตำแหน่งเกิดใหม่ให้คุณทันที!");
    }

    // Hardcore / Sudden Death mode: convert to spectator to watch friends until someone wins!
    if (state.suddenDeath) {
      if (state.aliveSuddenDeathPlayers) {
        state.aliveSuddenDeathPlayers.delete(victim.id);
      }
      world.sendMessage(isEn
        ? `§c👻 [Sudden Death] §e${victim.name} §centered Spectator mode to watch until someone wins!`
        : `§c👻 [Sudden Death] §e${victim.name} §cเข้าสู่โหมด Spectator เพื่อเฝ้าดูเพื่อนจนกว่าจะมีคนชนะ!`);
      system.runTimeout(() => {
        try {
          victim.runCommand("gamemode spectator @s");
          victim.sendMessage(isEn ? "§c👻 You became a Spectator until the round ends!" : "§c👻 คุณกลายเป็น Spectator เฝ้าดูเพื่อนจนกว่ารอบนี้จะจบลง!");
        } catch (e) {}
      }, 10);

      // If all participants died, end round
      if (state.aliveSuddenDeathPlayers && state.aliveSuddenDeathPlayers.size === 0) {
        world.sendMessage(isEn
          ? "§4💀 [Sudden Death] All participants have died! Ending round with no winner..."
          : "§4💀 [Sudden Death] ผู้เล่นทุกคนเสียชีวิตทั้งหมดแล้ว! จบรอบนี้โดยไม่มีผู้ชนะ...");
        system.runTimeout(() => {
          handleTimeUp();
        }, 30);
      }
    }
  }
});

// Apply initial lobby environment and supply compass on world start
system.runTimeout(() => {
  if (state.roundState === "idle") {
    applyLobbyEnvironment();
    giveMenuCompassToAll();
  }
}, 20);
