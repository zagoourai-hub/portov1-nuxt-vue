# Aset Gambar Frontend

Gambar dibuat dengan tool bawaan GPT Image, tanpa CLI/API key atau dependency baru. Referensi visual: `desain.png` di root. Semua hasil yang digunakan telah disalin ke workspace; gambar sumber hasil generasi tetap dipertahankan.

| Aset | Penggunaan |
| --- | --- |
| app/assets/image/developer-anime-v2.png | Karakter hero final setelah koreksi gaya anime pengguna. |
| app/assets/image/developer-portrait.png | Versi pertama, dipertahankan sebagai alternatif; tidak dipakai hero. |
| app/assets/image/project-veloce.png | Thumbnail proyek contoh sepeda. |
| app/assets/image/project-woodcraft.png | Thumbnail proyek contoh furniture. |
| app/assets/image/project-urbanix.png | Thumbnail proyek contoh fashion. |

Judul, nama, deskripsi, serta CTA hero dirender sebagai HTML. Thumbnail proyek adalah ilustrasi studi kasus contoh, bukan bukti aplikasi klien yang sudah dibuat. Aset pengguna yang sebelumnya ada di folder image tidak ditimpa.

## Prompt hero final

Input pertama adalah developer-portrait.png sebagai target edit; input kedua adalah desain.png sebagai referensi gaya. Prompt final yang dikirim:

> Edit Image 1, the developer portrait. Image 2 is STYLE AND COMPOSITION REFERENCE ONLY, specifically the anime young man at the center of the portfolio hero on the upper left. Redraw Image 1 to closely match the bold 2D Japanese anime illustration style of that reference hero. VERY IMPORTANT: genuinely hand-drawn 2D ANIME, NOT semi-realistic, NOT painterly, NOT 3D, NOT photorealistic, no realistic skin texture, no detailed fabric pores. Use crisp expressive black manga outlines, strong simplified cel-shaded shapes with only 2 or 3 flat shadow tones, sharp anime eyes and stylized smaller nose, angular jaw, tousled spiky black hair drawn in clear flat clumps, black hoodie with clean angular folds and vivid red rim accents. Young adult male, relaxed confident upward gaze to the left, three-quarter portrait from head to waist, hands not needed. Preserve black hoodie and general pose from image 1 but stylize much more strongly. Medium waist-up framing with full hair and shoulders inside the frame. Transparent background with clean alpha edges, no backdrop, no soft black rectangle, no light bloom, no text, no logos, no emoji, no typography. Suitable for layering over giant red lettering on a portfolio website. Match the actual 2D illustrative rendering of the character in Image 2 rather than realistic digital painting.

Hasil final memiliki latar gelap yang dipadukan ke hero melalui CSS mask; transparansi sempurna tidak diklaim.

## Prompt thumbnail Veloce

> Generate one high-end website project screenshot as a raster portfolio thumbnail, landscape 3:2. A sophisticated bicycle e-commerce landing page for fictional brand VELOCE on near-black background. Strong clean white editorial title 'VELOCE' at upper left, small second line 'Ride Beyond Limits.', a very large photorealistic black and deep-red carbon road bicycle on right, dramatic side profile, minimal white navigation along top. Small red purchase CTA below text. Swiss graphic design, premium product photography, subtle red accents, sharp typography, realistic website layout. Full bleed screenshot only, front-on flat view, no browser chrome, no laptop or phone mockups, no surrounding scene, no emojis, no excessive glowing gradients, no watermark. Bicycle wheels fully visible.

## Prompt thumbnail Woodcraft

> Generate one high-end website project screenshot as a raster portfolio thumbnail, landscape 3:2. A refined furniture e-commerce landing page for fictional brand WOODCRAFT, warm off-white cream background, strong dark editorial typography on left reading 'Timeless Crafted Furniture', large beautiful tan leather and walnut lounge chair on right standing in a minimalist warm beige studio, subtle natural shadows. Discreet dark minimalist navigation across top, small understated rounded dark green CTA below heading, small decorative product detail photo near bottom left. Premium architectural magazine art direction, elegant spacing, authentic furniture photography. Full bleed flat front-on website screenshot, no browser frame, no computer mockup, no emojis, no watermark.

## Prompt thumbnail Urbanix

> Generate one high-end website project screenshot as a raster portfolio thumbnail, landscape 3:2. A contemporary streetwear editorial landing page for fictional brand URBANIX on matte near-black background with restrained scarlet red accents. Strong tall condensed white headline at left reading 'STAY AHEAD IN STYLE'. At right, hand-drawn editorial anime portrait of a fictional young adult man with tousled black hair in a black hoodie with a very subtle red rim light, waist-up, sophisticated manga illustration not chibi. Small clean white navigation at top, small outlined button beneath headline, minimal white brand URBANIX top left. Expensive fashion magazine web art direction, bold negative space, no emojis, no giant decorative icons, no browser mockup, no watermark. Flat front-on full-bleed screenshot.
