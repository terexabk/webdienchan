const { connect } = require('../lib/db');
const { getContactModel } = require('../lib/Contact');
const { getJsonBody } = require('../lib/readBody');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const body = await getJsonBody(req);
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();
    const agree = !!body.agree;

    if (!name || !email || !message) {
      res.status(400).json({ message: 'Vui lòng nhập đầy đủ Họ tên, Email và Nội dung.' });
      return;
    }

    await connect();
    const Contact = getContactModel();
    await Contact.create({ name, email, message, agree });

    res.status(201).json({ message: 'Đã nhận tin nhắn thành công.' });
  } catch (err) {
    console.error('Error saving contact:', err);
    res.status(500).json({ message: 'Lỗi server khi lưu tin nhắn.' });
  }
};
