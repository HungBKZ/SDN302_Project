# Test API Login - Manager Account

## ✅ Test với Postman/Thunder Client

### 1. Đăng nhập Manager
```
POST http://127.0.0.1:1234/api/account/login
Content-Type: application/json

Body (raw JSON):
{
  "email": "manager@gmail.com",
  "password": "123456"
}
```

### 2. Đăng nhập Customer
```
POST http://127.0.0.1:1234/api/account/login
Content-Type: application/json

Body (raw JSON):
{
  "email": "customer1@gmail.com",
  "password": "123456"
}
```

---

## 🧪 Test với cURL

### Windows PowerShell:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:1234/api/account/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"manager@gmail.com","password":"123456"}'
```

### Linux/Mac:
```bash
curl -X POST http://127.0.0.1:1234/api/account/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@gmail.com","password":"123456"}'
```

---

## ⚠️ Lưu ý quan trọng

### 1. Content-Type Header
- **Bắt buộc**: `Content-Type: application/json`
- Nếu thiếu header này, server sẽ không parse được body

### 2. Body Format
- Phải là **raw JSON**, không phải x-www-form-urlencoded
- Email và password phải trong dấu ngoặc kép `""`

### 3. Endpoint
- Đảm bảo URL đúng: `http://127.0.0.1:1234/api/account/login`
- Method: **POST** (không phải GET)

### 4. Response Success
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "4d4730303100000000000000",
      "UserCode": "MG001",
      "UserEmail": "manager@gmail.com",
      "UserPhone": "0357904621",
      "Name": "Tran Thi Bich",
      "UserRole": "Manager",
      "UserAddress": "456 XYZ Street, Ho Chi Minh City",
      "UserImage": "manager.jpg",
      "IsDeleted": false,
      "CreatedAt": "2025-11-09T...",
      "UpdatedAt": "2025-11-09T..."
    }
  }
}
```

---

## 🔍 Troubleshooting

### Lỗi: "Email hoặc mật khẩu không đúng"

**Nguyên nhân có thể:**

1. ❌ **Email sai**
   - Kiểm tra chính tả
   - Đảm bảo không có khoảng trắng thừa
   - Email phải là: `manager@gmail.com` (chữ thường)

2. ❌ **Password sai**
   - Mật khẩu đúng là: `123456`
   - Không có khoảng trắng

3. ❌ **Content-Type header thiếu**
   - Thêm header: `Content-Type: application/json`

4. ❌ **Body không phải JSON**
   - Chọn "raw" và "JSON" trong Postman
   - Không dùng form-data hoặc x-www-form-urlencoded

5. ❌ **Server chưa khởi động**
   - Chạy: `npm start`
   - Kiểm tra console có message: "Server running at: http://127.0.0.1:1234"

---

## ✅ Các tài khoản có sẵn trong database

| Email | Password | Role |
|-------|----------|------|
| admin@gmail.com | 123456 | Admin |
| manager@gmail.com | 123456 | Manager |
| cashier@gmail.com | 123456 | Cashier |
| waiter1@gmail.com | 123456 | Waiter |
| kitchenstaff@gmail.com | 123456 | Kitchen staff |
| customer1@gmail.com | 123456 | Customer |
| customer2@gmail.com | 123456 | Customer |
| customer3@gmail.com | 123456 | Customer |

---

## 🎯 Sau khi đăng nhập thành công

### Lưu token
```javascript
const token = response.data.token;
localStorage.setItem('token', token);
```

### Sử dụng token cho API khác
```
GET http://127.0.0.1:1234/api/account/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Test thêm món mới (Manager only)
```
POST http://127.0.0.1:1234/api/menu
Authorization: Bearer [TOKEN_CUA_MANAGER]
Content-Type: application/json

{
  "DishName": "Phở Bò",
  "DishType": "Main Course",
  "DishPrice": 50000
}
```
