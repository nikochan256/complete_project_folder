# GIFQ + SMTP Gift Sender (Node.js)

This is a small Node.js service that:

- Creates **gift orders** with GIFQ (mock or live)
- Sends the gift details to the recipient via **SMTP email**
- Lets you **check order status** later

## 1. Folder structure

```text
gifq-sender/
 ├─ index.js
 ├─ package.json
 └─ .env        # you create this from .env.example
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env   # or copy manually on Windows
```

Edit `.env`:

- For **mock testing (no real GIFQ)**:

```env
GIFQ_MODE=mock
GIFQ_ENV=sandbox
PORT=3000

# Optional: SMTP if you want real emails in mock
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD_HERE
SENDER_EMAIL=your@gmail.com
```

- For **live GIFQ (sandbox)**:

```env
GIFQ_MODE=live
GIFQ_ENV=sandbox
GIFQ_API_KEY=YOUR_GIFQ_SANDBOX_API_KEY_HERE

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD_HERE
SENDER_EMAIL=your@gmail.com

PORT=3000
```

> ⚠️ For Gmail you MUST use an **App Password** in `SMTP_PASS` (not your normal password).

## 4. Run the server

```bash
npm start
# or
node index.js
```

You should see logs like:

```text
🚀 GIFQ Gift Service starting...
   MODE      : mock
   GIFQ_ENV  : sandbox
   GIFQ_BASE : https://api-sandbox.gifq.com/api
📧 SMTP ready: emails can be sent   # if SMTP is correct
✅ Server running on http://localhost:3000
   GET  /health
   POST /orders
   GET  /orders/:id
```

## 5. Test with Postman

### 5.1 Health check

- **Method:** GET  
- **URL:** `http://localhost:3000/health`

You should see JSON with `mode`, `gifqEnv`, `smtpReady`.

### 5.2 Create order + send gift email

- **Method:** POST  
- **URL:** `http://localhost:3000/orders`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**

```json
{
  "email": "recipient@example.com",
  "brand": "YOUR_BRAND_SLUG",
  "country": "IN",
  "currency": "INR",
  "amount": 100,
  "reference": "test-order-001"
}
```

- In **mock** mode:
  - Returns a fake order with `redemption.code` and `redemption.link`
  - Sends a **test email** if SMTP is configured
- In **live** mode:
  - Calls `POST https://{env}.gifq.com/api/orders` with your API key
  - Sends a real email with whatever GIFQ returns

If GIFQ doesn’t have that brand/country/currency/amount combination, you’ll get an error like:

```json
{
  "ok": false,
  "mode": "live",
  "error": "No products found for brand [...] in [...] with currency [...] and face value [...]."
}
```

Use your GIFQ catalog values.

### 5.3 Get order status

- **Method:** GET  
- **URL:** `http://localhost:3000/orders/{id}`

Example:

```text
GET http://localhost:3000/orders/ord_123
```

- In **mock** mode: returns a fake completed order with mock redemption.
- In **live** mode: calls `GET https://{env}.gifq.com/api/orders/{id}` and returns the real order (including redemption when completed).

## 6. Integrating with your app

From your Next.js / GoCart / any client:

- To **send a gift**: call `POST /orders` from your backend or directly (if CORS allowed)
- To **check status**: call `GET /orders/:id` until `status === "completed"` and show `redemption.code` / `redemption.link` to the user.

This repo is intentionally small and focused so you can drop it into your stack quickly.
