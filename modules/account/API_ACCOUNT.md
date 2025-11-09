# API Account - Login, Logout, Register

## 1. Đăng Ký Tài Khoản Customer

### Endpoint
```
POST http://127.0.0.1:1234/api/account/register
```

### Authentication
- **Required**: NO (Public)

### Request Body (JSON)
```json
{
  "UserCode": "CUST001",
  "UserEmail": "customer@example.com",
  "UserPhone": "0123456789",
  "UserPassword": "password123",
  "Name": "Nguyễn Văn A",
  "IdentityCard": "123456789012",
  "UserAddress": "123 Đường ABC, Quận 1, TP.HCM",
  "UserImage": "avatar.jpg"
}
```

### Required Fields
- `UserCode`: Mã người dùng (3-20 ký tự)
- `UserEmail`: Email hợp lệ
- `UserPhone`: Số điện thoại (10-11 chữ số)
- `UserPassword`: Mật khẩu (tối thiểu 6 ký tự)
- `Name`: Họ tên (2-100 ký tự)
- `IdentityCard`: CMND/CCCD (9-12 chữ số)

### Optional Fields
- `UserAddress`: Địa chỉ
- `UserImage`: Tên file ảnh đại diện

### Response Success (201)
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "_id": "673f123abc...",
    "UserCode": "CUST001",
    "UserEmail": "customer@example.com",
    "UserPhone": "0123456789",
    "Name": "Nguyễn Văn A",
    "UserRole": "Customer",
    "UserAddress": "123 Đường ABC, Quận 1, TP.HCM",
    "UserImage": "avatar.jpg",
    "IsDeleted": false,
    "CreatedAt": "2025-11-09T10:30:00.000Z",
    "UpdatedAt": "2025-11-09T10:30:00.000Z"
  }
}
```

### Response Error (409)
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

---

## 2. Đăng Nhập

### Endpoint
```
POST http://127.0.0.1:1234/api/account/login
```

### Authentication
- **Required**: NO (Public)

### Request Body (JSON)
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

### Response Success (200)
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "673f123abc...",
      "UserCode": "CUST001",
      "UserEmail": "customer@example.com",
      "UserPhone": "0123456789",
      "Name": "Nguyễn Văn A",
      "UserRole": "Customer",
      "UserAddress": "123 Đường ABC, Quận 1, TP.HCM",
      "UserImage": "avatar.jpg",
      "IsDeleted": false,
      "CreatedAt": "2025-11-09T10:30:00.000Z",
      "UpdatedAt": "2025-11-09T10:30:00.000Z"
    }
  }
}
```

### Response Error (401)
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng"
}
```

### Lưu Token
Sau khi đăng nhập thành công, lưu `token` để sử dụng cho các API cần xác thực:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Đăng Xuất

### Endpoint
```
POST http://127.0.0.1:1234/api/account/logout
```

### Authentication
- **Required**: YES
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

### Request Body
Không cần body

### Response Success (200)
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

**Lưu ý**: Client cần xóa token khỏi storage (localStorage/sessionStorage)

---

## 4. Lấy Thông Tin Tài Khoản Hiện Tại

### Endpoint
```
GET http://127.0.0.1:1234/api/account/me
```

### Authentication
- **Required**: YES
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

### Response Success (200)
```json
{
  "success": true,
  "message": "Lấy thông tin tài khoản thành công",
  "data": {
    "_id": "673f123abc...",
    "UserCode": "CUST001",
    "UserEmail": "customer@example.com",
    "UserPhone": "0123456789",
    "Name": "Nguyễn Văn A",
    "UserRole": "Customer",
    "UserAddress": "123 Đường ABC, Quận 1, TP.HCM",
    "UserImage": "avatar.jpg",
    "IsDeleted": false,
    "CreatedAt": "2025-11-09T10:30:00.000Z",
    "UpdatedAt": "2025-11-09T10:30:00.000Z"
  }
}
```

---

## 5. Cập Nhật Thông Tin Tài Khoản

### Endpoint
```
PUT http://127.0.0.1:1234/api/account/profile
```

### Authentication
- **Required**: YES
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

### Request Body (JSON)
```json
{
  "Name": "Nguyễn Văn B",
  "UserPhone": "0987654321",
  "UserAddress": "456 Đường XYZ, Quận 2, TP.HCM",
  "UserImage": "new-avatar.jpg"
}
```

**Lưu ý**: Tất cả các field đều optional, chỉ gửi field cần cập nhật

### Response Success (200)
```json
{
  "success": true,
  "message": "Cập nhật thông tin thành công",
  "data": {
    "_id": "673f123abc...",
    "UserCode": "CUST001",
    "UserEmail": "customer@example.com",
    "UserPhone": "0987654321",
    "Name": "Nguyễn Văn B",
    "UserRole": "Customer",
    "UserAddress": "456 Đường XYZ, Quận 2, TP.HCM",
    "UserImage": "new-avatar.jpg",
    "IsDeleted": false,
    "CreatedAt": "2025-11-09T10:30:00.000Z",
    "UpdatedAt": "2025-11-09T11:45:00.000Z"
  }
}
```

---

## 6. Đổi Mật Khẩu

### Endpoint
```
PUT http://127.0.0.1:1234/api/account/change-password
```

### Authentication
- **Required**: YES
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

### Request Body (JSON)
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

### Response Success (200)
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

### Response Error (401)
```json
{
  "success": false,
  "message": "Mật khẩu cũ không đúng"
}
```

---

## Test Flow với Postman/Thunder Client

### Bước 1: Đăng Ký
```
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

### Bước 2: Đăng Nhập
```
POST http://127.0.0.1:1234/api/account/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

**Lưu token từ response**

### Bước 3: Test API cần xác thực
```
GET http://127.0.0.1:1234/api/account/me
Authorization: Bearer YOUR_TOKEN_HERE
```

### Bước 4: Thêm món mới (với token Manager)
```
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

## Validation Rules

### Register
| Field | Required | Type | Validation |
|-------|----------|------|------------|
| UserCode | Yes | String | 3-20 ký tự |
| UserEmail | Yes | String | Email hợp lệ |
| UserPhone | Yes | String | 10-11 chữ số |
| UserPassword | Yes | String | ≥ 6 ký tự |
| Name | Yes | String | 2-100 ký tự |
| IdentityCard | Yes | String | 9-12 chữ số |
| UserAddress | No | String | - |
| UserImage | No | String | - |

### Login
| Field | Required | Type | Validation |
|-------|----------|------|------------|
| email | Yes | String | Email hợp lệ |
| password | Yes | String | - |

### Update Profile
| Field | Required | Type | Validation |
|-------|----------|------|------------|
| Name | No | String | 2-100 ký tự |
| UserPhone | No | String | 10-11 chữ số |
| UserAddress | No | String | - |
| UserImage | No | String | - |

### Change Password
| Field | Required | Type | Validation |
|-------|----------|------|------------|
| oldPassword | Yes | String | - |
| newPassword | Yes | String | ≥ 6 ký tự, khác mật khẩu cũ |

---

## Error Codes

- **400**: Dữ liệu không hợp lệ
- **401**: Unauthorized (chưa đăng nhập hoặc token không hợp lệ)
- **403**: Forbidden (không có quyền truy cập)
- **404**: Tài khoản không tồn tại
- **409**: Conflict (email/phone/usercode đã tồn tại)
- **500**: Internal Server Error

---

## Security Notes

1. **Password**: Được mã hóa bằng bcrypt trước khi lưu vào database
2. **JWT Token**: Hết hạn sau 7 ngày
3. **Sensitive Data**: `UserPassword` và `IdentityCard` không được trả về trong response
4. **Role**: Tự động set thành "Customer" khi đăng ký
5. **Token Storage**: Client nên lưu token vào localStorage hoặc sessionStorage
