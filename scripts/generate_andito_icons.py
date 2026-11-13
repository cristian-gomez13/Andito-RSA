import os
import base64
from PIL import Image, ImageDraw

def generate_icons():
    base_dir = r"C:\Users\cris\Desktop\RSA"
    src_dir = os.path.join(base_dir, "src")
    input_avatar = os.path.join(src_dir, "Andito-avatar.png")

    if not os.path.exists(input_avatar):
        raise FileNotFoundError(f"Source avatar not found at {input_avatar}")

    img = Image.open(input_avatar).convert("RGBA")
    print(f"Loaded master avatar: {img.size}")

    # Crop tight square centered on Andito
    # Head and popout ears: Y from ~58 to ~719, X from ~169 to ~631.
    # Center is at X=400, Y=385.
    # Cropping 700x700 gives 10-15px headroom above ears and 10-15px base below the teal ring
    crop_box = (50, 35, 750, 735)
    cropped = img.crop(crop_box)
    print(f"Master icon cropped to: {cropped.size}")

    # 1. Standard PNG Favicons with high-quality Lanczos resampling
    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "favicon-48x48.png": 48,
        "android-chrome-192x192.png": 192,
        "android-chrome-512x512.png": 512,
    }

    resized_images = {}
    for filename, sz in sizes.items():
        res = cropped.resize((sz, sz), Image.Resampling.LANCZOS)
        out_path = os.path.join(src_dir, filename)
        res.save(out_path, "PNG")
        resized_images[sz] = res
        print(f"Generated {filename} ({sz}x{sz})")

    # 2. Multi-resolution favicon.ico containing 16x16, 32x32, 48x48, 64x64
    ico_res64 = cropped.resize((64, 64), Image.Resampling.LANCZOS)
    ico_path = os.path.join(src_dir, "favicon.ico")
    # In Pillow, passing append_images saves multiple resolutions in the ICO container
    ico_res64.save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    print(f"Generated multi-resolution favicon.ico at {ico_path}")

    # 3. Apple Touch Icon (180x180):
    # iOS does NOT support transparent apple-touch-icons (it fills transparent pixels with black).
    # We place Andito inside a subtle Catppuccin Base (#eff1f5) canvas with a soft teal badge
    apple_size = 180
    apple_img = Image.new("RGBA", (apple_size, apple_size), (239, 241, 245, 255)) # #eff1f5
    andito_apple = cropped.resize((156, 156), Image.Resampling.LANCZOS)
    apple_img.paste(andito_apple, (12, 12), andito_apple)
    apple_path = os.path.join(src_dir, "apple-touch-icon.png")
    apple_img.convert("RGB").save(apple_path, "PNG")
    print(f"Generated apple-touch-icon.png (180x180) at {apple_path}")

    # 4. SVG Favicon (modern browsers: Chrome, Firefox, Safari)
    with open(os.path.join(src_dir, "android-chrome-512x512.png"), "rb") as f:
        b64_512 = base64.b64encode(f.read()).decode("utf-8")

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <!-- Andito Official Pop-Out Mascot Favicon -->
  <defs>
    <style>
      :root {{ color-scheme: light dark; }}
    </style>
  </defs>
  <image href="data:image/png;base64,{b64_512}" x="0" y="0" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
</svg>
'''
    svg_path = os.path.join(src_dir, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated favicon.svg at {svg_path}")

    # 5. Social Open Graph preview card for Vercel deployments (1200x630)
    og = Image.new("RGBA", (1200, 630), (239, 241, 245, 255))
    draw = ImageDraw.Draw(og)
    # Top decorative teal accent line
    draw.rectangle([(0, 0), (1200, 14)], fill=(23, 146, 153, 255)) # #179299
    # Mascot on left
    andito_og = cropped.resize((480, 480), Image.Resampling.LANCZOS)
    og.paste(andito_og, (70, 75), andito_og)

    # Content card on right
    draw.rounded_rectangle([(580, 100), (1130, 530)], radius=24, fill=(255, 255, 255, 250), outline=(204, 208, 218, 255), width=2)
    # Header tag
    draw.rounded_rectangle([(620, 140), (840, 180)], radius=20, fill=(23, 146, 153, 35))

    og_path = os.path.join(src_dir, "og-image.png")
    og.save(og_path, "PNG")
    print(f"Generated og-image.png at {og_path}")

if __name__ == "__main__":
    generate_icons()
