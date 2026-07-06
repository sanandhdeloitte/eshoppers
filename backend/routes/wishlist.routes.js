const express     = require('express');
const { getDb }   = require('../db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
router.use(verifyToken);

// GET /:userId
router.get('/:userId', async (req, res) => {
  try {
    const db     = getDb();
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const wishlist   = await db.collection('wishlists').findOne({ userId });
    const productIds = wishlist?.productIds ?? [];
    const products   = productIds.length
      ? await db.collection('products').find({ id: { $in: productIds } }).toArray()
      : [];

    return res.json({ success: true, productIds, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist', error: error.message });
  }
});

// POST /:userId
router.post('/:userId', async (req, res) => {
  try {
    const db        = getDb();
    const userId    = req.params.userId;
    const productId = Number(req.body.productId);

    if (!userId || Number.isNaN(productId))
      return res.status(400).json({ success: false, message: 'Invalid request' });

    const product = await db.collection('products').findOne({ id: productId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await db.collection('wishlists').updateOne(
      { userId },
      { $set: { userId, updatedAt: new Date() }, $addToSet: { productIds: productId } },
      { upsert: true }
    );

    const wishlist = await db.collection('wishlists').findOne({ userId });
    return res.json({ success: true, message: 'Wishlist updated', productIds: wishlist?.productIds ?? [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add wishlist item', error: error.message });
  }
});

// DELETE /:userId/:productId
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const db        = getDb();
    const userId    = req.params.userId;
    const productId = Number(req.params.productId);

    if (!userId || Number.isNaN(productId))
      return res.status(400).json({ success: false, message: 'Invalid request' });

    await db.collection('wishlists').updateOne(
      { userId },
      { $set: { userId, updatedAt: new Date() }, $pull: { productIds: productId } },
      { upsert: true }
    );

    const wishlist = await db.collection('wishlists').findOne({ userId });
    return res.json({ success: true, message: 'Wishlist updated', productIds: wishlist?.productIds ?? [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove wishlist item', error: error.message });
  }
});

module.exports = router;
