const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const COOKIE_NAME = 'sas_token';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid username or password.', 401));
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_COOKIE_EXPIRES_IN || '7d',
    });

    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ success: true, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
};

const logout = (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true });
};

const me = async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user: { id: user._id, username: user.username, role: user.role },
  });
};

module.exports = { login, logout, me, COOKIE_NAME };
