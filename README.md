# Mihir Thakker: portfolio

React + Vite single-page site, deployed on Netlify (behind Cloudflare).

## Updating content

All text lives in `content/` and is editable without touching code:

- `content/site.json`: name, hero text, about, contact, social links
- `content/experience.json`: roles
- `content/skills.json`: skill groups
- `content/projects/*.json`: one file per project

**Web editor:** go to `https://mihirthakker.com/admin`, log in with GitHub, edit and publish.
Each publish is a commit to `master`; Netlify rebuilds and the site updates in about a minute.

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

## Contact form protection

The form can be protected by [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) (free).
With a site key set, the form sends to `netlify/functions/contact.mjs`, which verifies the Turnstile token
on the server and only then emails the message to you through [Resend](https://resend.com). With no key set
it falls back to sending straight from the browser via EmailJS, as before.

One-time setup:

1. **Resend:** create an account and an API key (starts with `re_`).
   The default sender (`onboarding@resend.dev`) can only deliver to the email address of your own Resend account.
   To send to any address, verify your domain in Resend and set `CONTACT_FROM`.
2. **Cloudflare dashboard > Turnstile:** add a widget for `mihirthakker.com`. Copy the **site key** and **secret key**.
3. **Netlify > Project configuration > Environment variables**, then redeploy:
   - `TURNSTILE_SECRET_KEY`: the Turnstile secret key
   - `RESEND_API_KEY`: the Resend API key
   - `CONTACT_TO_EMAIL`: where messages are delivered
   - `CONTACT_FROM` (optional): e.g. `Portfolio <contact@mihirthakker.com>`
4. **Editor (`/admin`) > Site settings > Profile & contact:** paste the Turnstile **site key** into
   *Cloudflare Turnstile site key* and publish. Do this last: with a site key set but the variables missing,
   the form shows an error. Clearing the field switches the check off again.

Test the function with `npm test`.

## Security headers

`netlify.toml` sets browser protections on every response (no framing, no MIME sniffing, a strict referrer
policy, a locked-down permissions policy) and a Content-Security-Policy on the site's pages (not on `/admin`).
Scripts allow `'unsafe-inline'` because Cloudflare injects its own inline bot-detection script on each request.
If you add a new third-party script, font or API, add its host to the policy in `netlify.toml`.
