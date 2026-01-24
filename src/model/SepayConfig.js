const mongoose = require('mongoose');

const sepayConfigSchema = new mongoose.Schema(
  {
    apiKey: {
      type: String,
      required: true,
      trim: true,
    },
    apiSecret: {
      type: String,
      required: true,
      trim: true,
    },
    merchantCode: {
      type: String,
      trim: true,
    },
    webhookUrl: {
      type: String,
      trim: true,
    },
    callbackUrl: {
      type: String,
      trim: true,
    },
    // reference to Shelf
    shelf_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelf',
      index: true,
    },
    // thêm 3 field VietQR theo yêu cầu
    vietqrAccountNo: {
      type: String,
      trim: true,
      default: "0923516651",
    },
    vietqrAccountName: {
      type: String,
      trim: true,
      default: "TRAN VU THUY TRANG",
    },
    vietqrAcqId: {
      type: String,
      trim: true,
      default: "970422",
    },
    sandbox: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SepayConfig', sepayConfigSchema);
