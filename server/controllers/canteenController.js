import CanteenSettings from '../models/CanteenSettings.js';

const getOrCreateSettings = async () => {
  const existing = await CanteenSettings.findOne();
  if (existing) return existing;
  return CanteenSettings.create({ isOpen: true });
};

export const getCanteenStatus = async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ isOpen: settings.isOpen, updatedAt: settings.updatedAt });
};

export const updateCanteenStatus = async (req, res) => {
  const { isOpen } = req.body || {};
  if (typeof isOpen !== 'boolean') {
    res.status(400);
    throw new Error('isOpen must be a boolean');
  }
  const settings = await getOrCreateSettings();
  settings.isOpen = isOpen;
  settings.updatedBy = req.user?._id;
  await settings.save();
  res.json({ isOpen: settings.isOpen, updatedAt: settings.updatedAt });
};

export const markInvoicePrinted = async (req, res) => {
  const settings = await getOrCreateSettings();
  settings.lastInvoicePrintedDate = new Date();
  settings.updatedBy = req.user?._id;
  await settings.save();
  res.json({ message: 'Invoice marked as printed', lastInvoicePrintedDate: settings.lastInvoicePrintedDate });
};
