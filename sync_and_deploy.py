import os
import sys
import json
import re
import shutil
import hashlib
import time
import subprocess
import fitz  # PyMuPDF
from PIL import Image, ImageDraw

os.chdir(os.path.dirname(os.path.abspath(__file__)))

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("=" * 70)
print(" NEXUS 3.0 &bull; COMMUNITY PLACEMENT & STUDY INGESTION PIPELINE")
print("=" * 70)

UPLOADS_DIR = "whatsapp_uploads"
FILES_DIR = "files"
THUMBS_DIR = "assets/thumbnails"

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(FILES_DIR, exist_ok=True)
os.makedirs(THUMBS_DIR, exist_ok=True)

# 1. Process files in whatsapp_uploads/
incoming_files = [f for f in os.listdir(UPLOADS_DIR) if not f.startswith('.')]
processed_count = 0

def slugify(text):
    text = re.sub(r'[^\w\s-]', '', text.lower())
    return re.sub(r'[-\s]+', '-', text).strip('-_')

for fname in incoming_files:
    src_path = os.path.join(UPLOADS_DIR, fname)
    if os.path.isfile(src_path):
        name_part, ext = os.path.splitext(fname)
        clean_slug = slugify(name_part) + ext.lower()
        dest_root = os.path.join(".", fname)
        dest_file = os.path.join(FILES_DIR, clean_slug)
        
        # Copy to root and to files/
        if not os.path.exists(dest_root):
            shutil.copy2(src_path, dest_root)
        if not os.path.exists(dest_file):
            shutil.copy2(src_path, dest_file)
        
        # Remove from uploads once staged
        os.remove(src_path)
        print(f" [+] Ingested from WhatsApp: {fname} -> files/{clean_slug}")
        processed_count += 1

# 2. Re-index all files
print(" [*] Scanning and indexing all files...")

# Load existing data if available
existing_map = {}
if os.path.exists("assets/data.json"):
    try:
        with open("assets/data.json", "r", encoding="utf-8") as f:
            for item in json.load(f):
                existing_map[item["filename"]] = item
    except Exception:
        pass

all_items = []
root_files = sorted(os.listdir("."))

PLACEMENT_KEYWORDS = [
    "placement", "aptitude", "quantitative", "reasoning", "verbal", "interview",
    "resume", "hr", "striver", "leetcode", "dsa", "tcs", "infosys", "wipro",
    "accenture", "cognizant", "capgemini", "amazon", "google", "sde", "company",
    "formula", "cheat", "roadmap", "mock", "puzzle", "sql interview", "oops interview"
]

for f in root_files:
    if f.startswith(".") or os.path.isdir(f):
        continue
    
    ext = os.path.splitext(f)[1].lower().strip(".")
    if ext not in ["pdf", "ppt", "pptx", "docx", "doc", "png", "jpg", "jpeg"]:
        continue
    
    # If already known, preserve rich metadata
    if f in existing_map:
        item = existing_map[f]
        # Refresh size
        item["sizeBytes"] = os.path.getsize(f)
        size_mb = item["sizeBytes"] / (1024 * 1024)
        item["sizeFormatted"] = f"{size_mb:.2f} MB" if size_mb >= 1 else f"{item['sizeBytes'] / 1024:.1f} KB"
        all_items.append(item)
        continue
    
    # New file classification
    print(f" [*] Processing new asset: {f}")
    name_clean = os.path.splitext(f)[0]
    slug = slugify(name_clean) + "." + ext
    file_path = os.path.join(FILES_DIR, slug)
    if not os.path.exists(file_path):
        shutil.copy2(f, file_path)
    
    # Generate thumbnail
    thumb_name = hashlib.md5(f.encode("utf-8")).hexdigest()[:12] + ".png"
    thumb_path = os.path.join(THUMBS_DIR, thumb_name)
    pages = 1
    sample_text = ""
    
    if ext == "pdf":
        try:
            doc = fitz.open(f)
            pages = len(doc)
            pix = doc[0].get_pixmap(dpi=110)
            pix.save(thumb_path)
            for p in range(min(5, pages)):
                sample_text += " " + doc[p].get_text("text")
            doc.close()
        except Exception as e:
            print(f"     Thumbnail notice for {f}: {e}")
            thumb_name = "thumb_ppt.png"
    else:
        # Generic document card thumbnail
        img = Image.new("RGB", (600, 420), color=(15, 23, 42))
        d = ImageDraw.Draw(img)
        d.rectangle([10, 10, 590, 410], fill=(22, 33, 62), outline=(0, 242, 254), width=3)
        d.text((40, 40), "COMMUNITY PLACEMENT ASSET", fill=(0, 242, 254))
        d.text((40, 100), name_clean[:40], fill=(255, 255, 255))
        d.text((40, 160), f"File Type: {ext.upper()} | Shared via Community", fill=(148, 163, 184))
        img.save(thumb_path)
    
    # Auto-classify
    combined_search = (f + " " + sample_text).lower()
    is_placement = any(k in combined_search for k in PLACEMENT_KEYWORDS)
    is_os = any(k in combined_search for k in ["bcsos", "operating system", "process management", "deadlock", "scheduling"])
    is_ds = any(k in combined_search for k in ["bcids", "data structure", "linked list", "binary tree", "stack", "queue"])
    
    if is_placement:
        subject = "Placement Essentials"
        code = "CAREER & PLACEMENT"
        badge = "Placement Hub"
    elif is_os:
        subject = "Operating Systems"
        code = "BCSOS303"
        badge = "Academic Note"
    elif is_ds:
        subject = "Data Structures"
        code = "BCIDS302"
        badge = "Academic Note"
    else:
        subject = "Community Resource"
        code = "COMMUNITY"
        badge = "Shared File"
    
    size_bytes = os.path.getsize(f)
    size_mb = size_bytes / (1024 * 1024)
    size_str = f"{size_mb:.2f} MB" if size_mb >= 1 else f"{size_bytes / 1024:.1f} KB"
    
    all_items.append({
        "filename": f,
        "webPath": "files/" + slug,
        "sizeBytes": size_bytes,
        "sizeFormatted": size_str,
        "pages": pages,
        "thumbnail": "assets/thumbnails/" + thumb_name,
        "subject": subject,
        "courseCode": code,
        "title": name_clean.replace("-", " ").replace("_", " ").title(),
        "type": "Placement Material" if is_placement else "Study Resource",
        "badge": badge,
        "author": "WhatsApp Community Shared",
        "description": f"Placement & study material: {name_clean}. Shared via community group.",
        "topics": [w.title() for w in PLACEMENT_KEYWORDS if w in combined_search][:6] or ["Interview Prep", "Placement"],
        "searchSnippet": " ".join(sample_text.split()[:300]),
        "extension": ext
    })

# Save JSON
with open("assets/data.json", "w", encoding="utf-8") as f:
    json.dump(all_items, f, indent=2)

syllabus = {}
if os.path.exists("assets/syllabus.json"):
    with open("assets/syllabus.json", "r", encoding="utf-8") as f:
        syllabus = json.load(f)

with open("assets/js/data.js", "w", encoding="utf-8") as f:
    f.write(f"// Generated Study Hub Dataset\nwindow.STUDY_FILES = {json.dumps(all_items, indent=2)};\nwindow.SYLLABUS_DATA = {json.dumps(syllabus, indent=2)};\n")

print(f" [✓] Indexed {len(all_items)} total assets successfully!")

# 3. Git commit & push
print("\n [*] Deploying to GitHub (lokprasad007/me)...")
try:
    subprocess.run(["git", "add", "."], check=True)
    msg = f"Add community & placement uploads [{time.strftime('%Y-%m-%d %H:%M')}]"
    subprocess.run(["git", "commit", "-m", msg])
    subprocess.run(["git", "push", "origin", "main"], check=True)
    subprocess.run(["git", "push", "origin", "gh-pages"], check=True)
    print("\n" + "=" * 70)
    print(" 🎉 SUCCESS! DEPLOYED LIVE TO THE DAILY WEB!")
    print(" 🌐 Live URL: https://lokprasad007.github.io/me/")
    print("=" * 70)
except Exception as e:
    print("Git deployment notice:", e)
