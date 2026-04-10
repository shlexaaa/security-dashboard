# Security Dashboard

A web security scanner that checks HTTP security headers and DNS records for any website.

## Setup

1. Clone or download the project
2. Run: `npm run install:all`
3. Copy `.env.example` to `.env` (no changes needed)
4. Run: `npm run dev`
5. Open: http://localhost:5173

## How to use the AI analysis

After a scan completes, copy the generated prompt and paste it into [claude.ai](https://claude.ai).
Claude will give you a free, detailed security analysis with prioritized recommendations.

## Production build

```
npm run build
npm start
```

## Notes

- Only scan websites you own or have explicit permission to test
- External API calls (HackerTarget) are proxied through the Express server
- Scan history is stored locally in `data/db.json`
