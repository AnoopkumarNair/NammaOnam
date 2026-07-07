"""
Project Mahabali — Veo 3.1 Video Generator
Namma Onam 2.0 | G R Sitara | August 15-16, 2026

Generates 3 cinematic intro clips with:
  - 90-second cooldown between scenes (rate limit safety)
  - Exponential backoff retry on 429 quota errors
  - Auto-resume: skips already-downloaded clips
  - Full spec-accurate prompts (Volume 03 + 04)
"""

import os
import sys
import time
import math

# ── Windows console UTF-8 fix ────────────────────────────────────────────────
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ── Read API key ─────────────────────────────────────────────────────────────
env_path = os.path.join(os.path.dirname(__file__), ".env.local")
api_key  = None

with open(env_path, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k in ("GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_DRIVE_API_KEY") and v:
            api_key = v
            print(f"[KEY]  Loaded from {k}: {v[:8]}...")
            break

if not api_key:
    print("[ERROR] No API key found in .env.local")
    sys.exit(1)

# ── SDK init ─────────────────────────────────────────────────────────────────
try:
    from google import genai
    from google.genai import types
except ImportError:
    print("[ERROR] Run: pip install google-genai")
    sys.exit(1)

client = genai.Client(api_key=api_key)

# ── Config ───────────────────────────────────────────────────────────────────
MODEL          = "veo-3.1-generate-preview"
PUBLIC_DIR     = os.path.join(os.path.dirname(__file__), "public")
SCENE_COOLDOWN = 90    # seconds between scenes to respect rate limits
MAX_RETRIES    = 5     # max retry attempts per scene on 429
POLL_INTERVAL  = 12    # seconds between status polls
os.makedirs(PUBLIC_DIR, exist_ok=True)

# ── Cinematic Prompts ─────────────────────────────────────────────────────────
# Spec: Volume 03 (Visual Design Bible) — Temple Gold #D4AF37, Onam Orange
# #E67E22, Banana Leaf Green #2E8B57, Warm Ivory #F8F3E7, Deep Brown #4A2E1F
# Spec: Volume 04 (Motion Bible) — Ultra-slow, Apple-quality, sacred + grand

SCENES = [
    {
        "filename": "video-dawn.mp4",
        "label":    "Scene 1 — Kerala Dawn",
        "prompt": (
            "Ultra-slow cinematic aerial pull-back at 1/4 normal speed over the landscaped "
            "courtyard of a premium modern residential apartment complex at the precise moment of "
            "first light on an Onam morning. "

            "FOREGROUND: Lush landscaping with ornamental palms, manicured greenery, and a "
            "large, pristine blue swimming pool that reflects the dawn sky. Beside the pool, "
            "on the smooth paved walkway, a freshly arranged grand Pookalam flower carpet "
            "radiates from its center — concentric rings of marigold orange, chrysanthemum "
            "white, rose red, and jasmine ivory, each petal precisely placed, still trembling "
            "with morning dew. A single brass Nilavilakku oil lamp stands at the Pookalam "
            "center, its flame barely visible against the rising light but emanating a "
            "distinct golden warmth. "

            "ATMOSPHERE: Soft silver mist drifts in slow ribbons across the scene, catching "
            "the light into hundreds of tiny glowing particles. The air itself seems golden. "
            "A pair of white egrets glide silently from left to right across the middle "
            "distance, their wings barely moving. "

            "SKY: The horizon burns deep maroon-crimson at the very base, "
            "transitioning through a band of vivid saffron-orange (#E67E22), "
            "into warm temple gold (#D4AF37), then to a luminous amber, "
            "then pale ivory (#F8F3E7), and finally into the deep pre-dawn blue-purple "
            "high above. Volumetric god-rays of gold and amber pierce through the "
            "canopy from the upper right, painting light columns through the mist. "

            "ARCHITECTURE: The apartment buildings are modern, featuring crisp white and grey "
            "facades with clean geometric lines and glass balconies. A prominent clubhouse block "
            "features striking vertical wooden-style louvers (tall vertical fins) running up its "
            "facade. The buildings are tastefully draped in festive jasmine and marigold garlands. "

            "CAMERA: The camera drifts backward and imperceptibly upward at a pace "
            "that makes the world feel suspended — as if time has paused to honor "
            "this sacred morning. Anamorphic lens. Extremely shallow depth of field "
            "with gentle foreground bokeh. "

            "TECHNICAL: Photorealistic 8K. Shot on ARRI Alexa 65, Panavision anamorphic. "
            "Color grade: warm, slightly desaturated highlights, rich shadow detail, "
            "skin-tone neutral (no people). "
            "No text. No people. No cartoonish elements."
        ),
        "negative": (
            "people, humans, faces, cars, phones, cartoon, animation, CGI look, "
            "plastic, bright neon colors, overexposed, cluttered, temple"
        ),
    },
    {
        "filename": "video-lamp.mp4",
        "label":    "Scene 2 — Nilavilakku Lamp",
        "prompt": (
            "Extreme close-up cinematic macro shot of a traditional Kerala Nilavilakku "
            "brass oil lamp — the most sacred object of Onam — in near-total darkness. "

            "THE LAMP: Ornate, heavily cast brass with intricate floral filigree along "
            "every surface. The lamp stand has four curved legs ending in lion paw feet. "
            "Five wick holders extend from the central oil reservoir like flower petals. "
            "The entire surface is polished to a mirror finish, showing the dark room "
            "reflected in distorted golden miniature. "

            "THE IGNITION: The scene begins in complete darkness — only the faintest "
            "ambient glow suggests the lamp's shape. Then: a single wick catches. "
            "First there is just heat — a shimmer, a distortion of the air above the wick. "
            "Then a microscopic orange ember appears. It breathes — dimming, brightening — "
            "before erupting into a steady, confident golden flame 3cm tall. "
            "The brass nearest the flame catches the light immediately, reflecting a "
            "tiny duplicate flame in its polished surface. "
            "Caustic light patterns — undulating ripples of gold and amber — spread "
            "outward across the ancient stone floor beneath the lamp. "
            "Thirty seconds in: a second wick catches spontaneously. The warmth doubles. "
            "The stone floor around the lamp now shows itself: dark grey granite, "
            "smooth from centuries of use, with a thin ring of red kumkum powder "
            "placed ceremonially around the lamp base. "

            "BACKGROUND REVEAL: As the light grows, the darkness slowly dissolves to "
            "reveal: carved wooden pillars with intricate lotus motifs, "
            "thick jasmine flower garlands draping between them, "
            "a blurred glimpse of more Nilavilakku lamps further in the space. "
            "Everything in deep, luscious bokeh. "

            "THE FLAME: Breathes gently — 3-4 times per minute it dips slightly and "
            "recovers, as if the room itself is breathing. It never extinguishes. "
            "The color shifts subtly from amber to pure gold to almost white at the tip. "

            "CAMERA: Completely locked off. Macro lens. The frame slowly, imperceptibly "
            "tightens toward the flame over the course of the shot — a barely perceptible "
            "digital zoom of perhaps 5% total. "

            "TECHNICAL: Photorealistic 8K macro. Shot on cinema camera with dedicated "
            "macro lens. Extremely shallow depth of field. Warm amber-gold color grade. "
            "The flame is the only moving element for the first 20 seconds. "
            "Sacred. Intimate. Meditative. "
            "No text. No people. No logos. No modern objects."
        ),
        "negative": (
            "people, humans, modern objects, electric lights, candles, birthday cake, "
            "text, logos, cartoon, animation, low quality, overlit, blown highlights"
        ),
    },
    {
        "filename": "video-gate.mp4",
        "label":    "Scene 3 — Festival Gate",
        "prompt": (
            "Slow, supremely confident cinematic push-in shot through the grand entrance "
            "of a premium modern residential apartment complex (G R Sitara) celebrating Onam at golden hour. "

            "THE GATE: A wide, modern security gate with a flat canopy structure. "
            "The architecture is contemporary, featuring crisp white and dark grey walls, "
            "and a prominent section with tall vertical wooden-style louvers (fins). "

            "THE DECORATIONS: "
            "- Rows of glowing brass Nilavilakku oil lamps line the smooth paved driveway, "
            "each one glowing with a living flame. "
            "- Three-meter-long garlands of fresh marigold, orange and yellow, drape elegantly "
            "across the entrance canopy and security cabin, releasing visible pollen "
            "into the air. "
            "- Thick ropes of jasmine flowers wind around the modern entrance pillars. "
            "- Pairs of banana plants — whole trees, not cut — stand sentinel on either "
            "side of the entrance with full flower clusters hanging. "
            "- Traditional banana-flower tassels (vazha poo) swing in the warm evening "
            "breeze. "

            "THE VIEW THROUGH: Beyond the gate, the beautifully landscaped apartment courtyard glows "
            "with golden warmth. A large pristine blue swimming pool reflects the sunset sky. "
            "A large, intricate Pookalam is visible on the paved walkway near the pool — its rings "
            "of color distinct even at this distance. "
            "The modern white and grey apartment towers rise elegantly in the background, their "
            "balconies lit warmly, showcasing a modern pergola structure connecting blocks. "

            "THE SKY: Dramatic. The sun sits precisely at the horizon line, producing "
            "a perfect golden hour. Sky color: deep crimson at horizon, saffron, "
            "gold, amber, pale sky blue at zenith. Clouds catch the light in rose-gold. "

            "CAMERA MOVEMENT: Dead slow push-in — takes the full 8 seconds to move "
            "forward into the complex. "
            "We begin outside on the street, pass through the entrance gate, and end just inside the "
            "driveway, the festive courtyard opening up around us. "
            "Anamorphic lens flare from the nearest lamp as we pass it. "

            "ATMOSPHERE: Evening breeze causes all the garlands and tassels to sway "
            "simultaneously in the same direction. The lamp flames bend slightly with it. "
            "Visible particles of marigold pollen and jasmine petals drift in the air, "
            "caught in shafts of golden light. "

            "TECHNICAL: Photorealistic 8K. Shot on ARRI Alexa, Panavision anamorphic. "
            "Color grade: rich, warm, cinematic. "
            "Deep shadows with golden highlights. "
            "Grand. Celebratory. A beautiful modern community coming together. "
            "No text. No people. No logos."
        ),
        "negative": (
            "people, humans, cars, harsh electric lights, neon, "
            "text, logos, cartoon, CGI, animation, daytime harsh light, "
            "plastic decorations, synthetic flowers, temple gopuram"
        ),
    },
]


# ── Helpers ───────────────────────────────────────────────────────────────────
def countdown(seconds: int, label: str = ""):
    """Visible countdown timer."""
    for remaining in range(seconds, 0, -1):
        mins, secs = divmod(remaining, 60)
        print(f"\r  [{label}] {mins:02d}:{secs:02d} remaining...   ", end="", flush=True)
        time.sleep(1)
    print(f"\r  [{label}] Ready!                        ")


def submit_with_retry(scene: dict) -> object | None:
    """Submit a Veo job with exponential backoff on 429."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            operation = client.models.generate_videos(
                model=MODEL,
                prompt=scene["prompt"],
                config=types.GenerateVideosConfig(
                    aspectRatio="16:9",
                    durationSeconds=8,
                    numberOfVideos=1,
                    negativePrompt=scene.get("negative", ""),
                ),
            )
            print(f"  [OK]   Job accepted on attempt {attempt}")
            return operation

        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                wait = min(60 * (2 ** (attempt - 1)), 300)  # 60, 120, 240, 300, 300...
                print(f"  [429]  Rate limited on attempt {attempt}/{MAX_RETRIES}. "
                      f"Waiting {wait}s before retry...")
                countdown(wait, "Cooldown")
            elif "PERMISSION_DENIED" in err or "403" in err:
                print(f"  [ERROR] Permission denied: {err}")
                print("  [HINT]  Check billing is enabled and Veo 3.1 is allowlisted.")
                return None
            elif "UNAUTHENTICATED" in err or "401" in err:
                print(f"  [ERROR] Auth failed: {err}")
                print("  [HINT]  Check your API key.")
                return None
            else:
                print(f"  [ERROR] Attempt {attempt}: {err}")
                if attempt == MAX_RETRIES:
                    return None
                time.sleep(15)

    return None


def poll_until_done(operation) -> object:
    """Poll operation until done, with progress display."""
    elapsed = 0
    while not operation.done:
        time.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL
        mins, secs = divmod(elapsed, 60)
        print(f"\r  [POLL] {mins:02d}m {secs:02d}s — Veo is rendering...   ", end="", flush=True)
        try:
            operation = client.operations.get(operation)
        except Exception as e:
            print(f"\n  [WARN] Poll error (will retry): {e}")
    print()
    return operation


def download_video(operation, out_path: str) -> bool:
    """Download the generated video to out_path."""
    if not operation.response:
        print("  [ERROR] Empty response from Veo.")
        return False

    if not operation.response.generated_videos:
        print("  [ERROR] No videos generated. Check quota/billing.")
        return False

    video = operation.response.generated_videos[0]

    try:
        client.files.download(file=video.video, download_path=out_path)
    except (AttributeError, TypeError):
        # Fallback: fetch via URI
        import urllib.request
        uri = getattr(video.video, "uri", None) or str(video.video)
        print(f"  [INFO] SDK download unavailable, fetching URI: {uri[:60]}...")
        urllib.request.urlretrieve(uri, out_path)

    if os.path.exists(out_path) and os.path.getsize(out_path) > 50_000:
        size_mb = os.path.getsize(out_path) / 1_048_576
        print(f"  [OK]   public/{os.path.basename(out_path)} — {size_mb:.1f} MB")
        return True
    else:
        print("  [ERROR] File missing or too small after download.")
        return False


def generate_scene(scene: dict, is_last: bool = False) -> bool:
    label    = scene["label"]
    filename = scene["filename"]
    out_path = os.path.join(PUBLIC_DIR, filename)

    print(f"\n{'='*62}")
    print(f"  {label}")
    print(f"{'='*62}")

    # Skip if already done
    if os.path.exists(out_path) and os.path.getsize(out_path) > 50_000:
        size_mb = os.path.getsize(out_path) / 1_048_576
        print(f"  [SKIP] Already generated ({size_mb:.1f} MB) — skipping.")
        return True

    # Submit
    operation = submit_with_retry(scene)
    if operation is None:
        return False

    # Poll
    print(f"  [POLL] Polling Veo 3.1 (takes 3-7 min per clip)...")
    operation = poll_until_done(operation)

    # Download
    ok = download_video(operation, out_path)

    # Inter-scene cooldown (not needed after the last scene)
    if ok and not is_last:
        print(f"\n  [RATE] Waiting {SCENE_COOLDOWN}s before next scene (rate limit safety)...")
        countdown(SCENE_COOLDOWN, "Rate limit cooldown")

    return ok


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "=" * 62)
    print("  Namma Onam 2.0 — Veo 3.1 Cinematic Video Generator")
    print("  G R Sitara | August 15-16, 2026")
    print("=" * 62)
    print(f"  Model  : {MODEL}")
    print(f"  Scenes : {len(SCENES)} x 8s each = ~24s total intro")
    print(f"  Output : {PUBLIC_DIR}")
    print(f"  Wait   : {SCENE_COOLDOWN}s cooldown between scenes")
    print(f"  Retry  : Up to {MAX_RETRIES} attempts per scene on 429")
    print("=" * 62)
    total_est = len(SCENES) * 5 + (len(SCENES) - 1) * (SCENE_COOLDOWN // 60)
    print(f"  Est. total time: ~{total_est} minutes")
    print("=" * 62)

    results = []
    for i, scene in enumerate(SCENES):
        is_last = (i == len(SCENES) - 1)
        ok = generate_scene(scene, is_last=is_last)
        results.append((scene["label"], ok))

    # Wire videos into intro if we have any
    videos_ready = [s for s, ok in results if ok]

    print("\n" + "=" * 62)
    print("  FINAL RESULTS")
    print("=" * 62)
    for label, ok in results:
        marker = "[OK]   " if ok else "[FAIL] "
        print(f"  {marker} {label}")

    all_ok  = all(ok for _, ok in results)
    any_ok  = any(ok for _, ok in results)

    if all_ok:
        print()
        print("  All 3 cinematic clips ready!")
        print("  Preview: http://localhost:3000?forceIntro=true")
        print()
        print("  Files in public/:")
        for scene in SCENES:
            p = os.path.join(PUBLIC_DIR, scene["filename"])
            if os.path.exists(p):
                mb = os.path.getsize(p) / 1_048_576
                print(f"    {scene['filename']:30s}  {mb:.1f} MB")
    elif any_ok:
        print()
        print("  Partial success. Remaining scenes:")
        for label, ok in results:
            if not ok:
                print(f"    - {label}")
        print()
        print("  Re-run this script to retry failed scenes (already-done clips are skipped).")
    else:
        print()
        print("  All scenes failed. Check errors above.")
        print("  The intro screen will use the AI image fallback in the meantime.")

    print("=" * 62 + "\n")
