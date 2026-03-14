const { connect } = require('../../lib/db');
const { getPostModel } = require('../../lib/Post');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function buildImagePath(value) {
  if (!value) return '';
  if (typeof value !== 'string') return '';
  const v = value.trim();
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  if (v.startsWith('/')) return v;
  return v ? '/uploads/' + v : '';
}

async function parseMultipart(req) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return { fields: {}, files: {} };
  }
  const multiparty = require('multiparty');
  return new Promise(function (resolve, reject) {
    const form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      const f = {};
      const fl = {};
      for (const k in fields) {
        if (Array.isArray(fields[k]) && fields[k].length) f[k] = fields[k][0];
      }
      for (const k in files) {
        if (Array.isArray(files[k]) && files[k].length) fl[k] = files[k];
      }
      resolve({ fields: f, files: fl });
    });
  });
}

async function uploadToBlob(filePath) {
  const { put } = require('@vercel/blob');
  const fs = require('fs');
  const path = require('path');
  const buffer = fs.readFileSync(filePath);
  const name = path.basename(filePath);
  const blob = await put(name, buffer, { access: 'public' });
  return blob.url;
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    await connect();
    const Post = getPostModel();

    if (req.method === 'GET') {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 7;
      const p = Math.max(1, page);
      const l = Math.max(1, limit);
      const total = await Post.countDocuments();
      const pages = Math.ceil(total / l) || 1;
      const skip = ((p > pages ? pages : p) - 1) * l;
      const items = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(l);
      res.status(200).json({
        items,
        total,
        page: p > pages ? pages : p,
        pages,
        limit: l,
      });
      return;
    }

    if (req.method === 'POST') {
      const { fields, files } = await parseMultipart(req);
      const body = fields;

      let imgIntroduceValue = buildImagePath(body.img_introduce);
      let imgB11Value = buildImagePath(body.img_block_1_1);
      let imgB12Value = buildImagePath(body.img_block_1_2);

      if (process.env.BLOB_READ_WRITE_TOKEN && files.img_introduce && files.img_introduce[0]) {
        try {
          imgIntroduceValue = await uploadToBlob(files.img_introduce[0].path);
        } catch (e) {
          console.error('Blob upload img_introduce:', e);
        }
      }
      if (process.env.BLOB_READ_WRITE_TOKEN && files.img_block_1_1 && files.img_block_1_1[0]) {
        try {
          imgB11Value = await uploadToBlob(files.img_block_1_1[0].path);
        } catch (e) {
          console.error('Blob upload img_block_1_1:', e);
        }
      }
      if (process.env.BLOB_READ_WRITE_TOKEN && files.img_block_1_2 && files.img_block_1_2[0]) {
        try {
          imgB12Value = await uploadToBlob(files.img_block_1_2[0].path);
        } catch (e) {
          console.error('Blob upload img_block_1_2:', e);
        }
      }

      if (!body.title || !body.audthor || !body.datetime || !imgIntroduceValue || !body.content_introduce) {
        res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc.' });
        return;
      }

      const post = await Post.create({
        title: body.title,
        audthor: body.audthor,
        datetime: body.datetime,
        img_introduce: imgIntroduceValue,
        content_introduce: body.content_introduce,
        title_block_1: body.title_block_1 || '',
        content_block_1: body.content_block_1 || '',
        hightlight_block_1: body.hightlight_block_1 || '',
        img_block_1_1: imgB11Value,
        img_block_1_2: imgB12Value,
        title_block_2: body.title_block_2 || '',
        content_block_2: body.content_block_2 || '',
        title_block_3: body.title_block_3 || '',
        content_block_3: body.content_block_3 || '',
        title_block_4: body.title_block_4 || '',
        content_block_4: body.content_block_4 || '',
        title_block_5: body.title_block_5 || '',
        content_block_5: body.content_block_5 || '',
      });

      res.status(201).json({ message: 'Tạo bài viết thành công.', post });
    }
  } catch (err) {
    console.error('Error api/posts/index:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
