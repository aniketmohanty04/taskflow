
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const AuthUser = require('../models/AuthUser');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in the environment');
}

function signToken(id) {
  return jwt.sign({ id: String(id) }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES
  });
}

function handleErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  next();
}

// Public registration always creates an ordinary user.
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], handleErrors, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await AuthUser.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await AuthUser.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created. Set up MFA to secure login.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (err) {
    next(err);
  }
});

// Password + TOTP login. Users who have not enrolled can sign in
// to enroll; once MFA is enabled, a valid TOTP is mandatory.
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], handleErrors, async (req, res, next) => {
  try {
    const { email, password, totp } = req.body;
    const user = await AuthUser.findOne({ email })
      .select('+password +mfaSecret');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.mfaEnabled) {
      if (!user.mfaSecret || !totp ||
          !/^\d{6}$/.test(String(totp)) ||
          !speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: String(totp),
            window: 1
          })) {
        return res.status(401).json({
          success: false,
          message: 'Valid authenticator code required'
        });
      }
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (err) {
    next(err);
  }
});

// Start MFA enrollment. Requires a valid login token.
router.post('/mfa/setup', auth, async (req, res, next) => {
  try {
    const user = await AuthUser.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled'
      });
    }

    const secret = speakeasy.generateSecret({
      name: `TaskFlow (${user.email})`,
      issuer: 'TaskFlow',
      length: 20
    });

    user.mfaPendingSecret = secret.base32;
    await user.save();

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: 'Scan the QR code with your authenticator app, then verify it.',
      qrCodeDataUrl,
      manualEntryKey: secret.base32
    });
  } catch (err) {
    next(err);
  }
});

// Verify the first authenticator code and activate MFA.
router.post('/mfa/verify-setup', auth, [
  body('totp').matches(/^\d{6}$/)
    .withMessage('A six-digit authenticator code is required')
], handleErrors, async (req, res, next) => {
  try {
    const user = await AuthUser.findById(req.user.id)
      .select('+mfaPendingSecret');

    if (!user || !user.mfaPendingSecret) {
      return res.status(400).json({
        success: false,
        message: 'Start MFA setup before verifying'
      });
    }

    const valid = speakeasy.totp.verify({
      secret: user.mfaPendingSecret,
      encoding: 'base32',
      token: String(req.body.totp),
      window: 1
    });

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authenticator code'
      });
    }

    user.mfaSecret = user.mfaPendingSecret;
    user.mfaPendingSecret = undefined;
    user.mfaEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: 'MFA enabled successfully. Future logins require an authenticator code.'
    });
  } catch (err) {
    next(err);
  }
});

// Return current user's safe profile.
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await AuthUser.findById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

