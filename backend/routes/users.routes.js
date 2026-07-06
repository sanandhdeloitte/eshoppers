require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { getDb } = require('../db');

const router      = express.Router();
const SALT_ROUNDS = 12;

function issueToken(user) {
  return jwt.sign(
    {
      iss:     'eshoppers',
      sub:     user._id.toString(), 
      name:    user.name,
      email:   user.email,
      picture: '',
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/guest-login', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone)
      return res.status(400).json({ success: false, message: 'Name and phone are required' });

    const db = getDb();
    const result = await db.collection('users').findOneAndUpdate(
      { phone, isGuest: true },
      {
        $set:         { name, updatedAt: new Date() },
        $setOnInsert: { phone, isGuest: true, createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const savedGuest = result;
    const guestUser  = {
      sub:     savedGuest._id.toString(),
      name:    savedGuest.name,
      phone:   savedGuest.phone,
      email:   '',
      picture: '',
      isGuest: true,
    };

    const token = jwt.sign(
      { iss: 'eshoppers-guest', ...guestUser },
      process.env.JWT_SECRET,
      { expiresIn: '4d' }
    );

    return res.status(200).json({ success: true, user: guestUser, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Guest login failed', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const db       = getDb();
    const existing = await db.collection('users').findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await db.collection('users').insertOne({ name, email, password: hashedPassword });
    return res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const db   = getDb();
    const user = await db.collection('users').findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Incorrect password' });

    const token   = issueToken(user);
    const appUser = {
      sub:     user._id.toString(), 
      name:    user.name,
      email:   user.email,
      picture: '',
    };

    return res.status(200).json({ success: true, user: appUser, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

router.get('/:email', async (req, res) => {
  try {
    const db   = getDb();
    const user = await db.collection('users').findOne({ email: req.params.email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    const { password: _omit, ...safeUser } = user;
    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
});

module.exports = router;
