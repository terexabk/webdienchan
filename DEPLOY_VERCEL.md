# Deploy API lên Vercel

Project này chạy **frontend + API** trên Vercel (serverless). Backend cũ (Express) trong `server.js` dùng khi chạy local hoặc deploy lên Koyeb.

## Biến môi trường (Vercel)

Vào **Project → Settings → Environment Variables** và thêm:

| Tên | Mô tả | Bắt buộc |
|-----|--------|----------|
| `MONGODB_URI` | Chuỗi kết nối MongoDB (ví dụ `mongodb+srv://user:pass@cluster...`) | Có (hoặc dùng mặc định trong code) |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob để lưu ảnh upload từ Admin. Lấy tại: Vercel Dashboard → Storage → Blob → Create → copy token | Có (nếu muốn đăng bài có ảnh từ Admin) |

- Nếu **không** set `BLOB_READ_WRITE_TOKEN`, Admin vẫn tạo bài được nhưng **không upload ảnh** (cần nhập URL ảnh hoặc bỏ trống ảnh).
- Ảnh cũ lưu trên Koyeb (`/uploads/...`) vẫn hiển thị nhờ `LEGACY_IMAGE_ORIGIN` trỏ sang Koyeb.

## Cấu trúc API (Vercel)

- `GET /api/health` — health check
- `POST /api/contact` — gửi liên hệ (lưu vào MongoDB collection `contacts`)
- `GET /api/posts` — danh sách bài (query: `page`, `limit`)
- `GET /api/posts/trending` — 4 bài trending
- `GET /api/posts/:id` — chi tiết bài + tăng count
- `PATCH /api/posts/:id` — cập nhật bài (JSON body)
- `DELETE /api/posts/:id` — xóa bài
- `POST /api/posts` — tạo bài (multipart: ảnh upload lên Vercel Blob)

## Chạy local (Express)

```bash
npm install
npm run start
```

Server chạy tại `http://localhost:3000`, dùng MongoDB và thư mục `uploads/` như hiện tại.
