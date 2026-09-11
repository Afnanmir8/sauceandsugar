# Sauce And Sugar setup

## Local development

Use two terminals from the project folder.

Terminal 1:

```bash
npm run server
```

Terminal 2:

```bash
npm run dev
```

Open http://localhost:5173/.

When a customer selects an area/locality, the backend calculates the configured locality fee. On submit, the backend recalculates the order before the website opens WhatsApp with the final order message addressed to `+91 93412 31420`.

Health check:

```text
http://localhost:8787/health
```

## Admin dashboard

Set a strong private `ADMIN_TOKEN` in `.env`, then restart the Node server. Open `http://localhost:5173/?admin=1` and sign in with that token. The dashboard manages order statuses and the current batch/week labels.

Do not share the admin URL or token with customers. The token is checked by the Node API for every admin request.

## Production

See `DEPLOY.md` for the GitHub + Render walkthrough. The live server builds the site and serves both the website and the API from one URL.

WhatsApp cannot receive a message silently from a browser. The site can open a prepared chat, but the customer must press Send. The number must have WhatsApp enabled.

## Locality delivery setup

Set `DELIVERY_FEES_BY_AREA` on the Node server to configure locality prices. Supported fees are ₹40, ₹50, and ₹80. Orders with a subtotal of ₹999 or more remain free.
