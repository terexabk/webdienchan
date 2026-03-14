const { connect } = require('../../lib/db');
const { getPostModel } = require('../../lib/Post');
const { getJsonBody } = require('../../lib/readBody');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  const method = req.method;
  if (method !== 'GET' && method !== 'PATCH' && method !== 'DELETE') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const id = req.query.id;
  if (!id) {
    res.status(400).json({ message: 'Thiếu id bài viết.' });
    return;
  }

  try {
    await connect();
    const Post = getPostModel();

    if (method === 'GET') {
      const current = await Post.findById(id);
      if (!current) {
        res.status(404).json({ message: 'Không tìm thấy bài viết.' });
        return;
      }
      Post.updateOne({ _id: current._id }, { $inc: { count: 1 } }).catch(function (err) {
        console.error('Error incrementing count:', err);
      });
      const prev = await Post.findOne({ createdAt: { $lt: current.createdAt } })
        .sort({ createdAt: -1 })
        .select('_id title datetime');
      const next = await Post.findOne({ createdAt: { $gt: current.createdAt } })
        .sort({ createdAt: 1 })
        .select('_id title datetime');
      const post = current.toObject();
      post.prev = prev ? { _id: prev._id, title: prev.title, datetime: prev.datetime } : null;
      post.next = next ? { _id: next._id, title: next.title, datetime: next.datetime } : null;
      res.status(200).json(post);
      return;
    }

    if (method === 'PATCH') {
      const body = await getJsonBody(req);
      const fields = [
        'title', 'audthor', 'datetime', 'content_introduce',
        'title_block_1', 'content_block_1', 'hightlight_block_1',
        'title_block_2', 'content_block_2',
        'title_block_3', 'content_block_3',
        'title_block_4', 'content_block_4',
        'title_block_5', 'content_block_5',
      ];
      const update = {};
      fields.forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          update[key] = body[key] || '';
        }
      });
      const post = await Post.findByIdAndUpdate(id, { $set: update }, { new: true });
      if (!post) {
        res.status(404).json({ message: 'Không tìm thấy bài viết.' });
        return;
      }
      res.status(200).json({ message: 'Cập nhật bài viết thành công.', post });
      return;
    }

    if (method === 'DELETE') {
      const deleted = await Post.findByIdAndDelete(id);
      if (!deleted) {
        res.status(404).json({ message: 'Không tìm thấy bài viết.' });
        return;
      }
      res.status(200).json({ message: 'Đã xóa bài viết.' });
    }
  } catch (err) {
    console.error('Error api/posts/[id]:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
