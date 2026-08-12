const Settings = require('../models/Settings');
const { adminSettingsSchema } = require('../validators/schemas');

const getSettings = async (_req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    const doc = settings.toObject();
    if (doc.shippingFees) doc.shippingFees = Object.fromEntries(doc.shippingFees);
    if (!doc.landingPage) doc.landingPage = { enabled: true };
    res.json({ success: true, settings: doc });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const parsed = adminSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error(parsed.error.issues[0]?.message || 'Invalid settings.');
      err.statusCode = 422;
      return next(err);
    }

    const settings = await Settings.getSingleton();
    const data = parsed.data;

    if (data.storeName) settings.storeName = { ...settings.storeName, ...data.storeName };
    if (data.announcement) {
      settings.announcement = { ...settings.announcement, ...data.announcement };
    }
    if (data.hero) settings.hero = { ...settings.hero, ...data.hero };
    if (data.metaPixelId !== undefined) settings.metaPixelId = data.metaPixelId;
    if (data.tiktokPixelId !== undefined) settings.tiktokPixelId = data.tiktokPixelId;
    if (data.defaultShippingFee !== undefined) settings.defaultShippingFee = data.defaultShippingFee;
    if (data.shippingFees) settings.shippingFees = data.shippingFees;
    if (data.landingPage) {
      settings.landingPage = {
        enabled: data.landingPage.enabled !== undefined
          ? data.landingPage.enabled
          : settings.landingPage?.enabled ?? true,
      };
    }

    await settings.save();

    const doc = settings.toObject();
    if (doc.shippingFees) doc.shippingFees = Object.fromEntries(doc.shippingFees);
    if (!doc.landingPage) doc.landingPage = { enabled: true };
    res.json({ success: true, settings: doc });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
