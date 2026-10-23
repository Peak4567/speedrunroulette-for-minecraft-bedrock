import os
import zipfile

WORKSPACE = os.path.dirname(os.path.abspath(__file__))
BP_DIR = os.path.join(WORKSPACE, "extracted_roulette")
RP_DIR = os.path.join(WORKSPACE, "SpeedrunRoulette_RP")

def add_dir_to_zip(zipf, source_dir, arc_prefix=""):
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, source_dir)
            arc_name = rel_path.replace(os.sep, "/")
            if arc_prefix:
                arc_name = f"{arc_prefix}/{arc_name}".replace("//", "/")
            zipf.write(file_path, arc_name)

# 1. Behavior Pack (.mcpack)
bp_path = os.path.join(WORKSPACE, "SpeedrunRoulette_BP.mcpack")
with zipfile.ZipFile(bp_path, "w", zipfile.ZIP_DEFLATED) as z:
    add_dir_to_zip(z, BP_DIR)
print(f"Created {bp_path} ({os.path.getsize(bp_path):,} bytes)")

# 2. Overwrite original filename that user might be using
orig_path = os.path.join(WORKSPACE, "SpeedrunRoulette by modsfinder.mcpack")
with zipfile.ZipFile(orig_path, "w", zipfile.ZIP_DEFLATED) as z:
    add_dir_to_zip(z, BP_DIR)
print(f"Created {orig_path} ({os.path.getsize(orig_path):,} bytes)")

peak_path = os.path.join(WORKSPACE, "SpeedrunRoulette by Peak4567.mcpack")
with zipfile.ZipFile(peak_path, "w", zipfile.ZIP_DEFLATED) as z:
    add_dir_to_zip(z, BP_DIR)
print(f"Created {peak_path} ({os.path.getsize(peak_path):,} bytes)")

# 3. Resource Pack (.mcpack)
rp_path = os.path.join(WORKSPACE, "SpeedrunRoulette_RP.mcpack")
with zipfile.ZipFile(rp_path, "w", zipfile.ZIP_DEFLATED) as z:
    add_dir_to_zip(z, RP_DIR)
print(f"Created {rp_path} ({os.path.getsize(rp_path):,} bytes)")

# 4. Combined MCAddon (.mcaddon) with standard Bedrock folder structure
addon_path = os.path.join(WORKSPACE, "SpeedrunRoulette_Full.mcaddon")
with zipfile.ZipFile(addon_path, "w", zipfile.ZIP_DEFLATED) as z:
    add_dir_to_zip(z, BP_DIR, arc_prefix="SpeedrunRoulette_BP")
    add_dir_to_zip(z, RP_DIR, arc_prefix="SpeedrunRoulette_RP")
print(f"Created {addon_path} ({os.path.getsize(addon_path):,} bytes)")
