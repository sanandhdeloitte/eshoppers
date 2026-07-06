const express   = require('express');
const { getDb } = require('../db');
const router    = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const db     = getDb();
    const userId = req.params.userId.trim();

    const orders = await db.collection('orders')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
