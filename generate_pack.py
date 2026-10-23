import os
import re
import json
import uuid
import zipfile
from PIL import Image

WORKSPACE = r"c:\Users\User\Downloads\MineCraft"
TEX_BASE = os.path.join(WORKSPACE, r"bedrock_assets\resource_pack")
JAVA_ITEMS = os.path.join(WORKSPACE, r"temp_assets\assets\minecraft\textures\item")
JAVA_BLOCKS = os.path.join(WORKSPACE, r"temp_assets\assets\minecraft\textures\block")
ROULETTE_DIR = os.path.join(WORKSPACE, "extracted_roulette")
RP_DIR = os.path.join(WORKSPACE, "SpeedrunRoulette_RP")

def load_clean_json(rel):
    with open(os.path.join(TEX_BASE, rel), "r", encoding="utf-8") as f:
        clean = re.sub(r"//.*", "", f.read())
        return json.loads(clean)

item_tex_data = load_clean_json(r"textures\item_texture.json").get("texture_data", {})
terrain_tex_data = load_clean_json(r"textures\terrain_texture.json").get("texture_data", {})

def resolve_bedrock(entry):
    t = entry.get("textures")
    candidates = []
    if isinstance(t, str):
        candidates = [t]
    elif isinstance(t, list):
        for item in t:
            if isinstance(item, str):
                candidates.append(item)
            elif isinstance(item, dict) and "path" in item:
                candidates.append(item["path"])
    elif isinstance(t, dict) and "path" in t:
        candidates = [t["path"]]
    for c in candidates:
        for ext in [".png", ".tga"]:
            p = os.path.join(TEX_BASE, c.replace("/", os.sep) + ext)
            if os.path.exists(p):
                return p
    return None

def find_texture(short_id):
    # 1. Java item
    p = os.path.join(JAVA_ITEMS, f"{short_id}.png")
    if os.path.exists(p): return p

    # 2. Bedrock item_texture
    if short_id in item_tex_data:
        r = resolve_bedrock(item_tex_data[short_id])
        if r: return r

    # 3. Java block
    p = os.path.join(JAVA_BLOCKS, f"{short_id}.png")
    if os.path.exists(p): return p

    # 4. Bedrock terrain_texture
    if short_id in terrain_tex_data:
        r = resolve_bedrock(terrain_tex_data[short_id])
        if r: return r

    # 5. Permutations
    permutations = [
        f"turtle_{short_id}",
        short_id.replace("cooked_", "") + "_cooked",
        short_id.replace("golden_", "") + "_golden",
        short_id.replace("_ball", "ball"),
        f"{short_id}_item",
        f"{short_id}_top",
        f"{short_id}_front",
        f"{short_id}_side",
        f"{short_id}_normal",
        f"{short_id}_standby",
        f"{short_id}_00",
        f"dye_powder_{short_id}",
    ]
    for perm in permutations:
        p = os.path.join(JAVA_ITEMS, f"{perm}.png")
        if os.path.exists(p): return p
        p = os.path.join(JAVA_BLOCKS, f"{perm}.png")
        if os.path.exists(p): return p
        if perm in item_tex_data:
            r = resolve_bedrock(item_tex_data[perm])
            if r: return r
        if perm in terrain_tex_data:
            r = resolve_bedrock(terrain_tex_data[perm])
            if r: return r

    return None

# Priority items (Speedrun Roulette fallback & common survival objectives)
PRIORITY_ITEMS = [
    "diamond", "emerald", "iron_ingot", "gold_ingot", "copper_ingot", "netherite_scrap", "netherite_ingot",
    "lapis_lazuli", "redstone", "amethyst_shard", "quartz", "blaze_rod", "ender_pearl",
    "ender_eye", "ghast_tear", "magma_cream", "shulker_shell", "chorus_fruit", "obsidian",
    "glowstone_dust", "prismarine_shard", "prismarine_crystals", "scute", "honeycomb",
    "honey_bottle", "golden_apple", "enchanted_golden_apple", "golden_carrot", "cooked_beef",
    "cooked_porkchop", "cooked_mutton", "cooked_chicken", "cooked_cod", "cooked_salmon",
    "cake", "cookie", "pumpkin_pie", "bread", "apple", "bone", "string", "spider_eye",
    "gunpowder", "feather", "rabbit_hide", "rabbit_foot", "slime_ball", "ink_sac", "glow_ink_sac",
    "phantom_membrane", "nautilus_shell", "totem_of_undying", "heart_of_the_sea", "book", "clock",
    "compass", "fishing_rod", "saddle", "name_tag", "shears", "flint_and_steel", "bow", "crossbow",
    "arrow", "shield", "trident", "spyglass", "brush", "mace", "breeze_rod", "wind_charge",
    "trial_key", "ominous_trial_key", "ominous_bottle", "bundle",
    "wooden_sword", "wooden_pickaxe", "wooden_axe", "wooden_shovel", "wooden_hoe",
    "stone_sword", "stone_pickaxe", "stone_axe", "stone_shovel", "stone_hoe",
    "iron_sword", "iron_pickaxe", "iron_axe", "iron_shovel", "iron_hoe",
    "golden_sword", "golden_pickaxe", "golden_axe", "golden_shovel", "golden_hoe",
    "diamond_sword", "diamond_pickaxe", "diamond_axe", "diamond_shovel", "diamond_hoe",
    "netherite_sword", "netherite_pickaxe", "netherite_axe", "netherite_shovel", "netherite_hoe",
    "leather_helmet", "leather_chestplate", "leather_leggings", "leather_boots",
    "chainmail_helmet", "chainmail_chestplate", "chainmail_leggings", "chainmail_boots",
    "iron_helmet", "iron_chestplate", "iron_leggings", "iron_boots",
    "golden_helmet", "golden_chestplate", "golden_leggings", "golden_boots",
    "diamond_helmet", "diamond_chestplate", "diamond_leggings", "diamond_boots",
    "netherite_helmet", "netherite_chestplate", "netherite_leggings", "netherite_boots",
    "coal", "charcoal", "flint", "wheat", "wheat_seeds", "pumpkin_seeds", "melon_seeds",
    "beetroot", "beetroot_seeds", "carrot", "potato", "baked_potato", "poisonous_potato",
    "melon_slice", "glistering_melon_slice", "sugar", "sugar_cane", "egg", "leather",
    "milk_bucket", "water_bucket", "lava_bucket", "bucket", "snowball", "clay_ball",
    "brick", "netherbrick", "paper", "firework_rocket", "firework_star", "glass_bottle",
    "potion", "splash_potion", "lingering_potion", "experience_bottle", "lead",
    "blaze_powder", "fermented_spider_eye", "magma_cream", "brewing_stand", "cauldron",
    "anvil", "crafting_table", "furnace", "smoker", "blast_furnace", "chest", "trapped_chest",
    "barrel", "dispenser", "dropper", "hopper", "piston", "sticky_piston", "observer",
    "repeater", "comparator", "daylight_detector", "redstone_torch", "redstone_lamp",
    "lever", "stone_button", "oak_button", "tripwire_hook", "target", "lectern", "loom",
    "cartography_table", "fletching_table", "smithing_table", "grindstone", "stonecutter",
    "bell", "lantern", "soul_lantern", "campfire", "soul_campfire", "beehive", "bee_nest",
    "lodestone", "respawn_anchor", "crying_obsidian", "shulker_box", "ender_chest",
    "enchanting_table", "beacon", "conduit", "sponge", "wet_sponge", "tnt",
    "oak_log", "spruce_log", "birch_log", "jungle_log", "acacia_log", "dark_oak_log",
    "mangrove_log", "cherry_log", "pale_oak_log", "bamboo_block", "crimson_stem", "warped_stem",
    "oak_planks", "spruce_planks", "birch_planks", "jungle_planks", "acacia_planks",
    "dark_oak_planks", "mangrove_planks", "cherry_planks", "bamboo_planks", "crimson_planks", "warped_planks",
    "stone", "cobblestone", "mossy_cobblestone", "smooth_stone", "stone_bricks", "mossy_stone_bricks",
    "cracked_stone_bricks", "chiseled_stone_bricks", "granite", "polished_granite", "diorite",
    "polished_diorite", "andesite", "polished_andesite", "deepslate", "cobbled_deepslate",
    "polished_deepslate", "deepslate_bricks", "deepslate_tiles", "tuff", "polished_tuff",
    "tuff_bricks", "calcite", "dripstone_block", "pointed_dripstone", "amethyst_block",
    "budding_amethyst", "dirt", "coarse_dirt", "rooted_dirt", "mud", "mud_bricks", "clay",
    "gravel", "sand", "red_sand", "sandstone", "red_sandstone", "ice", "packed_ice", "blue_ice",
    "snow_block", "coal_ore", "deepslate_coal_ore", "iron_ore", "deepslate_iron_ore",
    "copper_ore", "deepslate_copper_ore", "gold_ore", "deepslate_gold_ore", "redstone_ore",
    "deepslate_redstone_ore", "emerald_ore", "deepslate_emerald_ore", "lapis_ore", "deepslate_lapis_ore",
    "diamond_ore", "deepslate_diamond_ore", "nether_gold_ore", "nether_quartz_ore", "ancient_debris",
    "raw_iron", "raw_copper", "raw_gold", "raw_iron_block", "raw_copper_block", "raw_gold_block",
    "coal_block", "iron_block", "copper_block", "gold_block", "redstone_block", "emerald_block",
    "lapis_block", "diamond_block", "netherite_block", "netherrack", "soul_sand", "soul_soil",
    "basalt", "smooth_basalt", "blackstone", "polished_blackstone", "polished_blackstone_bricks",
    "glowstone", "sea_lantern", "magma_block", "end_stone", "end_stone_bricks", "purpur_block",
    "purpur_pillar", "prismarine", "prismarine_bricks", "dark_prismarine", "hay_block",
    "target", "honey_block", "slime_block", "bone_block", "sculk", "sculk_catalyst",
    "sculk_sensor", "sculk_shrieker", "sculk_vein"
]

EXCLUDE_KEYWORDS = [
    "chemistry", "compound", "element", "camera", "command_block",
    "structure_", "debug", "border_block", "barrier", "jigsaw",
    "light_block", "reserved", "invisible", "moving_block", "unknown",
    "spawn_egg", "bedrock", "allow", "deny", "client_request_placeholder",
    "the_client_side_ai_predicted", "underwater_tnt", "sea_pickle_air",
    "_template", "piston_arm", "portal", "fire", "lava", "water", "tripwire",
    "redstone_wire", "bubble_column", "frosted_ice", "carrots", "potatoes",
    "beetroots", "cocoa", "stem", "wall_banner", "wall_torch", "wall_sign",
    "wall_hanging_sign", "wall_fan"
]

def is_excluded(name):
    return any(k in name for k in EXCLUDE_KEYWORDS)

print("Gathering items and building glyph sheets...")
item_list = []
seen = set()

# Add priority items first
for item in PRIORITY_ITEMS:
    tex = find_texture(item)
    if tex and item not in seen and not is_excluded(item):
        seen.add(item)
        item_list.append((item, tex))

# Add remaining items from item_texture.json
for k in item_tex_data.keys():
    if k not in seen and not is_excluded(k):
        tex = find_texture(k)
        if tex:
            seen.add(k)
            item_list.append((k, tex))

# Add remaining items from Java items
for f in sorted(os.listdir(JAVA_ITEMS)):
    if f.endswith(".png"):
        k = f[:-4]
        if k not in seen and not is_excluded(k):
            tex = find_texture(k)
            if tex:
                seen.add(k)
                item_list.append((k, tex))

# Add terrain blocks
for k in terrain_tex_data.keys():
    if k not in seen and not is_excluded(k):
        tex = find_texture(k)
        if tex:
            seen.add(k)
            item_list.append((k, tex))

# Add remaining Java blocks
for f in sorted(os.listdir(JAVA_BLOCKS)):
    if f.endswith(".png"):
        k = f[:-4]
        if k not in seen and not is_excluded(k):
            tex = find_texture(k)
            if tex:
                seen.add(k)
                item_list.append((k, tex))

print(f"Total items selected for glyph sheets: {len(item_list)}")

# Determine number of sheets needed (256 items per sheet)
# Starting at page E2
PAGE_START = 0xE2
SHEET_SIZE = 256
CELL_SIZE = 16
GRID_SIZE = 16  # 16x16 grid = 256x256 image

num_sheets = (len(item_list) + SHEET_SIZE - 1) // SHEET_SIZE
print(f"Generating {num_sheets} glyph sheets (from E{PAGE_START-0xE0} to E{PAGE_START-0xE0+num_sheets-1})...")

font_dir = os.path.join(RP_DIR, "font")
os.makedirs(font_dir, exist_ok=True)

glyph_sizes = bytearray(65536)
item_glyphs = {}

sheet_idx = 0
for s in range(num_sheets):
    page_hex = f"{PAGE_START + s:02X}"
    sheet_img = Image.new("RGBA", (GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE), (0, 0, 0, 0))
    sheet_items = item_list[s * SHEET_SIZE : (s + 1) * SHEET_SIZE]

    for idx, (item_name, tex_path) in enumerate(sheet_items):
        row = idx // GRID_SIZE
        col = idx % GRID_SIZE
        x_offset = col * CELL_SIZE
        y_offset = row * CELL_SIZE

        code_point = ((PAGE_START + s) << 8) | idx
        unicode_char = chr(code_point)
        # Store both full ID and short ID
        item_glyphs[f"minecraft:{item_name}"] = unicode_char
        item_glyphs[item_name] = unicode_char

        # Also store clean aliases (e.g. cooked_beef vs beef_cooked)
        if "cooked_" in item_name:
            item_glyphs[f"minecraft:{item_name.replace('cooked_', '')}_cooked"] = unicode_char
            item_glyphs[f"{item_name.replace('cooked_', '')}_cooked"] = unicode_char
        if "_cooked" in item_name:
            item_glyphs[f"minecraft:cooked_{item_name.replace('_cooked', '')}"] = unicode_char
            item_glyphs[f"cooked_{item_name.replace('_cooked', '')}"] = unicode_char

        try:
            with Image.open(tex_path) as img:
                img = img.convert("RGBA")
                # If animated strip (height > width), crop the first square frame
                w, h = img.size
                if h > w and w > 0:
                    img = img.crop((0, 0, w, w))
                elif w > h and h > 0:
                    img = img.crop((0, 0, h, h))

                if img.size != (CELL_SIZE, CELL_SIZE):
                    img = img.resize((CELL_SIZE, CELL_SIZE), Image.Resampling.NEAREST)

                sheet_img.paste(img, (x_offset, y_offset), img)

                # Set character width in glyph_sizes.bin
                glyph_sizes[code_point] = 0x0F  # Full 16-pixel cell (start=0, end=15)
        except Exception as e:
            print(f"Error processing {tex_path}: {e}")

    sheet_path = os.path.join(font_dir, f"glyph_{page_hex}.png")
    sheet_img.save(sheet_path, "PNG")
    print(f"Saved {sheet_path} with {len(sheet_items)} icons.")

# Save glyph_sizes.bin
with open(os.path.join(font_dir, "glyph_sizes.bin"), "wb") as f:
    f.write(glyph_sizes)
print("Saved glyph_sizes.bin (64 KB).")

# Save JS dictionary
js_output = os.path.join(ROULETTE_DIR, "scripts", "item_glyphs.js")
with open(js_output, "w", encoding="utf-8") as f:
    f.write("// Auto-generated Minecraft Item Glyphs mapping for Speedrun Roulette\n")
    f.write("export const ITEM_GLYPHS = " + json.dumps(item_glyphs, ensure_ascii=False, indent=2) + ";\n")
print(f"Saved JS glyphs mapping to {js_output} ({len(item_glyphs)} entries).")

# Create Resource Pack manifest.json
rp_uuid_header = str(uuid.uuid4())
rp_uuid_module = str(uuid.uuid4())
rp_manifest = {
    "format_version": 2,
    "header": {
        "name": "Speedrun Roulette Resources",
        "description": "Item Icons Font Resource Pack for Speedrun Roulette",
        "uuid": rp_uuid_header,
        "version": [1, 0, 0],
        "min_engine_version": [1, 20, 0]
    },
    "modules": [
        {
            "type": "resources",
            "uuid": rp_uuid_module,
            "version": [1, 0, 0]
        }
    ]
}
with open(os.path.join(RP_DIR, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(rp_manifest, f, indent=2)

# Copy pack_icon.png from extracted_roulette to RP_DIR
pack_icon_src = os.path.join(ROULETTE_DIR, "pack_icon.png")
pack_icon_dst = os.path.join(RP_DIR, "pack_icon.png")
if os.path.exists(pack_icon_src):
    with open(pack_icon_src, "rb") as fin, open(pack_icon_dst, "wb") as fout:
        fout.write(fin.read())

print("Resource Pack directory created successfully.")
