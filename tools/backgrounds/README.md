# Remote backgrounds (Firestore seeding)

This folder is for preparing metadata for remote (S3/CloudFront) wedding backgrounds.

## 1) Create your input file

- Copy `remote-backgrounds.example.json` to `remote-backgrounds.json`
- Replace URLs with your real CloudFront/S3 URLs
- Fill `paletteKey` so the app can choose matching text/flourish colors

`paletteKey` allowed values: `light`, `dark`, `redGold`

## 2) Seed Firestore

From repo root:

```powershell
cd .\functions
npm run seed:backgrounds -- --in ..\tools\backgrounds\remote-backgrounds.json --dryRun
```

Remove `--dryRun` to actually write.

## Auth

The seeder uses `firebase-admin`.

- Recommended: set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON
- Or pass `--serviceAccount <path.json>`

Example:

```powershell
cd .\functions
npm run seed:backgrounds -- --in ..\tools\backgrounds\remote-backgrounds.json --serviceAccount ..\service-account.json
```
