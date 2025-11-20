const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, required: true, default: 10 },
  price: { type: Number, required: true },
  supplier: { type: String },
  lastRestocked: { type: Date, default: Date.now },
}, { timestamps: true });

inventorySchema.virtual('status').get(function() {
  if (this.quantity <= 0) {
    return 'out-of-stock';
  }
  if (this.quantity <= this.minStockLevel) {
    return 'low-stock';
  }
  return 'in-stock';
});

module.exports = mongoose.model('Inventory', inventorySchema);
