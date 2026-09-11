# Deploy Sauce And Sugar

This puts the **website and the order API on one URL**. Customers open that URL, place an order, and WhatsApp still opens with the message ready to send.

You will need:
- A [GitHub](https://github.com/) account
- A [Render](https://render.com/) account (sign up with GitHub)
- A paid Render **Starter** web service (about $7/month) so orders and stock are saved on a disk. The free plan sleeps and can wipe JSON data on restart.

Do not upload your `.env` file. Secrets go into Render’s dashboard only.

---

## 1. Put the project on GitHub

1. Install [Git](https://git-scm.com/download/win) if it is missing, then open PowerShell in `D:\sauce-and-sugar-pre-order-site`.
2. Create a new **private** GitHub repository named `sauce-and-sugar-pre-order-site` (do not add a README on GitHub).
3. In PowerShell:

```powershell
git init
git add .
git commit -m "Ready to deploy Sauce And Sugar"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/sauce-and-sugar-pre-order-site.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username.

---

## 2. Create the Render web service

1. Open [https://dashboard.render.com/](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New** → **Web Service**.
3. Connect the `sauce-and-sugar-pre-order-site` repo.
4. Use these settings:

| Field | Value |
| --- | --- |
| Name | `sauce-and-sugar` |
| Region | Singapore (or closest to Ranchi) |
| Branch | `main` |
| Runtime | Node |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Instance type | **Starter** (needed for a disk) |

5. Open **Environment** and add:

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `22` |
| `ADMIN_TOKEN` | a long secret only you know (this is the admin password) |
| `DATA_DIR` | `/var/data` |
| `DELIVERY_FEES_BY_AREA` | paste the JSON from `.env.example`, then edit fees if needed |

**Do not** set `VITE_ORDER_ENDPOINT` on Render. The live site must call `/api/...` on the same host.

Allowed delivery fees are `40`, `50`, and `80` only.

6. Open **Disk**:
   - Name: `sauce-data`
   - Mount path: `/var/data`
   - Size: `1 GB`

7. Click **Deploy web service**. Wait until the logs show `Sauce And Sugar listening`.

---

## 3. Check the live site

Render gives you a URL like `https://sauce-and-sugar.onrender.com`.

1. Open that URL. The menu should load.
2. Open `https://YOUR-RENDER-URL/health`. You should see `{"ok":true}`.
3. Place a small test order. WhatsApp should open with the message. Tap **Send**.
4. Refresh the menu. Stock for that item should drop by the quantity ordered.

Admin:
1. Open `https://YOUR-RENDER-URL/?admin=1`
2. Sign in with the same `ADMIN_TOKEN` you set on Render
3. Do not share that URL or token with customers

---

## 4. Custom domain (optional)

In the Render service → **Custom Domains**, add `orders.yourdomain.com` (or similar) and follow the DNS instructions Render shows. After HTTPS is active, use that domain for customers and for `/?admin=1`.

---

## After deploy

- Push to `main` and Render rebuilds automatically.
- Changing `ADMIN_TOKEN` or delivery fees: edit env vars on Render, then **Manual Deploy** → **Deploy latest commit**.
- Changing menu photos or frontend code: commit, push, wait for the build.
- WhatsApp still requires the customer to press **Send**. No WhatsApp Business API is required.

## If something fails

- **Admin service is offline** — the Render service is not running, or you set `VITE_ORDER_ENDPOINT` by mistake.
- **Stock resets after restart** — the disk is missing or `DATA_DIR` is not `/var/data`.
- **Invalid delivery area fee** — every area in `DELIVERY_FEES_BY_AREA` must be 40, 50, or 80.
- **Build fails** — check the Render build log and confirm Node 22.
