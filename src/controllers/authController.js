const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const { isDbConnected } = require('../config/dbState');
const { verifyFirebaseIdToken } = require('../config/firebaseAdmin');
const { appUsers, providers } = require('../data/mockData');
const Provider = require('../models/Provider');
const User = require('../models/User');

const otpStore = new Map();

const normalizePhoneNumber = (value = '') => value.replace(/[^\d+]/g, '');
const generateOtpCode = () => String(Math.floor(1000 + Math.random() * 9000));

const buildToken = (user) =>
  jwt.sign(
    {
      sub: user.id || user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
    process.env.JWT_SECRET || 'sorted-dev-secret',
    { expiresIn: '7d' }
  );

const buildVerificationToken = (phoneNumber) =>
  jwt.sign(
    {
      phoneNumber,
      verifiedForSignup: true,
    },
    process.env.JWT_SECRET || 'sorted-dev-secret',
    { expiresIn: '10m' }
  );

const getProviderForUser = async (user) => {
  if (!user) {
    return null;
  }

  if (isDbConnected()) {
    return Provider.findOne({ user: user._id }).lean();
  }

  return providers.find((provider) => provider.userId === user.id);
};

const sanitizeUser = async (user) => {
  const provider = await getProviderForUser(user);

  return {
    id: user.id || user._id,
    name: user.name,
    phoneNumber: user.phoneNumber,
    email: user.email || '',
    address: user.address || '',
    role: user.role,
    isPhoneVerified: Boolean(user.isPhoneVerified),
    profileCompleted: Boolean(user.profileCompleted),
    providerProfile: provider
      ? {
          id: provider.id || provider._id,
          businessName: provider.businessName,
          status: provider.status,
          category: provider.category,
          serviceTitle: provider.serviceTitle,
        }
      : null,
    permissions: {
      canBook: Boolean(user.isPhoneVerified && user.profileCompleted),
      canProvide: Boolean(provider && provider.status === 'approved'),
      hasProviderProfile: Boolean(provider),
    },
  };
};

const requestOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber } = req.body;
    const otpCode = generateOtpCode();
    const otpToken = `otp-${Date.now()}`;

    otpStore.set(otpToken, {
      phoneNumber,
      otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return res.json({
      message: 'OTP sent successfully.',
      otpToken,
      otpCode,
      provider: 'system',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Firebase Admin credentials are missing')) {
      return res.status(503).json({ message: error.message });
    }

    return next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, otpToken, otpCode } = req.body;
    const otpSession = otpStore.get(otpToken);

    if (!otpSession || otpSession.phoneNumber !== phoneNumber) {
      return res.status(400).json({ message: 'OTP session is invalid.' });
    }

    if (otpSession.expiresAt < Date.now()) {
      otpStore.delete(otpToken);
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    if (otpSession.otpCode !== otpCode) {
      return res.status(400).json({ message: 'OTP code is incorrect.' });
    }

    otpStore.delete(otpToken);

    return res.json({
      message: 'Phone number verified successfully.',
      verificationToken: buildVerificationToken(phoneNumber),
    });
  } catch (error) {
    return next(error);
  }
};

const verifyFirebasePhone = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { idToken, phoneNumber = '' } = req.body;
    const decoded = await verifyFirebaseIdToken(idToken);
    const verifiedPhoneNumber = decoded.phone_number || '';

    if (!verifiedPhoneNumber) {
      return res.status(400).json({ message: 'The Firebase token does not include a verified phone number.' });
    }

    if (
      normalizePhoneNumber(phoneNumber) &&
      normalizePhoneNumber(phoneNumber) !== normalizePhoneNumber(verifiedPhoneNumber)
    ) {
      return res.status(400).json({ message: 'The verified phone number does not match the submitted number.' });
    }

    return res.json({
      message: 'Phone number verified successfully.',
      phoneNumber: verifiedPhoneNumber,
      verificationToken: buildVerificationToken(verifiedPhoneNumber),
    });
  } catch (error) {
    return next(error);
  }
};

const completeSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { verificationToken, phoneNumber, pin, name, address, email = '' } = req.body;
    const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET || 'sorted-dev-secret');

    if (!decoded.verifiedForSignup || decoded.phoneNumber !== phoneNumber) {
      return res.status(400).json({ message: 'Verification token is invalid.' });
    }

    const existingUser = isDbConnected()
      ? await User.findOne({ phoneNumber })
      : appUsers.find((item) => item.phoneNumber === phoneNumber);

    if (existingUser && existingUser.profileCompleted) {
      return res.status(409).json({ message: 'This phone number already has an account.' });
    }

    const pinHash = await bcrypt.hash(pin, 10);
    let user;

    if (isDbConnected()) {
      user =
        existingUser ||
        (await User.create({
          phoneNumber,
          role: 'seeker',
        }));

      user.name = name;
      user.address = address;
      user.email = email ? email.toLowerCase() : '';
      user.pinHash = pinHash;
      user.isPhoneVerified = true;
      user.profileCompleted = true;
      user.role = 'seeker';
      await user.save();
    } else {
      if (existingUser) {
        existingUser.name = name;
        existingUser.address = address;
        existingUser.email = email ? email.toLowerCase() : '';
        existingUser.pinHash = pinHash;
        existingUser.isPhoneVerified = true;
        existingUser.profileCompleted = true;
        existingUser.role = 'seeker';
        delete existingUser.seedPin;
        user = existingUser;
      } else {
        user = {
          id: `user-${Date.now()}`,
          name,
          phoneNumber,
          email: email ? email.toLowerCase() : '',
          address,
          pinHash,
          role: 'seeker',
          isPhoneVerified: true,
          profileCompleted: true,
        };
        appUsers.push(user);
      }
    }

    return res.status(201).json({
      message: 'Account created successfully.',
      token: buildToken(user),
      user: await sanitizeUser(user),
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

    const { phoneNumber, pin } = req.body;
    const user = isDbConnected()
      ? await User.findOne({ phoneNumber })
      : appUsers.find((item) => item.phoneNumber === phoneNumber);

    if (!user || !user.pinHash && !user.seedPin) {
      return res.status(401).json({ message: 'Invalid phone number or PIN.' });
    }

    const pinMatches = (user.pinHash && (await bcrypt.compare(pin, user.pinHash))) || user.seedPin === pin;

    if (!pinMatches) {
      return res.status(401).json({ message: 'Invalid phone number or PIN.' });
    }

    return res.json({
      message: 'Login successful.',
      token: buildToken(user),
      user: await sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  verifyFirebasePhone,
  completeSignup,
  login,
};
