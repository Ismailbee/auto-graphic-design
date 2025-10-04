## Auto Graphic Design JavaScript Backend

This directory contains the Node.js/Express backend that powers the design tooling API. The service is implemented entirely in JavaScript and stores data in JSON files under `storage/`.

### Getting started

```bash
npm install
npm run dev
```

The server starts on port `3001` by default. Edit `PORT` in your environment to change it.

### Available endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Health check & endpoint index |
| POST | `/api/impose` | PDF/image imposition processing |
| GET | `/api/templates` | List templates (optional `category` query) |
| GET | `/api/templates/categories` | List template categories |
| GET | `/api/templates/:id` | Fetch a single template |
| POST | `/api/templates` | Create a template from current canvas data |
| PUT | `/api/templates/:id` | Update an existing template |
| DELETE | `/api/templates/:id` | Remove a template |
| GET | `/api/designs` | List designs (optional `templateId` query) |
| GET | `/api/designs/:id` | Fetch a design |
| POST | `/api/designs` | Create a design |
| PUT | `/api/designs/:id` | Update a design |
| DELETE | `/api/designs/:id` | Delete a design |
| GET | `/api/assets` | List asset metadata (optional `tag` query) |
| GET | `/api/assets/:id` | Fetch asset metadata |
| POST | `/api/assets/upload` | Upload an image/PDF asset |
| PUT | `/api/assets/:id` | Update asset tags |
| DELETE | `/api/assets/:id` | Remove asset metadata & file |
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Fetch a user |
| PATCH | `/api/users/:id` | Update a user |
| GET | `/api/search/suggestions` | Query templates/designs for suggestions |

Uploaded assets are written to `storage/assets/` and are served via `/uploads/<fileName>`.

### Data storage

- JSON manifests live in `storage/` and are created on first run if missing.
- Default seed data is provided under `data/` and mirrored from the former TypeScript (NestJS) backend.
- The NestJS implementation is preserved in `../backend-nest/` as an optional reference but is no longer required.

### Notes

- The server uses `crypto.randomUUID()`; run on Node.js 18+ for best compatibility.
- Increase payload limits or storage paths by editing `server.js` if you plan to handle large canvases or assets.
