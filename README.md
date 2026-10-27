# Mihir Thakker: portfolio

React + Vite single-page site, deployed on Netlify (behind Cloudflare).

## Updating content

All text lives in `content/` and is editable without touching code:

- `content/site.json`: name, hero text, about, contact, social links
- `content/experience.json`: roles
- `content/skills.json`: skill groups
- `content/projects/*.json`: one file per project

**Web editor:** go to `https://mihirthakker.com/admin`, log in with GitHub, edit and publish.
Each publish is a commit to `main`; Netlify rebuilds and the site updates in about a minute.

### One-time CMS setup
1. GitHub → Settings → Developer settings → OAuth Apps → New. Homepage URL `https://mihirthakker.com`,
   callback URL `https://api.netlify.com/auth/done`.
2. Netlify → Site configuration → Access & security → OAuth → Install provider → GitHub, paste the Client ID and Secret.

## Development
```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # outputs dist/
```
