require("dotenv").config();
const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

// ---------- MODE / ENV CONFIG ----------

const MODE = process.env.GIFQ_MODE === "live" ? "live" : "mock";
const GIFQ_ENV = process.env.GIFQ_ENV === "production" ? "production" : "sandbox";
const GIFQ_HOST = GIFQ_ENV === "production" ? "api.gifq.com" : "api-sandbox.gifq.com";
const GIFQ_BASE_URL = `https://${GIFQ_HOST}/api`;

console.log("🚀 GIFQ Gift Service starting...");
console.log("   MODE      :", MODE);
console.log("   GIFQ_ENV  :", GIFQ_ENV);
console.log("   GIFQ_BASE :", GIFQ_BASE_URL);

// ---------- SMTP SETUP ----------

let transporter = null;
let smtpReady = false;

function initializeTransporter() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SENDER_EMAIL
  ) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      smtpReady = true;
      console.log("📧 SMTP ready: emails can be sent");
    }
    return transporter;
  } else {
    console.warn("⚠️ SMTP not fully configured in .env");
    return null;
  }
}

// ---------- HELPERS ----------

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function callGifq(method, path, data) {
  if (!process.env.GIFQ_API_KEY) {
    throw new Error("GIFQ_API_KEY missing in environment");
  }

  const url = `${GIFQ_BASE_URL}${path}`;
  const res = await axios({
    method,
    url,
    data,
    headers: {
      "X-Api-Token": process.env.GIFQ_API_KEY,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

async function sendGiftEmail(to, order, isMock) {
  const trans = initializeTransporter();
  if (!trans) {
    console.warn("⚠️ SMTP not ready, skipping email send.");
    return;
  }

  const redemption = order?.redemption || {};
  const giftCode = redemption.code || order?.redemption_code || null;
  const redeemLink = redemption.link || order?.redemption_url || null;
  const pin = redemption.pin || null;
  const secretCode = redemption.secret_code || null;
  const securityCode = redemption.security_code || null;
  const serialNumber = redemption.serial_number || null;
  const instructions = redemption.instructions || order?.instructions || null;

  const subject = isMock
    ? "🎁 [TEST] Your Mock Gift Card"
    : `🎁 Your ${order.title || order.brand} Gift Card`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .gift-icon { font-size: 50px; margin: 10px 0; }
        .content { padding: 30px; }
        .gift-card-box { background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); border: 2px solid #fb923c; padding: 25px; margin: 20px 0; border-radius: 12px; text-align: center; }
        .gift-amount { font-size: 32px; font-weight: bold; color: #ea580c; margin: 10px 0; }
        .gift-brand { font-size: 20px; color: #9a3412; margin: 5px 0; }
        .redemption-section { background: #f8fafc; border: 2px solid #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .redemption-section h3 { margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .redemption-item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #10b981; }
        .redemption-label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .redemption-value { font-family: 'Courier New', monospace; font-size: 18px; color: #1e293b; word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; }
        .redeem-button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .instructions-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .mock-warning { background: #fee2e2; border: 2px solid #ef4444; color: #991b1b; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; font-weight: bold; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="gift-icon">🎁</div>
          <h1>Your Gift Card Has Arrived!</h1>
        </div>
        <div class="content">
          ${isMock ? '<div class="mock-warning">⚠️ THIS IS A TEST GIFT CARD - NO REAL VALUE ⚠️</div>' : ''}
          <p>Hello! 👋</p>
          <p>Great news! Your digital gift card is ready to use.</p>
          <div class="gift-card-box">
            <div class="gift-amount">${order.currency || ''} ${order.face_value || 'N/A'}</div>
            <div class="gift-brand">${order.title || order.brand || 'Gift Card'}</div>
            ${order.expires_at ? `<p style="color: #9a3412; margin-top: 10px;">⏰ Expires: ${new Date(order.expires_at).toLocaleDateString()}</p>` : ''}
          </div>
          <div class="redemption-section">
            <h3>🔑 Redemption Details</h3>
            ${giftCode ? `<div class="redemption-item"><div class="redemption-label">Gift Card Code</div><div class="redemption-value">${giftCode}</div></div>` : ''}
            ${pin ? `<div class="redemption-item"><div class="redemption-label">PIN</div><div class="redemption-value">${pin}</div></div>` : ''}
            ${serialNumber ? `<div class="redemption-item"><div class="redemption-label">Serial Number</div><div class="redemption-value">${serialNumber}</div></div>` : ''}
            ${secretCode ? `<div class="redemption-item"><div class="redemption-label">Secret Code</div><div class="redemption-value">${secretCode}</div></div>` : ''}
            ${securityCode ? `<div class="redemption-item"><div class="redemption-label">Security Code</div><div class="redemption-value">${securityCode}</div></div>` : ''}
            ${redeemLink ? `<div style="text-align: center;"><a href="${redeemLink}" class="redeem-button">🎯 Redeem Your Gift Card</a></div>` : ''}
          </div>
          ${instructions ? `<div class="instructions-box"><p><strong>📋 Redemption Instructions:</strong></p><p>${instructions}</p></div>` : ''}
          <div class="info-box">
            <p><strong>💡 Important Information:</strong></p>
            <p>• Keep this email safe - it contains your gift card details</p>
            <p>• Gift cards are non-refundable and cannot be exchanged for cash</p>
            <p>• Use your gift card before the expiration date</p>
          </div>
        </div>
        <div class="footer">
          <p><strong>Thank you for shopping with dMarketplace!</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `🎁 YOUR GIFT CARD\n\n${order.currency} ${order.face_value} - ${order.title || order.brand}\n\nCode: ${giftCode || 'N/A'}\n${pin ? `PIN: ${pin}` : ''}\n${redeemLink ? `Redeem: ${redeemLink}` : ''}`;

  await trans.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    text,
    html: htmlContent,
  });

  console.log(`📧 Gift email sent to ${to}`);
}

// Helper functions for order confirmation route
async function findOrderByReference(reference, maxAttempts = 15, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔍 Searching for order with reference: ${reference} (attempt ${attempt}/${maxAttempts})...`);

      const ordersResponse = await fetch(`${GIFQ_BASE_URL}/orders?page=1`, {
        headers: {
          'accept': 'application/json',
          'X-Api-Token': process.env.GIFQ_API_KEY
        }
      });

      if (!ordersResponse.ok) {
        throw new Error(`Orders API returned ${ordersResponse.status}`);
      }

      const orders = await ordersResponse.json();
      const matchedOrder = orders.find(order => order.reference === reference);

      if (matchedOrder) {
        if (matchedOrder.status === 'completed' || matchedOrder.status === 'complete') {
          return await getOrderDetails(matchedOrder.id);
        } else if (matchedOrder.status === 'failed' || matchedOrder.status === 'error') {
          throw new Error(`Gift card order failed`);
        }
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (err) {
      console.error(`❌ Error finding order:`, err.message);
      if (attempt === maxAttempts) throw err;
    }
  }
  throw new Error('Gift card order not found after polling');
}

async function getOrderDetails(orderId) {
  const detailsResponse = await fetch(`${GIFQ_BASE_URL}/orders/${orderId}`, {
    headers: {
      'accept': 'application/json',
      'X-Api-Token': process.env.GIFQ_API_KEY
    }
  });

  if (!detailsResponse.ok) {
    throw new Error(`Order details API returned ${detailsResponse.status}`);
  }

  return await detailsResponse.json();
}

// ---------- ROUTES ----------

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    mode: MODE,
    gifqEnv: GIFQ_ENV,
    baseUrl: GIFQ_BASE_URL,
    smtpReady: !!initializeTransporter(),
  });
});

// GET ALL PRODUCTS/CATALOG
app.get("/products", async (req, res) => {
  try {
    if (MODE === "mock") {
      return res.json({
        ok: true,
        mode: "mock",
        products: [
          {
            brand: "amazon",
            title: "Amazon",
            products: [
              {
                currency: "INR",
                min_face_value: 100,
                countries: ["IN"],
              },
            ],
          },
        ],
      });
    }

    const products = await callGifq("get", "/products?page=1");
    return res.json({
      ok: true,
      mode: "live",
      products,
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    return res.status(err.response?.status || 500).json({
      ok: false,
      error: "Failed to fetch products",
    });
  }
});

// SEARCH FOR PRODUCTS (e.g., India/Amazon brands)
app.get("/products/search", async (req, res) => {
  try {
    const { country, brand } = req.query;

    if (MODE === "mock") {
      return res.json({
        ok: true,
        mode: "mock",
        results: [
          {
            brand: "amazon",
            title: "Amazon",
            currency: "INR",
            min_face_value: 100,
            country: "IN",
          },
        ],
      });
    }

    const allProducts = await callGifq("get", "/products?page=1");
    let filtered = allProducts;

    if (country) {
      filtered = filtered.filter((p) =>
        p.products.some((prod) => prod.countries && prod.countries.includes(country))
      );
    }

    if (brand) {
      filtered = filtered.filter((p) =>
        p.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    return res.json({
      ok: true,
      mode: "live",
      results: filtered,
    });
  } catch (err) {
    console.error("❌ Error searching products:", err.message);
    return res.status(err.response?.status || 500).json({
      ok: false,
      error: "Failed to search products",
    });
  }
});

// CREATE ORDER + SEND EMAIL
app.post("/orders", async (req, res) => {
  try {
    const { email, brand, country, currency, amount, reference } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required" });
    }

    if (!brand || !country || !currency || !amount) {
      return res.status(400).json({
        ok: false,
        error: "brand, country, currency, amount are required",
      });
    }

    const faceValue = Number(amount);
    if (!faceValue || faceValue <= 0) {
      return res.status(400).json({ ok: false, error: "amount must be positive" });
    }

    const ref = reference || `order-${Date.now()}`;
    let order;
    const isMock = MODE === "mock";

    if (MODE === "mock") {
      order = {
        id: `mock_${Date.now()}`,
        brand,
        country,
        currency,
        face_value: faceValue,
        reference: ref,
        status: "completed",
        redemption: {
          code: "MOCK-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          link: "https://example.com/redeem/mock",
        },
      };
    } else {
      const payload = { brand, currency, face_value: faceValue, country, reference: ref };
      order = await callGifq("post", "/orders", payload);
    }

    try {
      await sendGiftEmail(email, order, isMock);
    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr.message);
    }

    return res.json({ ok: true, mode: MODE, order });
  } catch (err) {
    console.error("❌ Error:", err.message);
    return res.status(err.response?.status || 500).json({
      ok: false,
      error: err.response?.data?.message || "Failed to create order",
    });
  }
});

// GET ORDER STATUS
app.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ ok: false, error: "Order ID required" });
    }

    if (MODE === "mock") {
      return res.json({
        ok: true,
        mode: "mock",
        order: { id, status: "completed", redemption: { code: "MOCK-REDEEM" } },
      });
    }

    const order = await callGifq("get", `/orders/${id}`);
    return res.json({ ok: true, mode: "live", order });
  } catch (err) {
    console.error("❌ Error:", err.message);
    return res.status(err.response?.status || 500).json({
      ok: false,
      error: "Failed to fetch order",
    });
  }
});

// SEND STORE APPROVAL EMAIL
app.post("/emails/store-approval", async (req, res) => {
  try {
    console.log("approve email request reached here ")
    const { email, merchantId } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "Valid email required" });
    }

    if (!merchantId) {
      return res.status(400).json({ ok: false, error: "Merchant ID required" });
    }

    const trans = initializeTransporter();
    if (!trans) {
      return res.status(503).json({ ok: false, error: "Email service not configured" });
    }

    const subject = "🎊 Congratulations! Your Store Has Been Approved";

    const dashboardUrl = `https://dmarketplace-merchant.vercel.app/${merchantId}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px; }
          .checkmark { font-size: 60px; text-align: center; color: #10b981; margin: 20px 0; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Store Approved!</h1>
          </div>
          <div class="content">
            <div class="checkmark">✓</div>
            <h2 style="text-align: center; color: #065f46;">Congratulations!</h2>
            <p>Your store has been successfully approved and is now live on dMarketplace.</p>
            <p>You can now access your merchant dashboard to manage your products, orders, and store settings.</p>
            <center>
              <a href="${dashboardUrl}" class="cta-button">Access Merchant Dashboard →</a>
            </center>
            <div class="footer">
              <p><strong>Welcome to dMarketplace!</strong></p>
              <p style="color: #94a3b8; font-size: 12px;">Dashboard URL: ${dashboardUrl}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `🎊 Congratulations! Your Store Has Been Approved\n\nYour store is now live on dMarketplace.\n\nYou can now access your merchant dashboard to manage your products, orders, and store settings.\n\nDashboard: ${dashboardUrl}`;

    await trans.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`📧 Store approval email sent to ${email}`);
    return res.json({ ok: true, message: "Store approval email sent", email });
  } catch (err) {
    console.error("❌ Error:", err.message);
    return res.status(500).json({ ok: false, error: "Failed to send email" });
  }
});
// SEND ORDER CONFIRMATION EMAIL WITH GIFQ GIFT CARD
app.post("/emails/order-confirmation", async (req, res) => {
  try {
    const { email, orderDetails } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "Valid email required" });
    }

    if (!orderDetails?.productName) {
      return res.status(400).json({ ok: false, error: "Order details required" });
    }

    const trans = initializeTransporter();
    if (!trans) {
      return res.status(503).json({ ok: false, error: "Email service not configured" });
    }

    const {
      orderId,
      productName,
      productImg,
      quantity,
      productPrice,
      totalAmount,
      deliveryAddress,
      city,
      state,
      zipCode,
      country,
    } = orderDetails;

    // FETCH GIFQ PRODUCTS & CREATE GIFT CARD
    let selectedGiftCard = null;
    let giftCardOrder = null;
    let giftCardError = null;

    try {
      const gifqResponse = await fetch(`${GIFQ_BASE_URL}/products?page=1`, {
        headers: {
          'accept': 'application/json',
          'X-Api-Token': process.env.GIFQ_API_KEY
        }
      });

      if (gifqResponse.ok) {
        const allProducts = await gifqResponse.json();
        const availableProducts = [];

        for (const brand of allProducts) {
          const countryProducts = brand.products.filter(p =>
            p.countries && p.countries.includes(country)
          );

          if (countryProducts.length > 0) {
            const minProduct = countryProducts.reduce((min, current) =>
              current.min_face_value < min.min_face_value ? current : min
            );

            availableProducts.push({
              brand: brand.brand,
              title: brand.title,
              currency: minProduct.currency,
              face_value: minProduct.min_face_value,
              country: country,
              discount: minProduct.discount,
              expiry: minProduct.expiry
            });
          }
        }

        if (availableProducts.length > 0) {
          selectedGiftCard = availableProducts.reduce((min, current) =>
            current.face_value < min.face_value ? current : min
          );

          // Create GIFQ order
          const gifqPayload = {
            brand: selectedGiftCard.brand,
            currency: selectedGiftCard.currency,
            face_value: selectedGiftCard.face_value,
            country: selectedGiftCard.country,
            reference: `order-${orderId || Date.now()}-gift-${Date.now()}`,
          };

          const orderResponse = await fetch(`${GIFQ_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'X-Api-Token': process.env.GIFQ_API_KEY
            },
            body: JSON.stringify(gifqPayload)
          });

          if (orderResponse.ok) {
            const initialOrder = await orderResponse.json();
            const completedGiftCard = await findOrderByReference(gifqPayload.reference);

            const redemptionData = {
              code: completedGiftCard.redeem_details?.code || completedGiftCard.code || null,
              pin: completedGiftCard.redeem_details?.pin || completedGiftCard.pin || null,
              link: completedGiftCard.redeem_details?.link || completedGiftCard.link || null,
              secret_code: completedGiftCard.redeem_details?.secret_code || null,
              security_code: completedGiftCard.redeem_details?.security_code || null,
              serial_number: completedGiftCard.redeem_details?.serial_number || null,
              instructions: completedGiftCard.instructions || null
            };

            giftCardOrder = {
              id: completedGiftCard.id,
              brand: selectedGiftCard.brand,
              title: selectedGiftCard.title,
              currency: completedGiftCard.currency,
              face_value: completedGiftCard.face_value,
              country: selectedGiftCard.country,
              redemption: redemptionData,
              status: completedGiftCard.status,
              expires_at: completedGiftCard.expires_at
            };

            await sendGiftEmail(email, giftCardOrder, false);
          }
        }
      }
    } catch (gifqErr) {
      console.error("❌ GIFQ gift card error:", gifqErr.message);
      giftCardError = gifqErr.message;
    }

    // SEND ORDER CONFIRMATION EMAIL
    const subject = "✅ Order Confirmed - dMarketplace";

    const giftCardSection = giftCardOrder ? `
      <div style="background: #fff7ed; border: 2px solid #fb923c; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
        <h3 style="color: #ea580c;">🎁 Special Thank You Gift!</h3>
        <p style="font-size: 28px; font-weight: bold; color: #ea580c;">${giftCardOrder.currency} ${giftCardOrder.face_value} Gift Card</p>
        <p style="font-size: 14px; color: #78350f;">${selectedGiftCard.title}</p>
        <p>As a token of our appreciation, we've sent you a bonus gift card!</p>
        <p style="font-size: 14px; color: #78350f;">📧 Check your inbox for a separate email with your gift card code.</p>
      </div>
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 50px;">✓</div>
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p><strong>Order Status:</strong> Payment Pending</p>
            ${orderId ? `<p><strong>Order ID:</strong> #${orderId}</p>` : ''}
            ${giftCardSection}
            <h3>Order Details</h3>
            <p><strong>${productName}</strong></p>
            <p>Quantity: ${quantity || 1} | Price: €${productPrice}</p>
            <p><strong>Total: €${totalAmount || productPrice * (quantity || 1)}</strong></p>
            <h3>Shipping Address</h3>
            <p>${deliveryAddress}<br>${city}, ${state} ${zipCode}<br>${country}</p>
            <p>Thank you for shopping with dMarketplace!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `Order Confirmed!\n\nOrder ID: ${orderId}\nProduct: ${productName}\nTotal: €${totalAmount}\n\nShipping: ${deliveryAddress}, ${city}, ${state} ${zipCode}, ${country}`;

    await trans.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`📧 Order confirmation sent to ${email}`);

    return res.json({
      ok: true,
      message: "Order confirmation email sent",
      email,
      giftCard: giftCardOrder ? {
        status: "sent",
        orderId: giftCardOrder.id,
        amount: `${giftCardOrder.currency} ${giftCardOrder.face_value}`,
        brand: selectedGiftCard.title,
      } : {
        status: "failed",
        error: giftCardError || "Unknown error"
      }
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
    return res.status(500).json({
      ok: false,
      error: "Failed to send order confirmation email",
    });
  }
});



// Export for Vercel
module.exports = app;

// Local development server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log("   GET  /health");
    console.log("   GET  /products");
    console.log("   GET  /products/search");
    console.log("   POST /orders");
    console.log("   GET  /orders/:id");
    console.log("   POST /emails/store-approval");
    console.log("   POST /emails/order-confirmation");
  })
};