# Wedding Title Library

## 📁 Folder Structure

```
public/titles/
├── alhamdulillah/     ← "Alhamdulillah" wedding titles
├── congratulation/    ← "Congratulation" wedding titles  
├── nikkah/           ← "Nikkah" ceremony titles
├── walimah/          ← "Walimah" ceremony titles
├── other/            ← Other wedding titles
└── titles.json       ← Manifest file (auto-generated)
```

## ➕ How to Add New Titles

### 1. Paste your SVG in the appropriate folder:
- `alhamdulillah/` - For "Alhamdulillahi On Your Wedding Ceremony" style
- `congratulation/` - For "Congratulation On Your Wedding Ceremony" style
- `nikkah/` - For Nikkah ceremony titles
- `walimah/` - For Walimah ceremony titles
- `other/` - For any other wedding titles

### 2. Update `titles.json`:
```json
{
  "id": "unique-id",
  "name": "Display Name",
  "category": "alhamdulillah",
  "file": "alhamdulillah/your-file.svg",
  "keywords": ["alhamdulillah", "wedding", "ceremony"],
  "textElements": ["title-text"]
}
```

## ☁️ CloudFlare CDN Upload

### Files go to: `https://d27paqapg0ahqm.cloudfront.net/titles/`

### Upload command:
```powershell
.\scripts\upload-titles-to-cdn.ps1
```

## 📝 SVG Requirements

Each title SVG should:
1. Have a proper `viewBox` attribute
2. Include embedded fonts OR use web-safe fonts
3. Text should be editable (not converted to paths) if user customization is needed
