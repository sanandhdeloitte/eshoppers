const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./db');

const productsRoutes = require('./routes/products.routes');
const usersRoutes = require('./routes/users.routes');
const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const paymentRoutes = require('./routes/payment.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

const rawFrontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
  : [];

const allowedOrigins = [
  ...rawFrontendUrls,
  'http://localhost:4000',
  'http://localhost:4200',
].filter(Boolean);

console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`CORS blocked for origin: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const possiblePaths = [
  path.join(__dirname, '../frontend/dist/shop-app/browser'),
  path.join(__dirname, '../frontend/dist/shop-app'),
  path.join(__dirname, '../../frontend/dist/shop-app/browser'),
  path.join(__dirname, '../../frontend/dist/shop-app'),
];

let staticPath = null;

for (const p of possiblePaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    staticPath = p;
    break;
  }
}

if (!staticPath) {
  console.error('index.html NOT FOUND. Searched paths:');
  possiblePaths.forEach((p) => console.error(' -', p));
} else {
  console.log(`Serving static files from: ${staticPath}`);
}

// ✅ FIX: Use RegExp to bypass path-to-regexp entirely — works on ALL Express versions
app.options(/.*/, cors(corsOptions));

app.use(cors(corsOptions));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Backend is running' });
});

app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);

if (staticPath) {
  app.use(express.static(staticPath));
}

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  }

  if (!staticPath) {
    return res.status(500).send(
      `index.html not found. Searched: ${possiblePaths.join(', ')}`
    );
  }

  return res.sendFile(path.join(staticPath, 'index.html'), (err) => {
    if (err) {
      console.error('sendFile error:', err);
      if (!res.headersSent) {
        res.status(500).send(`Failed to send index.html: ${err.message}`);
      }
    }
  });
});

connectToDatabase()
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
