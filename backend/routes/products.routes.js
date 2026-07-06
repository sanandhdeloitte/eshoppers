const express = require('express');
const { getDb } = require('../db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
router.use(verifyToken);


function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

router.get('/categories', async (req, res) => {
  try {
    const db = getDb();

    const categories = await db.collection('products').distinct('category');

    const cleanedCategories = categories
      .filter((category) => typeof category === 'string' && category.trim())
      .map((category) => category.trim())
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      categories: cleanedCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = getDb();

    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const sort = String(req.query.sort || '').trim();
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = parsePositiveInt(req.query.pageSize, 8);

    const filter = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { title: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = {
        $regex: `^${escapeRegex(category)}$`,
        $options: 'i',
      };
    }

    let sortOption = { id: -1 };

    if (sort === 'price-asc') {
      sortOption = { price: 1, id: -1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1, id: -1 };
    }

    const total = await db.collection('products').countDocuments(filter);
    const skip = (page - 1) * pageSize;

    const products = await db
      .collection('products')
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      products,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    const product = await db.collection('products').findOne({ id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
});

module.exports = router;
