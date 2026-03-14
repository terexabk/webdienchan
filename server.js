const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Ensure uploads directory exists =====
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ===== Multer storage config =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + ext);
  },
});

const upload = multer({ storage });

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// Static files (site) and uploaded images
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(__dirname));

// ===== MongoDB connection =====
const MONGODB_URI = 'mongodb+srv://dbOpicKorea:270991@cluster0.tujpjti.mongodb.net/';

mongoose
  .connect(MONGODB_URI, { dbName: 'web_content' })
  .then(function () {
    console.log('MongoDB connected');
  })
  .catch(function (err) {
    console.error('MongoDB connection error:', err);
  });

// ===== Mongoose model =====
const postSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    audthor: { type: String, default: '' },
    datetime: { type: String, default: '' },
    img_introduce: { type: String, default: '' },
    content_introduce: { type: String, default: '' },
    title_block_1: { type: String, default: '' },
    content_block_1: { type: String, default: '' },
    hightlight_block_1: { type: String, default: '' },
    img_block_1_1: { type: String, default: '' },
    img_block_1_2: { type: String, default: '' },
    title_block_2: { type: String, default: '' },
    content_block_2: { type: String, default: '' },
    title_block_3: { type: String, default: '' },
    content_block_3: { type: String, default: '' },
    title_block_4: { type: String, default: '' },
    content_block_4: { type: String, default: '' },
    title_block_5: { type: String, default: '' },
    content_block_5: { type: String, default: '' },
    count: { type: Number, default: 0 },
  },
  {
    collection: 'dienchan',
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

// ===== Helpers =====
function buildImagePath(value) {
  if (!value) return '';
  // nếu đã là path tuyệt đối (bắt đầu bằng /uploads) thì giữ nguyên
  if (value.startsWith('/')) return value;
  // nếu user nhập chỉ tên file, lưu kèm thư mục uploads
  return '/uploads/' + value;
}

// ===== Routes =====

app.get('/api/health', function (req, res) {
  res.json({ status: 'ok' });
});

// Lưu tin nhắn liên hệ tạm thời vào file JSON
const CONTACT_FILE = path.join(__dirname, 'contact-messages.json');

app.post('/api/contact', async function (req, res) {
  try {
    const body = req.body || {};
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();
    const agree = !!body.agree;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Họ tên, Email và Nội dung.' });
    }

    let existing = [];
    if (fs.existsSync(CONTACT_FILE)) {
      try {
        const raw = fs.readFileSync(CONTACT_FILE, 'utf8');
        if (raw) {
          existing = JSON.parse(raw);
          if (!Array.isArray(existing)) existing = [];
        }
      } catch (e) {
        existing = [];
      }
    }

    const entry = {
      name: name,
      email: email,
      message: message,
      agree: agree,
      createdAt: new Date().toISOString(),
    };

    existing.push(entry);
    fs.writeFileSync(CONTACT_FILE, JSON.stringify(existing, null, 2), 'utf8');

    res.status(201).json({ message: 'Đã nhận tin nhắn thành công.', entry: entry });
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.status(500).json({ message: 'Lỗi server khi lưu tin nhắn.' });
  }
});

// Tạo bài viết mới + upload ảnh
app.post(
  '/api/posts',
  upload.fields([
    { name: 'img_introduce', maxCount: 1 },
    { name: 'img_block_1_1', maxCount: 1 },
    { name: 'img_block_1_2', maxCount: 1 },
  ]),
  async function (req, res) {
    try {
      const body = req.body || {};
      const files = req.files || {};

      const fileIntro = files.img_introduce && files.img_introduce[0];
      const fileB1_1 = files.img_block_1_1 && files.img_block_1_1[0];
      const fileB1_2 = files.img_block_1_2 && files.img_block_1_2[0];

      // Lấy giá trị ảnh: ưu tiên file upload, fallback sang text nếu có
      const imgIntroduceValue = fileIntro
        ? '/uploads/' + fileIntro.filename
        : buildImagePath(body.img_introduce);

      const imgB11Value = fileB1_1
        ? '/uploads/' + fileB1_1.filename
        : buildImagePath(body.img_block_1_1);

      const imgB12Value = fileB1_2
        ? '/uploads/' + fileB1_2.filename
        : buildImagePath(body.img_block_1_2);

      const post = await Post.create({
        title: (body.title || '').trim(),
        audthor: (body.audthor || '').trim(),
        datetime: (body.datetime || '').trim(),
        img_introduce: imgIntroduceValue || '',
        content_introduce: (body.content_introduce || '').trim(),
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

      res.status(201).json({ message: 'Tạo bài viết thành công.', post: post });
    } catch (err) {
      console.error('Error creating post:', err);
      res.status(500).json({ message: 'Lỗi server khi tạo bài viết.' });
    }
  }
);

// Cập nhật bài viết (chỉ cập nhật các field text, không xử lý upload ảnh)
app.patch('/api/posts/:id', async function (req, res) {
  try {
    const body = req.body || {};
    const update = {};

    const fields = [
      'title',
      'audthor',
      'datetime',
      'content_introduce',
      'title_block_1',
      'content_block_1',
      'hightlight_block_1',
      'title_block_2',
      'content_block_2',
      'title_block_3',
      'content_block_3',
      'title_block_4',
      'content_block_4',
      'title_block_5',
      'content_block_5',
    ];

    fields.forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        update[key] = body[key] || '';
      }
    });

    const post = await Post.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    res.json({ message: 'Cập nhật bài viết thành công.', post: post });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật bài viết.' });
  }
});

// Xóa bài viết
app.delete('/api/posts/:id', async function (req, res) {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }
    res.json({ message: 'Đã xóa bài viết.' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa bài viết.' });
  }
});

// Lấy danh sách bài viết (hỗ trợ phân trang)
app.get('/api/posts', async function (req, res) {
  try {
    var page = parseInt(req.query.page, 10) || 1;
    var limit = parseInt(req.query.limit, 10) || 7;
    if (page < 1) page = 1;
    if (limit < 1) limit = 7;

    var total = await Post.countDocuments();
    var pages = Math.ceil(total / limit) || 1;
    if (page > pages) page = pages;

    var skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      items: posts,
      total: total,
      page: page,
      pages: pages,
      limit: limit,
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bài viết.' });
  }
});

// Lấy top trending (theo count)
app.get('/api/posts/trending', async function (req, res) {
  try {
    const posts = await Post.find().sort({ count: -1, createdAt: -1 }).limit(4);
    res.json(posts);
  } catch (err) {
    console.error('Error fetching trending posts:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy trending posts.' });
  }
});

// Lấy chi tiết bài viết + tăng count + prev/next
app.get('/api/posts/:id', async function (req, res) {
  try {
    const current = await Post.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    // tăng count (không cần chờ kết quả)
    Post.updateOne({ _id: current._id }, { $inc: { count: 1 } }).catch(function (err) {
      console.error('Error incrementing count:', err);
    });

    // prev/next theo createdAt
    const prev = await Post.findOne({ createdAt: { $lt: current.createdAt } })
      .sort({ createdAt: -1 })
      .select('_id title datetime');

    const next = await Post.findOne({ createdAt: { $gt: current.createdAt } })
      .sort({ createdAt: 1 })
      .select('_id title datetime');

    const post = current.toObject();
    post.prev = prev ? { _id: prev._id, title: prev.title, datetime: prev.datetime } : null;
    post.next = next ? { _id: next._id, title: next.title, datetime: next.datetime } : null;

    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết.' });
  }
});

// ===== Start server =====
app.listen(PORT, function () {
  console.log('Server listening on http://localhost:' + PORT);
});

