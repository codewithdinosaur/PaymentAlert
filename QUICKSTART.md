# Quick Start Guide - Payment Alert with Real-time Overlay

This guide will help you get the Payment Alert system with real-time overlay up and running quickly.

## Prerequisites

- Node.js 16+ installed
- Razorpay account with API credentials
- OBS Studio (for overlay testing)

## Step 1: Backend Setup (5 minutes)

1. **Install backend dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your Razorpay credentials**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxx
   PORT=3000
   NODE_ENV=development
   DONATION_GOAL=10000
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

   You should see:
   ```
   🚀 Payment Alert API server running on port 3000
   📊 Health check: http://localhost:3000/health
   🌍 Environment: development
   🔌 Socket.IO enabled for real-time alerts
   ```

## Step 2: Overlay Setup (5 minutes)

1. **Navigate to overlay directory**
   ```bash
   cd overlay
   ```

2. **Install overlay dependencies**
   ```bash
   npm install
   ```

3. **Create overlay environment file**
   ```bash
   cp .env.example .env
   ```

4. **Edit `overlay/.env` (defaults are fine for local testing)**
   ```env
   VITE_SOCKET_URL=http://localhost:3000
   VITE_API_URL=http://localhost:3000/api
   VITE_THEME=gold
   VITE_DONATION_GOAL=10000
   VITE_ENABLE_AUDIO=true
   ```

5. **Start the overlay**
   ```bash
   npm run dev
   ```

   The overlay will open at `http://localhost:5173`

## Step 3: OBS Browser Source Setup (2 minutes)

1. **Open OBS Studio**

2. **Add Browser Source**
   - Click `+` in Sources panel
   - Select **Browser**
   - Name it "Donation Alert Overlay"

3. **Configure Browser Source**
   - URL: `http://localhost:5173`
   - Width: `1920`
   - Height: `1080`
   - ✅ Check "Shutdown source when not visible"
   - ✅ Check "Refresh browser when scene becomes active"
   - Custom CSS:
     ```css
     body { background-color: transparent; margin: 0px auto; overflow: hidden; }
     ```

4. **Click OK**

You should now see:
- Connection status indicator (green dot in top-right)
- Donation goal widget (bottom-left)
- Recent donations list (bottom-left)

## Step 4: Test the System (3 minutes)

### Option A: Create a Test Order

1. **Create an order via API**
   ```bash
   curl -X POST http://localhost:3000/api/payments/create-order \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 1000,
       "contact": "+919876543210",
       "email": "test@example.com",
       "description": "Test donation for overlay"
     }'
   ```

2. **Note the `order_id` from the response**

3. **Manually mark it as paid in database** (for testing only)
   ```bash
   sqlite3 payment.db "UPDATE orders SET status='paid' WHERE razorpay_order_id='<order_id>'"
   ```

### Option B: Simulate a Webhook (Easier)

1. **First, create a test order in the database**
   ```bash
   sqlite3 payment.db "INSERT INTO orders (razorpay_order_id, amount, currency, status, contact, email, description, payment_method) VALUES ('order_test123', 1000, 'INR', 'created', 'Test User', 'test@example.com', 'Testing the overlay!', 'upi')"
   ```

2. **Trigger a webhook event** (this will broadcast to the overlay)
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/razorpay \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: test" \
     -d '{
       "event": "payment.captured",
       "payload": {
         "payment": {
           "id": "pay_test123",
           "order_id": "order_test123",
           "amount": 100000,
           "method": "upi"
         }
       }
     }'
   ```

   **Note:** This will fail signature verification. For testing, you can temporarily comment out the signature check in `routes/webhook.js`.

3. **Watch your OBS overlay!**
   - A donation popup should appear on the right side
   - The donation should be added to the recent donations list
   - The donation goal progress should update

## Donation Tier Examples

Test different tiers by changing the amount:

```bash
# Basic Tier (₹1-499) - Green theme
"amount": 10000  # ₹100

# Silver Tier (₹500-999) - Silver gradient
"amount": 75000  # ₹750

# Gold Tier (₹1000-4999) - Gold gradient with glow
"amount": 200000  # ₹2000

# Ultra Tier (₹5000+) - Rainbow gradient
"amount": 1000000  # ₹10000
```

## Theme Examples

Change the overlay theme in `overlay/.env`:

```env
VITE_THEME=basic   # Green, simple
VITE_THEME=silver  # Silver, elegant
VITE_THEME=gold    # Gold with glow effects
VITE_THEME=ultra   # Rainbow with premium effects
```

After changing the theme, refresh the browser source in OBS or restart the overlay.

## Troubleshooting

### "Connection Status" shows red/disconnected

1. Ensure backend server is running on port 3000
2. Check browser console for errors (OBS → Browser Source → Interact → F12)
3. Verify `VITE_SOCKET_URL` in `overlay/.env` matches backend URL

### No donation popup appears

1. Check backend terminal for webhook logs
2. Verify the order status is "paid" in database:
   ```bash
   sqlite3 payment.db "SELECT * FROM orders WHERE status='paid'"
   ```
3. Check Socket.IO connection count:
   ```bash
   curl http://localhost:3000/api/socket-status
   ```

### Audio not playing

1. Set `VITE_ENABLE_AUDIO=true` in `overlay/.env`
2. In OBS, right-click the browser source → Properties → Monitor Audio Output
3. Check audio mixer for the browser source

### Overlay looks wrong in OBS

1. Ensure browser source dimensions are 1920x1080
2. Verify transparent background CSS is applied
3. Refresh the browser source (right-click → Refresh)

## Next Steps

1. **Customize Themes**: Edit `overlay/src/themes/themes.js`
2. **Add Custom Sounds**: Replace placeholder audio in `overlay/src/utils/audio.js`
3. **Adjust Animation Duration**: Change `VITE_ANIMATION_DURATION` in `overlay/.env`
4. **Set Donation Goal**: Update `DONATION_GOAL` in backend `.env`
5. **Configure Razorpay Webhooks**: Add webhook URL in Razorpay Dashboard

## Production Checklist

- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Update CORS origins in `app.js` for your domain
- [ ] Build overlay for production: `cd overlay && npm run build`
- [ ] Deploy backend with PM2 or similar
- [ ] Serve overlay via web server (Nginx/Cloudflare Pages)
- [ ] Configure Razorpay webhook URL
- [ ] Update OBS browser source with production URL
- [ ] Test end-to-end with real Razorpay payments

## Support

For detailed documentation:
- Backend API: See main `README.md`
- Overlay setup: See `overlay/README.md`
- Socket.IO events: See `README.md` Socket.IO section

Happy streaming! 🎉
