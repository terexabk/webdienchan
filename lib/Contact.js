const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    agree: { type: Boolean, default: false },
  },
  { collection: 'contacts', timestamps: true }
);

function getContactModel() {
  if (mongoose.models.Contact) return mongoose.models.Contact;
  return mongoose.model('Contact', contactSchema);
}

module.exports = { getContactModel };
