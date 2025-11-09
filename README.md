# 🚀 Restaurant API - Summary

Server đang chạy tại: **http://127.0.0.1:1234**

---

## 📋 Danh Sách API

### 🏠 Root & Health Check
- `GET /` - Welcome message
- `GET /health` - Health check

---

### 👤 Account APIs (Public + Private)

#### Public (không cần token)
- `POST /api/account/register` - Đăng ký tài khoản Customer
- `POST /api/account/login` - Đăng nhập

#### Private (cần token)
- `POST /api/account/logout` - Đăng xuất
- `GET /api/account/me` - Lấy thông tin tài khoản hiện tại
- `PUT /api/account/profile` - Cập nhật thông tin tài khoản
- `PUT /api/account/change-password` - Đổi mật khẩu

📖 **Chi tiết**: Xem file `API_ACCOUNT.md`

---

### 🍽️ Menu APIs

#### Public (không cần token)
- `GET /api/menu` - Lấy danh sách món ăn (có phân trang, lọc, tìm kiếm)
- `GET /api/menu/:id` - Lấy chi tiết món ăn
- `GET /api/menu/types/list` - Lấy danh sách loại món ăn
- `GET /api/menu/featured` - Lấy món ăn nổi bật
- `GET /api/menu/search?keyword=xxx` - Tìm kiếm món ăn

#### Private - Manager only (cần token + role Manager)
- `POST /api/menu` - Thêm món ăn mới

📖 **Chi tiết**: Xem file `API_CREATE_DISH.md`

---

## 🔐 Authentication Flow

### 1️⃣ Đăng ký tài khoản mới
```bash
POST /api/account/register
Content-Type: application/json

{
  "UserCode": "CUST001",
  "UserEmail": "customer@example.com",
  "UserPhone": "0123456789",
  "UserPassword": "123456",
  "Name": "Nguyễn Văn A",
  "IdentityCard": "123456789012"
}
```

### 2️⃣ Đăng nhập và lấy token
```bash
POST /api/account/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "123456"
}

# Response sẽ có token:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### 3️⃣ Sử dụng token cho các API cần xác thực
```bash
GET /api/account/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 👥 User Roles

- **Admin** - Quản trị viên
- **Manager** - Quản lý (có thể thêm món mới)
- **Cashier** - Thu ngân
- **Waiter** - Phục vụ
- **Kitchen staff** - Nhân viên bếp
- **Customer** - Khách hàng (đăng ký mặc định)

---

## 📝 Quick Test Examples

### Test Register
```bash
POST http://127.0.0.1:1234/api/account/register
Content-Type: application/json

{
  "UserCode": "CUST001",
  "UserEmail": "test@example.com",
  "UserPhone": "0123456789",
  "UserPassword": "123456",
  "Name": "Test User",
  "IdentityCard": "123456789012"
}
```

### Test Login
```bash
POST http://127.0.0.1:1234/api/account/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

### Test Menu (Public)
```bash
GET http://127.0.0.1:1234/api/menu
GET http://127.0.0.1:1234/api/menu/featured
GET http://127.0.0.1:1234/api/menu/search?keyword=phở
```

### Test Get Profile (Private)
```bash
GET http://127.0.0.1:1234/api/account/me
Authorization: Bearer YOUR_TOKEN_HERE
```

### Test Add Dish (Manager Only)
```bash
POST http://127.0.0.1:1234/api/menu
Authorization: Bearer MANAGER_TOKEN_HERE
Content-Type: application/json

{
  "DishName": "Phở Bò",
  "DishType": "Main Course",
  "DishPrice": 50000
}
```

---

## 🛠️ Tools để Test API

1. **Postman** - https://www.postman.com/
2. **Thunder Client** (VS Code Extension)
3. **Insomnia** - https://insomnia.rest/
4. **cURL** (command line)

---

## ⚠️ Important Notes

1. **JWT Token** hết hạn sau **7 ngày**
2. **Password** được mã hóa bằng **bcrypt**
3. Các field nhạy cảm (`UserPassword`, `IdentityCard`) **không được trả về** trong response
4. Role **Customer** được set tự động khi đăng ký
5. Chỉ **Manager** mới có thể thêm món mới
6. Token phải được gửi trong header: `Authorization: Bearer <token>`

---

## 📦 Dependencies

- express
- mongoose
- bcrypt
- jsonwebtoken
- express-validator
- dotenv
- cors
- nodemon

---

## 🔄 Development

### Start Server
```bash
npm start
```

### Environment Variables (.env)
```
PORT=1234
MONGO_URI=mongodb://127.0.0.1:27017/SDN302
JWT_SECRET=mysecretkey
```

---

## 📚 Documentation Files

- `API_ACCOUNT.md` - Chi tiết API Account (Login, Register, Logout)
- `API_CREATE_DISH.md` - Chi tiết API thêm món mới (Manager)
- `README.md` - File này

---

## ✅ Completed Features

- ✅ Xem menu (public)
- ✅ Tìm kiếm món ăn (public)
- ✅ Đăng ký tài khoản Customer
- ✅ Đăng nhập
- ✅ Đăng xuất
- ✅ Xem profile
- ✅ Cập nhật profile
- ✅ Đổi mật khẩu
- ✅ Thêm món mới (Manager only)
- ✅ Phân quyền theo role
- ✅ JWT Authentication
- ✅ Input validation

---

## 🎯 Next Steps (Optional)

- [ ] Upload ảnh món ăn
- [ ] Quản lý đơn hàng (Order)
- [ ] Xóa/Sửa món ăn (Manager)
- [ ] Quản lý tài khoản (Admin)
- [ ] Forgot password
- [ ] Email verification
- [ ] Refresh token
- [ ] Rate limiting
- [ ] API documentation (Swagger)

---

**Made with ❤️ for SDN302 Project**
