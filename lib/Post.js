const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    audthor: { type: String, required: true },
    datetime: { type: String, required: true },
    img_introduce: { type: String, required: true },
    content_introduce: { type: String, required: true },
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
