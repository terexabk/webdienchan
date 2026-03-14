const mongoose = require('mongoose');

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
  { collection: 'dienchan', timestamps: true }
);

function getPostModel() {
  if (mongoose.models.Post) return mongoose.models.Post;
  return mongoose.model('Post', postSchema);
}

module.exports = { getPostModel };
