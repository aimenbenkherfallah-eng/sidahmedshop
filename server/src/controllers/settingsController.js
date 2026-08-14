const Settings = require('../models/Settings');

const getPublicSettings = async (_req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    const shippingFees = settings.shippingFees
      ? Object.fromEntries(settings.shippingFees)
      : {};
    res.json({
      success: true,
      settings: {
        storeName: settings.storeName,
        announcement: settings.announcement,
        hero: settings.hero,
        metaPixelId: settings.metaPixelId,
        tiktokPixelId: settings.tiktokPixelId,
        defaultShippingFee: settings.defaultShippingFee,
        shippingFees,
        landingPage: settings.landingPage || { enabled: true },
        shoppingCart: settings.shoppingCart || { enabled: true },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicSettings };
