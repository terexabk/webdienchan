const { connect } = require('../../lib/db');
const { getPostModel } = require('../../lib/Post');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  try {
    await connect();
    const Post = getPostModel();
    const posts = await Post.find().sort({ count: -1, createdAt: -1 }).limit(4);
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching trending:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy trending posts.' });
  }
};
