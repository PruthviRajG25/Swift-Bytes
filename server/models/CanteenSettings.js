import mongoose from 'mongoose';

const canteenSettingsSchema = new mongoose.Schema(
  {
    isOpen: { type: Boolean, default: true },
    lastInvoicePrintedDate: { type: Date, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const CanteenSettings = mongoose.model('CanteenSettings', canteenSettingsSchema);
export default CanteenSettings;

