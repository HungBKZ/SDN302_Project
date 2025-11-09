# Hướng dẫn cấu hình Google Sign-In

## Bước 1: Tạo Google OAuth 2.0 Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Chọn **Application type**: Web application
6. Điền thông tin:
   - **Name**: Restaurant System
   - **Authorized JavaScript origins**: 
     - `http://localhost:1234`
     - `http://127.0.0.1:1234`
   - **Authorized redirect URIs**: (có thể để trống cho client-side)
7. Click **Create**
8. Copy **Client ID** (dạng: `xxxxx.apps.googleusercontent.com`)

## Bước 2: Cập nhật Client ID vào code

Mở file `src/views/login.ejs` và thay thế dòng:

```javascript
client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
```

Thành:

```javascript
client_id: 'CLIENT_ID_CỦA_BẠN.apps.googleusercontent.com',
```

## Bước 3: Test đăng nhập

1. Khởi động server: `npm start`
2. Truy cập: `http://127.0.0.1:1234/login`
3. Click nút **"Đăng nhập bằng Google"**
4. Chọn tài khoản Google
5. Hệ thống sẽ tự động:
   - Tạo tài khoản mới nếu chưa có (với role Customer)
   - Hoặc đăng nhập vào tài khoản đã tồn tại
   - Redirect đến trang menu

## Tính năng đã implement:

✅ **Backend:**
- Thêm trường `GoogleId` vào Account model
- API endpoint: `POST /api/account/google-login`
- Tự động tạo tài khoản từ Google profile
- Link Google ID với tài khoản email đã tồn tại
- Tạo JWT token cho session

✅ **Frontend:**
- Nút đăng nhập Google với logo chính thức
- Tích hợp Google Sign-In API
- Tự động lưu token và redirect
- Hỗ trợ đa ngôn ngữ (tiếng Việt)

## Lưu ý bảo mật:

- Google Sign-In chỉ hoạt động trên domain được authorized
- Token được verify bởi Google trước khi xử lý
- Tài khoản Google sẽ có role mặc định là **Customer**
- Không cần mật khẩu cho tài khoản đăng nhập bằng Google

## Troubleshooting:

**Lỗi: "Invalid client_id"**
- Kiểm tra lại Client ID đã copy đúng chưa
- Đảm bảo domain trong Authorized JavaScript origins khớp với domain đang chạy

**Lỗi: "Access blocked"**
- Kiểm tra OAuth consent screen đã được configure
- Thêm email test users nếu app đang ở trạng thái Testing

**Nút Google không hiển thị:**
- Kiểm tra console browser có lỗi không
- Đảm bảo đã load script `https://accounts.google.com/gsi/client`
