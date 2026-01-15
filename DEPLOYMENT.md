## Deployment Guide (Netlify)

### Prerequisites
- Netlify account
- Supabase project with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Steps
1. Push repository to your Git provider.
2. In Netlify, create a new site from Git.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variables:
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `VITE_SERVER_URL` (optional)
6. Deploy. Netlify will run the build and serve the SPA.

### Local Preview
```bash
npm run build
npm run preview
# opens http://localhost:4173
```

### Notes
- This app is a SPA; ensure Netlify handles SPA routing (netlify.toml is included).
- For strict CSPs, add rules to allow Supabase endpoints and websocket domains.



