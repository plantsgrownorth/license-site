# Style options (if you want to change the look later)

The site currently uses **Option A** below. To try another, update `src/styles/global.css` (CSS variables) and `src/layouts/BaseLayout.astro` (font link if needed).

---

**Option A — System stack (current)**  
Font: system-ui, -apple-system, sans-serif (no web font).  
Colors: neutral gray background, dark gray text, blue accent.  
Pros: Fast, familiar, no font loading. Works everywhere.

---

**Option B — Inter**  
Font: Inter from Google Fonts for body and headings.  
Same neutral gray/blue palette as A.  
Pros: Very readable, professional, used by many apps.  
In BaseLayout, add:  
`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />`  
In global.css: `--font: 'Inter', system-ui, sans-serif;` and remove `--font-heading` or set it to `var(--font)`.

---

**Option C — Lora + system-ui (editorial)**  
Font: Lora for headings, system-ui for body.  
Same neutral palette.  
Pros: Slightly editorial, still clean.  
In BaseLayout: add Lora link.  
In global.css: `--font-heading: 'Lora', Georgia, serif;` and keep `--font` as system-ui.

---

**Option D — All system, warmer**  
Font: system-ui only (like A).  
Colors: very light warm gray bg (#f7f6f4), dark brown-gray text (#2d2a26), green accent (#1a6b4c).  
Pros: Softer than cool gray, still minimal.

---

Pick one and adjust the variables in `:root` in `src/styles/global.css` and the font link in `src/layouts/BaseLayout.astro` if the option uses a web font.
