const Settings = require('../models/Settings');

const getPublicSettings = async (_req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({
      success: true,
      settings: {
        storeName: settings.storeName,
        announcement: settings.announcement,
        hero: settings.hero,
        metaPixelId: settings.metaPixelId,
        tiktokPixelId: settings.tiktokPixelId,
        defaultShippingFee: settings.defaultShippingFee,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicSettings };
