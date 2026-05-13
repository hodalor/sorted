const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const { isDbConnected } = require('../config/dbState');
const { appUsers } = require('../data/mockData');
const User = require('../models/User');

const buildToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'sorted-dev-secret',
    { expiresIn: '7d' }
  );

const sanitizeUser = (user) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role = 'seeker' } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = isDbConnected()
      ? await User.findOne({ email: normalizedEmail }).lean()
      : appUsers.find((user) => user.email === normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let user;

    if (isDbConnected()) {
      user = await User.create({
        name,
        email: normalizedEmail,
        passwordHash,
        role,
      });
    } else {
      user = {
        id: `user-${Date.now()}`,
        name,
        email: normalizedEmail,
        passwordHash,
        role,
      };

      appUsers.push(user);
    }

    return res.status(201).json({
      message: 'Registration successful.',
      token: buildToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = isDbConnected()
      ? await User.findOne({ email: normalizedEmail })
      : appUsers.find((item) => item.email === normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches =
      (user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) ||
      user.seedPassword === password;

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      message: 'Login successful.',
      token: buildToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
};
