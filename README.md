# Mani Mini Bot

A WhatsApp multi-device bot with a pairing-code page, GitHub-backed session storage, and a plugin-based feature set.

> **Important:** WhatsApp linked-device credentials are sensitive. Store them only in a dedicated **private** GitHub session repository. Never commit `.env`, session files, or access tokens to this source-code repository.

## Requirements

- Node.js 22 or newer and npm
- Git
- A GitHub account, a separate private repository for bot sessions, and a GitHub token with access to that session repository
- A WhatsApp account for pairing

Check the installed versions:

```bash
node --version
npm --version
```

## 1. Create a private repository for sessions

Create a new **private** repository on GitHub, for example `your-name/mani-mini-sessions`. This is where the bot stores linked-device credentials and a session index; it is separate from this code repository.

Create a GitHub fine-grained personal access token restricted to that private session repository. Grant **Contents: Read and write** and **Metadata: Read-only**. Do not use the token for this bot's code repository. If using a classic token instead, its `repo` scope is broader than necessary.

Treat this token and the session repository contents like passwords. Anyone who obtains the WhatsApp session credentials may be able to access the linked account. Revoke and replace a token if it is exposed.

## 2. Get the code and configure it

```bash
git clone https://github.com/Mani-md-bot009/Mani-Mini-bot-.git
cd Mani-Mini-bot-
cp .env.example .env
```

On Windows Command Prompt, use `copy .env.example .env` instead of `cp`.

Edit `.env` and set at least:

```dotenv
GITHUB_TOKEN=your_github_token
GITHUB_REPO=your-github-username/your-private-session-repo
GITHUB_BRANCH=main
AUTO_RECONNECT_EXISTING_SESSIONS=false
ADMIN_API_KEY=your_random_secret_at_least_32_characters
OWNER_NUMBER=your_number_with_country_code
```

Generate an admin key with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Keep it private and set it only in `.env` or the host's secret-variable settings. `OWNER_NUMBER` is the pairing allowlist: the public pairing page will accept only these numbers. Use digits with country code, no `+`, and separate multiple authorized numbers with commas and no spaces. Set your own WhatsApp number so owner-only features and pairing work for you.

The example file disables automatic status/channel actions and reconnecting saved sessions for initial setup. Set `AUTO_RECONNECT_EXISTING_SESSIONS=true` only if you intentionally want the bot to reconnect every session found in the private session repository on startup. Review all values before enabling automation. To use channel features, set your own `CHANNEL_JID` (format `...@newsletter`) and deliberately enable the related options.

## 3. Install and run locally

Run these commands from the repository root:

```bash
npm install
npm start
```

The app starts its HTTP/pairing server on port `8000` by default. Open [http://localhost:8000/ping](http://localhost:8000/ping) to check that it responds, then open [http://localhost:8000](http://localhost:8000) to use the pairing page. The `PORT` environment variable can override the port.

On the pairing page, enter an allowlisted WhatsApp number with its country code, request a pairing code, then enter that code in WhatsApp under **Linked Devices → Link with phone number**. Pair only an account you own or are authorized to manage. Pairing requests are limited to five per number every 15 minutes. When pairing completes, the bot stores its session in the private repository configured by `GITHUB_REPO`.

The page asks for `ADMIN_API_KEY` only for privileged actions such as force-pairing, disconnecting, or reconnecting an existing saved session. The key is sent in a request header, not in the URL, and is kept in the current browser tab's session storage. Never share the pairing page together with the admin key.

If startup reports missing or unsafe configuration, check that all required values in `.env` are valid. A GitHub 404 or permission error usually means the repository name is wrong, the repository is not accessible to the token, or the token lacks the required contents permissions.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | Yes | Token with access to the private session repository. Keep it secret. |
| `GITHUB_REPO` | Yes | Session repository in `owner/repository` form. |
| `GITHUB_BRANCH` | No | Session repository branch; defaults to `main`. |
| `AUTO_RECONNECT_EXISTING_SESSIONS` | No | Defaults to disabled; set to `true` only to reconnect all saved sessions on startup. |
| `ADMIN_API_KEY` | Yes | Random secret of at least 32 characters; required for admin routes. |
| `OWNER_NUMBER` | Yes | Allowlisted owner WhatsApp number(s), digits with country code; comma-separated. |
| `OWNER_NAME` | No | Display name for the bot owner. |
| `BOT_NAME` | No | Bot display name. |
| `PREFIX` | No | Command prefix; defaults to `.`. |
| `MODE` | No | Bot mode; defaults to `public`. |
| `PORT` | No | HTTP server port; defaults to `8000` (the host may set this automatically). |
| `CHANNEL_JID` | No | WhatsApp channel JID. Set this to your channel before enabling channel actions. |
| `AUTO_FOLLOW_CHANNEL` | No | Set to `true` only if you want the bot to follow the configured channel. |
| `AUTO_CHANNEL_REACT` | No | Set to `true` only if you want the bot to react to channel posts. |
| `AUTO_STATUS_SEEN` | No | Set to `true` to automatically view status updates. |
| `AUTO_STATUS_REACT` | No | Set to `true` to automatically react to status updates. |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot token for optional notifications. Keep it secret. |
| `TELEGRAM_CHAT_ID` | No | Destination chat for optional Telegram notifications. |
| `BACKEND_URL` | Vercel only | Public URL of the deployed bot server, e.g. `https://your-app.up.railway.app`. |

The full configuration and additional optional switches are in `config.js` and `settings.js`. Use environment variables in `.env` or your hosting provider's secret-variable settings; do not put real credentials in source files.

## Deploy to Railway

The repository includes a Railway configuration that starts the app with `node index.js`.

1. Create a Railway project and deploy this repository from GitHub.
2. In the Railway service's **Variables** settings, add `GITHUB_TOKEN`, `GITHUB_REPO`, `ADMIN_API_KEY`, and your `OWNER_NUMBER`. Add any other settings you need. Enter secrets directly in Railway's variable UI, not in GitHub files.
3. Deploy the service and generate a public domain in Railway's networking settings.
4. Open `https://YOUR-RAILWAY-DOMAIN/ping` and confirm that it returns an active status. Open the domain root to use the pairing page.
5. Complete WhatsApp pairing using the steps above.

Keep the session-storage repository private. Railway's persistent disk is not required for the bot's GitHub-backed session storage.

## Optional: host the pairing page on Vercel

Vercel serves the pairing page and proxies requests to the bot server; it does **not** run the WhatsApp bot process. Deploy the same repository to Vercel only after the bot server is running elsewhere (for example, on Railway).

In Vercel's project **Settings → Environment Variables**, set `BACKEND_URL` to the Railway service's public base URL, without a trailing slash. Redeploy Vercel, then open the Vercel URL. Keep `GITHUB_TOKEN` and all WhatsApp/session credentials on the bot server only; do not add them to Vercel.

## Troubleshooting

- **Startup reports unsafe or missing configuration:** Set a real GitHub token with access to the private session repo, `GITHUB_REPO` as `owner/repository`, a random `ADMIN_API_KEY` of at least 32 characters, and at least one valid `OWNER_NUMBER`.
- **Pairing says the number is not authorized:** The number must exactly match one of the comma-separated numbers in `OWNER_NUMBER` (digits only).
- **Saved session requires admin key:** Enter your `ADMIN_API_KEY` when the pairing page prompts; this permits the existing session to reconnect.
- **GitHub 401/403/404:** Check that the token is valid, has access to the private session repository, and has contents read/write permission. Confirm `GITHUB_REPO` is exactly `owner/repository`.
- **Pairing page loads but pairing requests fail on Vercel:** Check that `BACKEND_URL` points to the running bot server and that the Railway `/ping` endpoint responds.
- **Wrong owner-only behavior:** Set `OWNER_NUMBER` to the WhatsApp number that paired the bot; use 8–15 digits with country code and no leading `+` (comma-separate multiple numbers).
- **Port already in use:** Set `PORT` to an available port.

## Features

- WhatsApp pairing-code web page
- GitHub-backed linked-device session storage
- Plugin-based commands and media utilities
- Optional channel reactions/following and Telegram notifications

## Security checklist

- Keep the session repository private and dedicated to bot sessions.
- Never commit `.env`, tokens, WhatsApp credentials, or generated session directories.
- Use a token restricted to the session repository and only the permissions the bot needs.
- Keep `ADMIN_API_KEY` private; admin-only API routes and destructive controls require it.
- Pairing is limited to the number(s) configured in `OWNER_NUMBER`.
- Disable automatic actions until you have reviewed the channel and status settings.
- Do not publish pairing or bot-management endpoints to an untrusted audience.
